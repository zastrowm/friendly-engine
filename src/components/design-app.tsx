import { DesignEditor } from './design-editor';

import { IUndoCommand, IContext, undoCommandCreated, UndoRedoQueue } from '../framework/undoCommand';
import { appRoutedCommands, RoutedCommand } from '../framework/appRoutedCommands';
import { registerShortcuts } from '../app/keyboardShortcuts';
import { controlDescriptors, IControlDescriptor } from '../framework/controlsRegistry';
import { CustomHtmlElement } from '../../lib/friendlee/CustomHtmlElement';
import { h } from 'preact';

export class DesignApp extends CustomHtmlElement {
  private editor: DesignEditor;

  private readonly undoRedoQueue = new UndoRedoQueue();

  constructor() {
    super();

    undoCommandCreated.addListener(this, command => this.onUndoEventGenerated(command));

    let listener = RoutedCommand.createListener(this);
    listener.set(appRoutedCommands.undo, () => this.doUndo());
    listener.set(appRoutedCommands.redo, () => this.doRedo());
    listener.set(appRoutedCommands.delete, () => this.deleteCurrent());

    controlDescriptors.addChangeListener(() => this.onControlsChange());
  }

  private addControl(descriptor: IControlDescriptor) {
    let newControl = this.editor.addControl(descriptor);
    this.editor.selectAndMarkActive(newControl);
  }

  public deleteCurrent() {
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
      editor: this.editor,
    };
  }

  private onControlsChange(): void {
    this.reRender();
  }

  doUndo() {
    this.undoRedoQueue.undo(this.getContext());
  }

  doRedo() {
    this.undoRedoQueue.redo(this.getContext());
  }

  public onFirstConnected() {
    {
      this.tabIndex = 0;
      this.focus();

      registerShortcuts();
    }

    this.reRender();

    let buttonDescriptor = controlDescriptors.getDescriptor('button');
    this.editor.addControl(buttonDescriptor, {
      left: 20,
      top: 70,
      width: 100,
      height: 100,
    });
    this.editor.addControl(buttonDescriptor, {
      right: 20,
      top: 100,
      width: 100,
      height: 100,
    });
  }

  /* Builds the render tree for this element */
  private reRender() {
    this.renderJsx(
      <div>
        <header>
          <h1>Web HMI Builder</h1>
          {/* Render each control as a button that inserts it */}
          {Array.from(controlDescriptors.getDescriptors()).map(d => (
            <button onClick={() => this.addControl(d)}>Add {d.id}</button>
          ))}
          <button onClick={() => this.deleteCurrent()}>Delete</button>
          <button onClick={() => this.doUndo()}>Undo</button>
          <button onClick={() => this.doRedo()}>Redo</button>
        </header>
        <main>
          <div>
            <design-editor ref={it => (this.editor = it)} />
          </div>
        </main>
      </div>,
    );
  }

  /* Gets the styling for this component */
  protected getInlineStyle() {
    return /*css*/ `
      h1 {
        font-size: 1.4rem;
        font-weight: 500;
        color: #fff;
        padding: 0 12px;
      }

      design-app div {
        display: grid;

        grid-template-rows: auto 1fr;
        grid-template-columns: auto;

        grid-template-areas:
          'header'
          'main';

        position: absolute;
        top: 0px;
        bottom: 0px;
        right: 0px;
        left: 0px;
      }

      design-app div header {
        background: #ff6a2b;
        color: white;
        height: 56px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);

        grid-area: header;
      }
      design-app div main {
        grid-area: main;
        position: relative;
        overflow: scroll;
      }

      design-app div main > div {
        height: 100%;
      }
    `;
  }
}

window.customElements.define('design-app', DesignApp);
