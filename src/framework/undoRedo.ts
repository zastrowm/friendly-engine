import { DesignSurfaceElement } from '../components/design/design-surface';
import { RoutedEventDescriptor } from './routedEvents';

interface IContextProvider {
  context: IContext;
}

/**
 * An callback that generates undo/redo callbacks that performs undo/redo as part of an undo/redo queue.
 */
interface UndoableFunctionCallback<T> {
  (): {
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
    tryMerge?: (this: T & IContextProvider, rhs: T & IContextProvider) => boolean;
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
  public async addUndo(context: IContext, undoData: IUndoEntry) {
    let actual = undoData as UndoEntry<any>;
    actual.do(context);

    this.undoQueue.push(actual);
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
    this.dateAdded = new Date();
    this.dateModified = new Date();
    this.handler = handler;
    this.data = data;
  }

  dateAdded: Date;
  dateModified: Date;
  handler: CommandCreator<T>;
  data: T;

  do(context: IContext) {
    let cbs = this.handler.callback();
    if (cbs.do != null) {
      let self: T & IContextProvider = { context: context, ...this.data };
      cbs.do.apply(self);
    }
  }

  redo(context: IContext) {
    let cbs = this.handler.callback();
    let self: T & IContextProvider = { context: context, ...this.data };
    cbs.redo.apply(self);
  }

  undo(context: IContext) {
    let cbs = this.handler.callback();
    let self: T & IContextProvider = { context: context, ...this.data };
    console.log('UNDO', self);
    cbs.undo.apply(self);
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
