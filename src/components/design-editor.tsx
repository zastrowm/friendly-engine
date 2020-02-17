import { IStoredPositionInfo } from "../api/layout";
import { IUndoCommand, IContext, fireUndoEvent } from "../api/undoCommand";
import { ControlContainer } from "./control-container";
import { ControlEditor } from "./control-editor";

export class DesignEditor extends HTMLElement {
  public helpers: {
    selectAndMarkActive: (
      control: ControlContainer,
      mouseEvent?: MouseEvent
    ) => void;
    getControlContainer: (id: string) => ControlContainer;
    getActive: () => ControlContainer;
  };

  public api: DesignEditor;

  private activeEditor: ControlEditor;

  constructor() {
    super();

    // TODO handle failures
    this.api = this;

    this.activeEditor = document.createElement(
      "control-editor"
    ) as ControlEditor;
    this.helpers = {
      selectAndMarkActive: (c, m) => this.selectAndMarkActive(c, m),
      getControlContainer: id => this.getControlContainer(id),
      getActive: () => this.getActiveControlContainer()
    };
  }

  private getActiveControlContainer(): ControlContainer {
    return this.activeEditor.parentElement as ControlContainer;
  }

  private getControlContainer(id: string): ControlContainer {
    let query = `control-container[unique-id='${id}']`;
    let container: ControlContainer = this.querySelector(query);
    if (container == null) {
      console.log("using slow search");
      let containers = this.querySelectorAll("control-container");
      for (let container of containers) {
        if (container.uniqueId == id) {
          return container;
        }
      }
    }

    return container;
  }

  private selectAndMarkActive(
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

  public addControl(type: string, id: string, layoutInfo: IStoredPositionInfo) {
    this.addControlNoUndo(type, id, layoutInfo);
    fireUndoEvent(this, new UndoAddCommand(type, id, layoutInfo));
  }

  public addControlNoUndo(
    type: string,
    id: string,
    layoutInfo: IStoredPositionInfo
  ) {
    let controlContainer = document.createElement("control-container");
    controlContainer.uniqueId = id;
    controlContainer.positionInfo = layoutInfo;
    controlContainer.controlType = type;

    let nestedControl = document.createElement(type);
    nestedControl.textContent = "This is a " + type;
    controlContainer.appendChild(nestedControl);

    this.appendChild(controlContainer);
  }

  public removeControl(id: string) {
    let container = this.getControlContainer(id);

    let type = container.controlType;
    let layoutInfo = container.positionInfo;

    this.removeControlNoUndo(id);

    fireUndoEvent(this, new UndoRemoveCommand(type, id, layoutInfo));
  }

  public removeControlNoUndo(id: string) {
    let container = this.getControlContainer(id);
    this.removeChild(container);
  }
}

class UndoAddCommand implements IUndoCommand {
  constructor(
    private type: string,
    private id: string,
    private position: IStoredPositionInfo
  ) {}

  async undo(context: IContext): Promise<void> {
    await context.editor.removeControlNoUndo(this.id);
  }

  async redo(context: IContext): Promise<void> {
    await context.editor.addControlNoUndo(this.type, this.id, this.position);
    let container = context.editor.helpers.getControlContainer(this.id);
    context.editor.helpers.selectAndMarkActive(container);
  }
}

class UndoRemoveCommand implements IUndoCommand {
  constructor(
    private type: string,
    private id: string,
    private position: IStoredPositionInfo
  ) {}

  async undo(context: IContext): Promise<void> {
    await context.editor.addControlNoUndo(this.type, this.id, this.position);
    let container = context.editor.helpers.getControlContainer(this.id);
    context.editor.helpers.selectAndMarkActive(container);
  }

  async redo(context: IContext): Promise<void> {
    await context.editor.removeControlNoUndo(this.id);
  }
}

console.log("Defining Design Editor");
window.customElements.define("design-editor", DesignEditor);
