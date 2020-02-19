import { generateGuid } from "../api/util";
import { DesignEditor } from "./design-editor";
import {
  IUndoCommand,
  IContext,
  undoCommandCreated,
  UndoRedoQueue
} from "../api/undoCommand";
import { RoutedCommand, undoCommand, redoCommand } from "../api/routedCommands";

export class DesignApp extends HTMLElement {
  private editor: DesignEditor;

  private readonly undoRedoQueue = new UndoRedoQueue();

  constructor() {
    super();

    undoCommandCreated.addListener(this, command =>
      this.onUndoEventGenerated(command)
    );

    let listener = RoutedCommand.createListener(this);
    listener.set(undoCommand, () => this.doUndo());
    listener.set(redoCommand, () => this.doRedo());
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
    let container = this.editor.getActiveControlContainer();
    if (container != null) {
      this.editor.removeControl(container.uniqueId);
    }
  }

  public onUndoEventGenerated(command: IUndoCommand) {
    this.undoRedoQueue.addUndo(this.getContext(), command);
    return true;
  }

  private getContext(): IContext {
    return {
      editor: this.editor
    };
  }

  doUndo() {
    this.undoRedoQueue.undo(this.getContext());
  }

  doRedo() {
    this.undoRedoQueue.redo(this.getContext());
  }

  private isInited: boolean;

  public connectedCallback() {
    if (this.isInited) {
      return;
    }

    this.isInited = true;

    // TODO replace this with something like https://wangchujiang.com/hotkeys/
    {
      this.tabIndex = 0;
      this.focus();

      window.addEventListener("keydown", evt => {
        if (evt.ctrlKey && evt.key == "z") {
          undoCommand.trigger(document.activeElement as HTMLElement);
          evt.preventDefault();
        } else if (evt.ctrlKey && evt.key == "y") {
          redoCommand.trigger(document.activeElement as HTMLElement);
          evt.preventDefault();
        }
      });
    }

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
