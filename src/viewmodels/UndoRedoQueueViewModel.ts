import { action, computed, observable } from "mobx";

interface IContextProvider {
  context: IContext;
}

interface IDateInfoProvider {
  dateInfo: IDateInfo;
}

interface IDateInfo {
  isLastModifiedWithinMs(amount: number): boolean;
  isOriginalCreationWithinMs(amount: number): boolean;
}

class DateInfo implements IDateInfo {
  constructor(private undoEntry: UndoEntry<any>) {
    this._now = Date.now();
  }

  private readonly _now: number;

  isLastModifiedWithinMs(amount: number): boolean {
    let diff = this._now - this.undoEntry.dateModified;
    return diff < amount;
  }

  isOriginalCreationWithinMs(amount: number): boolean {
    let diff = this._now - this.undoEntry.dateAdded;
    return diff < amount;
  }
}

/**
 * An callback that generates undo/redo callbacks that performs undo/redo as part of an undo/redo queue.
 */
interface UndoableFunctionCallback<T> {
  (): IUndoCallbackDefinition<T>;
}

/**
 * The callbacks required to be implemented for an undo/redo handler.
 *
 * The *this* argument of the callbacks is special - it provides both the data of `T` and the undo/redo context
 * as if they were member data - this is to facilitate writing undo/redo handlers without the need to declare
 * an excessive number of arguments.
 *
 * With the exception of TryMerge, no function should attempt to write data to *this* as it will not be persisted.
 */
interface IUndoCallbackDefinition<T> {
  /**
   * Provides any default values for properties on this object
   */
  initialize?: (this: IUndoCallbackThisType<T>) => void | Promise<void>;

  /**
   * Undoes the operation that was originally performed
   */
  undo: (this: IUndoCallbackThisType<T>) => void | Promise<void>;

  /**
   * Redoes the operation that was originally performed
   */
  redo: (this: IUndoCallbackThisType<T>) => void | Promise<void>;

  /**
   * If present, indicates the operation that should be performed when the action
   * is added to the undo queue.
   */
  do?: (this: IUndoCallbackThisType<T>) => void | Promise<void>;

  /**
   * Checks if, and does a merges the given command into the current command, mutating
   * the state of the *this* object.
   *
   * @param rhs the command to attempt to merge into this one
   * @returns true if the command was merged, false if it was not
   */
  tryMerge?: (this: IUndoCallbackThisType<T> & IDateInfoProvider, rhs: T) => boolean;
}

/**
 * Type helper to provide the type of *this* for the undo/redo callbacks.
 */
declare type IUndoCallbackThisType<T> = T & IContextProvider & IUndoCallbackDefinition<T>;

export interface IContext {}

/**
 * Represents a queue of commands that can be done/undone.
 */
export class UndoRedoQueueViewModel {
  @observable
  private readonly undoQueue: UndoEntry<any>[] = [];
  @observable
  private readonly redoQueue: UndoEntry<any>[] = [];

  private readonly context: IContext;

  constructor(context: IContext) {
    this.context = context;
  }

  /**
   * True if we can currently undo the last operation that was done
   */
  @computed
  public get canUndo(): boolean {
    return this.undoQueue.length > 0;
  }

  /**
   * True if we can currently redo the last operation that was undone.
   */
  @computed
  public get canRedo(): boolean {
    return this.redoQueue.length > 0;
  }

  /**
   * Adds an undo action to the queue.  If the undo action has a .do method, it will
   * be invoked.  This operation clears the redo queue.
   *
   * @param command the undo descriptor to be added to the queue
   * @param data the data for the descriptor
   */
  @action
  public add<T>(command: ICommandCreator<T>, data: T) {
    let undoEntry = new UndoEntry<T>(command as CommandCreator<T>, data);
    undoEntry.initialize(this.context);

    undoEntry.do(this.context);

    if (this.undoQueue.length > 0) {
      let last = this.undoQueue[this.undoQueue.length - 1];
      if (last.handler === undoEntry.handler && last.tryMerge(this.context, undoEntry)) {
        return;
      }
    }

    this.undoQueue.push(undoEntry);
    this.redoQueue.splice(0, this.redoQueue.length);
  }

