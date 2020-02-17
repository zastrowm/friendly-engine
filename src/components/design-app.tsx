import { generateGuid } from "../api/util";
import {
  IUndoCommand,
  IContext,
  addUndoEventListener
} from "../api/undoCommand";
import { DesignEditor } from "./design-editor";

class UndoRedoQueue {
  private readonly undoQueue: IUndoCommand[] = [];
  private readonly redoQueue: IUndoCommand[] = [];

  public addUndo(command: IUndoCommand) {
    this.undoQueue.push(command);
    this.redoQueue.splice(0, this.redoQueue.length);
  }

  public async undo(context: IContext): Promise<void> {
    if (this.undoQueue.length == 0) {
      return;
    }

    let command = this.undoQueue.pop();
    await command.undo(context);
    this.redoQueue.push(command);
  }
  public async redo(context: IContext): Promise<void> {
    if (this.redoQueue.length == 0) {
      return;
    }

    let command = this.redoQueue.pop();
    await command.redo(context);
    this.undoQueue.push(command);
  }
}

export class DesignApp extends HTMLElement {
  private editor: DesignEditor;

  private readonly undoRedoQueue = new UndoRedoQueue();

  constructor() {
    super();

    addUndoEventListener(this, command => this.onUndoEventGenerated(command));
  }

  async addButton() {
    this.editor.addControl("button", generateGuid(), {
      left: 20,
      top: 20,
      width: 40,
      height: 60
    });
  }

  async deleteCurrent() {
    let container = this.editor.helpers.getActive();
    if (container != null) {
      this.editor.removeControl(container.uniqueId);
    }
  }

  public onUndoEventGenerated(command: IUndoCommand) {
    this.undoRedoQueue.addUndo(command);
    return true;
  }

  private getContext(): IContext {
    return {
      editor: this.editor
    };
  }

  async doUndo() {
    this.undoRedoQueue.undo(this.getContext());
  }

  async doRedo() {
    this.undoRedoQueue.redo(this.getContext());
  }

  private isInited: boolean;

  public connectedCallback() {
    if (this.isInited) {
      return;
    }

    this.isInited = true;

    let create = function(type: any, text?: any, click?: any): HTMLElement {
      let element = document.createElement(type) as HTMLElement;
      if (text != null) {
        element.textContent = text;
      }

      if (click != null) {
        element.addEventListener("click", click);
      }

      return element;
    };

    let div = create("div");

    let header = create("header");
    header.appendChild(create("h1", "Web HMI Builder"));
    header.appendChild(create("button", "Add New", () => this.addButton()));
    header.appendChild(create("button", "Delete", () => this.deleteCurrent()));
    header.appendChild(create("button", "Undo", () => this.doUndo()));
    header.appendChild(create("button", "Redo", () => this.doRedo()));
    div.appendChild(header);

    let main = create("main");
    let div2 = create("div");
    this.editor = document.createElement("design-editor") as DesignEditor;
    div2.appendChild(this.editor);
    main.appendChild(div2);
    div.appendChild(main);

    this.appendChild(div);

    this.editor.addControl("button", "first", {
      left: 20,
      top: 70,
      width: 100,
      height: 100
    });
    this.editor.addControl("button", "second", {
      right: 20,
      top: 100,
      width: 100,
      height: 100
    });
  }
}

window.customElements.define("design-app", DesignApp);
