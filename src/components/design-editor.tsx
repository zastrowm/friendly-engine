import { IStoredPositionInfo, snapLayout } from "../api/layout";
import { IUndoCommand, IContext, undoCommandCreated } from "../api/undoCommand";
import { ControlContainer } from "./control-container";
import { ControlEditor } from "./control-editor";

export class DesignEditor extends HTMLElement {
  private activeEditor: ControlEditor;

  constructor() {
    super();

    this.activeEditor = document.createElement("control-editor");
  }

  /** Determines the grid-snap for the controls */
  public gridSnap = 8;

  /** obvious */
  public getActiveControlContainer(): ControlContainer {
    return this.activeEditor.parentElement as ControlContainer;
  }

  /** obvious */
  public getControlContainer(id: string): ControlContainer {
    let query = `control-container[unique-id='${id}']`;
    let container: ControlContainer = this.querySelector(query);
    return container;
  }

  /**
   * Sets the given control to be the actively selected control
   * @param control The control which should be marked as the active control
   * @param mouseEvent (optional) the mouse event that triggered the operation
   */
  public selectAndMarkActive(
    control: ControlContainer,
    mouseEvent?: MouseEvent
  ) {
    if (control == null) {
      throw new Error("Control cannot be null");
    }

    let activeEditor = this.activeEditor;
    if (activeEditor.parentElement == control) {
      return false;
    }

    console.log(`Transfering focus to: ${control.uniqueId}`);
    control.appendChild(this.activeEditor);

    if (mouseEvent != null) {
      mouseEvent.preventDefault();
      activeEditor.transferMouseDown(mouseEvent);
    }

    return true;
  }

  public addControl(
    type: string,
    id: string,
    layoutInfo: IStoredPositionInfo
  ): ControlContainer {
    snapLayout(layoutInfo, this.gridSnap);

    let container = this.addControlNoUndo(type, id, layoutInfo);
    undoCommandCreated.trigger(this, new UndoAddCommand(type, id, layoutInfo));
    return container;
  }

  /**
   * Adds a control to the design surface without adding an undo event for it.
   * @param type the type of control to add
   * @param id the unique id of the control
   * @param layoutInfo the initial position information of the control
   */
  public addControlNoUndo(
    type: string,
    id: string,
    layoutInfo: IStoredPositionInfo
  ): ControlContainer {
    let controlContainer = document.createElement("control-container");
    controlContainer.uniqueId = id;
    controlContainer.positionInfo = layoutInfo;
    controlContainer.controlType = type;

    let nestedControl = document.createElement(type);
    nestedControl.textContent = "This is a " + type;
    controlContainer.appendChild(nestedControl);

    this.appendChild(controlContainer);

    return controlContainer;
  }

  public removeControl(id: string) {
    let container = this.getControlContainer(id);

    let type = container.controlType;
    let layoutInfo = container.positionInfo;

    this.removeControlNoUndo(id);

    undoCommandCreated.trigger(
      this,
      new UndoRemoveCommand(type, id, layoutInfo)
    );
  }

  /**
   * Removes a control from the design surface without adding an undo event.
   * @param id the unique id of the control to remove
   */
  public removeControlNoUndo(id: string) {
    let container = this.getControlContainer(id);
    this.removeChild(container);
  }
}

/**
 * Undo event for adding a control to the design surface.
 */
class UndoAddCommand implements IUndoCommand {
  constructor(
    private type: string,
    private id: string,
    private position: IStoredPositionInfo
  ) {}

  undo(context: IContext): void {
    context.editor.removeControlNoUndo(this.id);
  }

  redo(context: IContext): void {
    let container = context.editor.addControlNoUndo(
      this.type,
      this.id,
      this.position
    );
    context.editor.selectAndMarkActive(container);
  }
}

/**
 * Undo event for removing a control from the design surface.
 */
class UndoRemoveCommand implements IUndoCommand {
  constructor(
    private type: string,
    private id: string,
    private position: IStoredPositionInfo
  ) {}

  undo(context: IContext): void {
    let container = context.editor.addControlNoUndo(
      this.type,
      this.id,
      this.position
    );
    context.editor.selectAndMarkActive(container);
  }

  redo(context: IContext): void {
    context.editor.removeControlNoUndo(this.id);
  }
}

window.customElements.define("design-editor", DesignEditor);