  /**
   * Calls `IUndoCommand.undo()` on the first command in the undo queue
   */
  @action
  public async undo(): Promise<void> {
    if (!this.canUndo) {
      return;
    }

    let undoEntry = this.undoQueue.pop()!;
    undoEntry.undo(this.context);
    this.redoQueue.push(undoEntry);
  }

  /**
   * Calls `IUndoCommand.redo()` on the first command in the redo queue
   */
  @action
  public async redo(): Promise<void> {
    if (!this.canRedo) {
      return;
    }

    let redoEntry = this.redoQueue.pop()!;
    redoEntry.redo(this.context);
    this.undoQueue.push(redoEntry);
  }

  /**
   * Clears the undo/redo queue
   */
  @action
  public clear() {
    this.redoQueue.length = 0;
    this.undoQueue.length = 0;
  }
}

export interface IUndoEntry {}

// NOTE: the implementation of the undo entry methods are bit complicated do the nature of IUndoCallbackDefinition<T>.
//       in that the "this" object does not actually exist and is created on demand as needed.  See
//       IUndoCallbackDefinition for in-depth explanation of the "this" for callbacks
class UndoEntry<T> implements IUndoEntry {
  constructor(handler: CommandCreator<T>, data: T) {
    this.dateAdded = Date.now();
    this.dateModified = this.dateAdded;
    this.handler = handler;
    this.data = data;
  }

  dateAdded: number;
  dateModified: number;
  handler: CommandCreator<T>;
  data: T;

  getSelf(context: IContext, undoDefinition: IUndoCallbackDefinition<T>): IUndoCallbackThisType<T> {
    /* @ts-ignore - the type type is created manually, so tsc has difficulty with it */
    return { context: context, ...undoDefinition, ...this.data };
  }

  initialize(context: IContext) {
    let undoDefinition = this.handler.callback();
    let initializeCallback = undoDefinition.initialize;
    if (initializeCallback != null) {
      initializeCallback.apply(this.getSelf(context, undoDefinition));
    }
  }

  do(context: IContext) {
    let undoDefinition = this.handler.callback();
    let doCallback = undoDefinition.do;
    if (doCallback != null) {
      doCallback.apply(this.getSelf(context, undoDefinition));
    }
  }

  redo(context: IContext) {
    let undoDefinition = this.handler.callback();
    let redoCallback = undoDefinition.redo;
    redoCallback.apply(this.getSelf(context, undoDefinition));
  }

  undo(context: IContext) {
    let undoDefinition = this.handler.callback();
    let undoCallback = undoDefinition.undo;
    undoCallback.apply(this.getSelf(context, undoDefinition));
  }

  tryMerge(context: IContext, rhs: UndoEntry<T>): boolean {
    // Try merge is a special case, because we allow the internal state of the undo object to be modified
    // (if we did not, there would be no point in offering try-merge), and thus we create a proxy instead
    // of the concrete object so that any writes are persisted back into the object
    let undoDefinition = this.handler.callback();
    let tryMerge = undoDefinition.tryMerge;
    if (tryMerge == null) {
      return false;
    }

    let additional: IContextProvider & IDateInfoProvider = {
      context: context,
      dateInfo: new DateInfo(this),
      ...undoDefinition,
    };

    let self = this.createProxy(additional);
    return tryMerge.apply(self, [rhs.data]) as boolean;
  }

  createProxy(secondary: any) {
    let secondarySource = this.data as any;

    return new Proxy(secondarySource, {
      get(_, prop) {
        if (prop in secondarySource) {
          return secondarySource[prop];
        } else if (prop in secondary) {
          return secondary[prop];
        } else {
          return undefined;
        }
      },

      set(_, prop, value) {
        secondarySource[prop] = value;
        return true;
      },
    });
  }
}

interface ICommandCreator<T> {
  id: string;
}

class CommandCreator<T> implements ICommandCreator<T> {
  constructor(public id: string, public callback: UndoableFunctionCallback<T>) {}
}

let undoHandlers = new Map<string, ICommandCreator<any>>();

export function registerUndoHandler<T>(id: string, callback: UndoableFunctionCallback<T>): ICommandCreator<T> {
  let handler = new CommandCreator(id, callback);
  undoHandlers.set(id, handler);
  return handler;
}
