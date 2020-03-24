import { DesignSurfaceElement } from '../components/design/design-surface.e';
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
  (): {
    /**
     * Provides any default values for properties on this object
     */
    initialize?: (this: T & IContextProvider) => void | Promise<void>;

    /**
     * Undoes the operation that was originally performed
     */
    undo: (this: T & IContextProvider) => void | Promise<void>;

    /**
     * Redoes the operation that was originally performed
     */
    redo: (this: T & IContextProvider) => void | Promise<void>;

    /**
     * If present, indicates the operation that should be performed when the action
     * is added to the undo queue.
     */
    do?: (this: T & IContextProvider) => void | Promise<void>;

    /**
     * Checks if, and does a merges the given command into the current command, mutating
     * the state of the *this* object.
     *
     * @param rhs the command to attempt to merge into this one
     * @returns true if the command was merged, false if it was not
     */
    tryMerge?: (this: T & IContextProvider & IDateInfoProvider, rhs: T) => boolean;
  };
}

export interface IContext {
  editor: DesignSurfaceElement;
}

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
}

/** The routed event for undo commands being created. */
export let undoCommandCreated = new RoutedEventDescriptor<IUndoEntry>({
  id: 'undoEventGenerated',
  mustBeHandled: true,
});

export interface IUndoEntry {}

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
    let initializeCallback = this.handler.callback().initialize;
    if (initializeCallback != null) {
      let self: T & IContextProvider = { context: context, ...this.data };
      initializeCallback.apply(self);
    }
  }

  do(context: IContext) {
    let doCallback = this.handler.callback().do;
    if (doCallback != null) {
      let self: T & IContextProvider = { context: context, ...this.data };
      doCallback.apply(self);
    }
  }

  redo(context: IContext) {
    let redoCallback = this.handler.callback().redo;
    let self: T & IContextProvider = { context: context, ...this.data };
    redoCallback.apply(self);
  }

  undo(context: IContext) {
    let undoCallback = this.handler.callback().undo;
    let self: T & IContextProvider = { context: context, ...this.data };
    undoCallback.apply(self);
  }

  tryMerge(context: IContext, rhs: UndoEntry<T>): boolean {
    let tryMerge = this.handler.callback().tryMerge;
    if (tryMerge == null) {
      return false;
    }

    let additional: IContextProvider & IDateInfoProvider = {
      context: context,
      dateInfo: new DateInfo(this),
    };

    let self = this.createProxy(additional);
    return tryMerge.apply(self, [rhs.data]) as boolean;
  }

  createProxy(secondary: any) {
    let primary = this.data as any;

    return new Proxy(primary, {
      get(_, prop) {
        if (prop in primary) {
          return primary[prop];
        } else if (prop in secondary) {
          return secondary[prop];
        } else {
          return undefined;
        }
      },

      set(_, prop, value) {
        primary[prop] = value;
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
