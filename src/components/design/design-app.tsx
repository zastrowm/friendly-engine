import { Component, h, Listen, State, Element } from '@stencil/core';
import { generateGuid } from '../../api/util';
import { IUndoCommand, IContext } from '../../api/undoCommand';

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

@Component({
  tag: 'design-app',
  styleUrl: 'design-app.css',
})
export class DesignApp {
  @State() private hasRendered: boolean;

  @Element()
  private host: HTMLElement;

  private editor: HTMLDesignEditorElement;

  private readonly undoRedoQueue = new UndoRedoQueue();

  constructor() {}

  async addButton() {
    await this.editor.addControl('button', generateGuid(), {
      left: 20,
      top: 20,
      width: 40,
      height: 60,
    });
  }

  async deleteCurrent() {
    let container = this.editor.helpers.getActive();
    if (container != null) {
      this.editor.removeControl(container.uniqueId);
    }
  }

  @Listen('undoEventGenerated')
  public async onUndoEventGenerated(event: CustomEvent<IUndoCommand>) {
    this.undoRedoQueue.addUndo(event.detail as IUndoCommand);
  }

  private getContext(): IContext {
    return {
      editor: this.editor,
    };
  }

  async doUndo() {
    await this.undoRedoQueue.undo(this.getContext());
  }

  async doRedo() {
    await this.undoRedoQueue.redo(this.getContext());
  }

  public render() {
    return (
      <div>
        <header>
          <h1>Web HMI Builder</h1>
          <button onClick={() => this.addButton()}>Add New</button>
          <button onClick={() => this.deleteCurrent()}>Delete</button>
          <button onClick={() => this.doUndo()}>Undo</button>
          <button onClick={() => this.doRedo()}>Redo</button>
        </header>

        <main>
          <div>
            <design-editor ref={el => (this.editor = el as any)} />
          </div>
        </main>
      </div>
    );
  }

  async componentDidRender() {
    if (this.hasRendered) {
      return;
    }

    await this.editor.addControl('button', 'first', {
      left: 20,
      top: 70,
      width: 100,
      height: 100,
    });
    await this.editor.addControl('button', 'second', {
      right: 20,
      top: 100,
      width: 100,
      height: 100,
    });

    this.hasRendered = true;
  }
}
