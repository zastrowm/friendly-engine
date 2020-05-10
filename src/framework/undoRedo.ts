import { RoutedEventDescriptor } from './routedEvents';

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
    this.now = Date.now();
  }

  private now: number;

  isLastModifiedWithinMs(amount: number): boolean {
    let diff = this.now - this.undoEntry.dateModified;
    return diff < amount;
  }

  isOriginalCreationWithinMs(amount: number): boolean {
    let diff = this.now - this.undoEntry.dateAdded;
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
export class UndoRedoQueue {
  private readonly undoQueue: UndoEntry<any>[] = [];
  private readonly redoQueue: UndoEntry<any>[] = [];

  /**
   * Adds an undo action to the queue.  If the undo action has a .do method, it will
   * be invoked.  This operation clears the redo queue.
   *
   * @param context the context to use if `.do` is present
   * @param command the command to add the queue
   */
  public async addUndo(context: IContext, newEntry: IUndoEntry) {
    let undoEntry = newEntry as UndoEntry<any>;
    undoEntry.initialize(context);

    undoEntry.do(context);

    if (this.undoQueue.length > 0) {
      let last = this.undoQueue[this.undoQueue.length - 1];
      if (last.handler == undoEntry.handler && last.tryMerge(context, undoEntry)) {
        return;
      }
    }

    this.undoQueue.push(undoEntry);
    this.redoQueue.splice(0, this.redoQueue.length);
  }

  /**
   * Calls `IUndoCommand.undo()` on the first command in the undo queue
   */
  public async undo(context: IContext): Promise<void> {
    if (this.undoQueue.length == 0) {
      return;
    }

    let undoEntry = this.undoQueue.pop();
    await undoEntry.undo(context);
    this.redoQueue.push(undoEntry);
  }

  /**
   * Calls `IUndoCommand.redo()` on the first command in the redo queue
   */
  public async redo(context: IContext): Promise<void> {
    if (this.redoQueue.length == 0) {
      return;
    }

    let redoEntry = this.redoQueue.pop();
    await redoEntry.redo(context);
    this.undoQueue.push(redoEntry);
  }

  /**
   * Clears the undo/redo queue
   */
  public clear() {
    this.redoQueue.length = 0;
    this.undoQueue.length = 0;
  }
}

/** The routed event for undo commands being created. */
export let undoCommandCreated = new RoutedEventDescriptor<IUndoEntry>({
  id: 'undoEventGenerated',
  mustBeHandled: true,
});

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

  initialize(context: IContext) {
    let undoDefinition = this.handler.callback();
    let initializeCallback = undoDefinition.initialize;
    if (initializeCallback != null) {
      let self: T & IContextProvider = { context: context, ...undoDefinition, ...this.data };
      initializeCallback.apply(self);
    }
  }

  do(context: IContext) {
    let undoDefinition = this.handler.callback();
    let doCallback = undoDefinition.do;
    if (doCallback != null) {
      let self: T & IContextProvider = { context: context, ...undoDefinition, ...this.data };
      doCallback.apply(self);
    }
  }

  redo(context: IContext) {
    let undoDefinition = this.handler.callback();
    let redoCallback = undoDefinition.redo;
    let self: T & IContextProvider = { context: context, ...undoDefinition, ...this.data };
    redoCallback.apply(self);
  }

  undo(context: IContext) {
    let undoDefinition = this.handler.callback();
    let undoCallback = undoDefinition.undo;
    let self: T & IContextProvider = { context: context, ...undoDefinition, ...this.data };
    undoCallback.apply(self);
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
  trigger(element: HTMLElement, data: T);
}

class CommandCreator<T> implements ICommandCreator<T> {
  constructor(public id: string, public callback: UndoableFunctionCallback<T>) {}

  trigger(element: HTMLElement, data: T) {
    let undoEntry = new UndoEntry<T>(this, data);
    undoCommandCreated.trigger(element, undoEntry);
  }
}

let undoHandlers = new Map<string, ICommandCreator<any>>();

export function registerUndoHandler<T>(id: string, callback: UndoableFunctionCallback<T>): ICommandCreator<T> {
  let handler = new CommandCreator(id, callback);
  undoHandlers.set(id, handler);
  return handler;
}
