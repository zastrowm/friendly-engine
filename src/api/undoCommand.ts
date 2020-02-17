import { DesignEditor } from "../components/design-editor";

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

const undoEventName = "undoEventGenerated";

export function fireUndoEvent(element: HTMLElement, undoCommand: IUndoCommand) {
  element.dispatchEvent(
    new CustomEvent(undoEventName, {
      bubbles: true,
      detail: undoCommand
    })
  );
}

export function addUndoEventListener(
  element: HTMLElement,
  callback: (undoCommand: IUndoCommand) => boolean
) {
  element.addEventListener(undoEventName, function(
    evt: CustomEvent<IUndoCommand>
  ) {
    let command = evt.detail;
    let didHandle = callback(command);
    if (didHandle) {
      evt.preventDefault();
    }
  });
}
