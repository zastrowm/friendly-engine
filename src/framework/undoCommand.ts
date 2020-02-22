import { DesignEditor } from "../components/design-editor";
import { RoutedEventDescriptor } from "./routedEvents";

/**
 * An command that can be undone/redone as part of an undo/redo queue.
 */
export interface IUndoCommand {
  /**
   * Undoes the operation that was originally performed
   */
  undo(context: IContext): void | Promise<void>;

  /**
   * Redoes the operation that was originally performed
   */
  redo(context: IContext): void | Promise<void>;

  /**
   * If present, indicates the operation that should be performed when the action
   * is added to the undo queue.
   */
  do?: (context: IContext) => void | Promise<void>;

  /**
   * Checks if, and does a merges the given command into the current command, mutating
   * the state of the *this* object.
   *
   * @param rhs the command to attempt to merge into this one
   * @returns true if the command was merged, false if it was not
   */
  tryMerge?: (rhs: IUndoCommand) => boolean;
}

export interface IContext {
  editor: DesignEditor;
}

/**
 * Represents a queue of commands that can be done/undone.
 */
export class UndoRedoQueue {
  private readonly undoQueue: IUndoCommand[] = [];
  private readonly redoQueue: IUndoCommand[] = [];

  /**
   * Adds an undo action to the queue.  If the undo action has a .do method, it will
   * be invoked.  This operation clears the redo queue.
   *
   * @param context the context to use if `.do` is present
   * @param command the command to add the queue
   */
  public async addUndo(context: IContext, command: IUndoCommand) {
    if (command.do != null) {
      await command.do(context);
    }

    this.undoQueue.push(command);
    this.redoQueue.splice(0, this.redoQueue.length);
  }

  /**
   * Calls `IUndoCommand.undo()` on the first command in the undo queue
   */
  public async undo(context: IContext): Promise<void> {
    if (this.undoQueue.length == 0) {
      return;
    }

    let command = this.undoQueue.pop();
    await command.undo(context);
    this.redoQueue.push(command);
  }

  /**
   * Calls `IUndoCommand.redo()` on the first command in the redo queue
   */
  public async redo(context: IContext): Promise<void> {
    if (this.redoQueue.length == 0) {
      return;
    }

    let command = this.redoQueue.pop();
    await command.redo(context);
    this.undoQueue.push(command);
  }
}

/** The routed event for undo commands being created. */
export let undoCommandCreated = new RoutedEventDescriptor<IUndoCommand>({
  id: "undoEventGenerated",
  mustBeHandled: true
});
