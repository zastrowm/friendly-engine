import { DesignSurfaceElement, selectedControlChanges } from './design-surface.e';

import { IContext, undoCommandCreated, UndoRedoQueue, IUndoEntry } from '../../framework/undoRedo';
import { appRoutedCommands, RoutedCommand } from '../../framework/appRoutedCommands';
import { registerShortcuts } from '../../app/keyboardShortcuts';
import { h } from 'preact';
import { ControlContainer } from './control-container.e';

import './design-app.css';
import { PropertyPanelElement } from './property-panel.e';
import { installCommonDescriptors, controlDescriptors, IControlDescriptor } from '../../controls/commonDescriptors';
import { registerFocusCounter, unregisterFocusCounter } from '../../framework/focusService';
import { CustomHtmlJsxElement, customElement } from '../../../lib/friendlee/CustomHtmlJsxElement';

/**
 * A control that hosts the DesignSurface and provides related controls to manipulating
 * the design surface.
 */
@customElement(DesignApp.tagName)
export class DesignApp extends CustomHtmlJsxElement {
  public static readonly tagName = 'design-app';

  private readonly undoRedoQueue = new UndoRedoQueue();

  private propertyPanel: PropertyPanelElement;
  private editor: DesignSurfaceElement;

  constructor() {
    super();

    undoCommandCreated.addListener(this, command => this.onUndoEventGenerated(command));

    let listener = RoutedCommand.createListener(this);
    listener.set(appRoutedCommands.undo, () => this.doUndo());
    listener.set(appRoutedCommands.redo, () => this.doRedo());
    listener.set(appRoutedCommands.delete, () => this.deleteCurrent());

    selectedControlChanges.addListener(this, c => this.onSelectedControlChanged(c));

    installCommonDescriptors();

    controlDescriptors.addChangeListener(() => this.onControlsChange());
  }

  /** override */
  public onConnected() {
    registerFocusCounter(this);
  }

  /** override */
  public onDisconnected() {
    unregisterFocusCounter(this);
  }

  private addControl(descriptor: IControlDescriptor) {
    let newControl = this.editor.addControl(descriptor);
    this.editor.selectAndMarkActive(newControl);
  }

  public deleteCurrent() {
    let container = this.editor.getActiveControlContainer();
    if (container != null) {
      this.editor.removeControl(container.uniqueId as string);
    }
  }

  public onUndoEventGenerated(entry: IUndoEntry) {
    this.undoRedoQueue.addUndo(this.getContext(), entry);
    return true;
  }

  private getContext(): IContext {
    return {
      editor: this.editor,
    };
  }

  private onControlsChange(): void {
    this.invalidate();
  }

  doUndo() {
    this.undoRedoQueue.undo(this.getContext());
  }

  doRedo() {
    this.undoRedoQueue.redo(this.getContext());
  }

  public onFirstConnected() {
    this.tabIndex = 0;
    this.focus();

    registerShortcuts();

    this.invalidate();

    let buttonDescriptor = controlDescriptors.getDescriptor('button');
    let container = this.editor.addControl(buttonDescriptor, {
      left: 20,
      top: 70,
      width: 100,
      height: 100,
    });
    container.control.textContent = 'First Button';
    container = this.editor.addControl(buttonDescriptor, {
      right: 20,
      top: 100,
      width: 100,
      height: 100,
    });
    container.control.textContent = 'Second Button';
  }

  private onSelectedControlChanged(container: ControlContainer): void {
    if (container == null) {
      console.log('Focus was removed');
    } else {
      console.log(`Focus changed to Transferring focus to: ${container.uniqueId}`);
    }

    this.propertyPanel.container = container;
  }

  /* override */
  public onRender() {
    return (
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
            <design-surface ref={it => (this.editor = it)} />
          </div>
        </main>
        <aside>
          <property-panel ref={it => (this.propertyPanel = it)}></property-panel>
        </aside>
      </div>
    );
  }
}
