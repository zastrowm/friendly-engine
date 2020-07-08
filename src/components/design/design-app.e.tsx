import { DesignSurfaceElement, selectedControlChanged } from './design-surface.e';

import { IContext, undoCommandCreated, UndoRedoQueue, IUndoEntry } from '../../framework/undoRedo';
import { appRoutedCommands, RoutedCommand } from '../../framework/appRoutedCommands';
import { registerShortcuts } from '../../app/keyboardShortcuts';
import { h } from 'preact';
import { ControlContainer } from './control-container.e';

import './design-app.css';
import { PropertyPanelElement } from './property-panel.e';
import {
  addCommonControlDescriptors,
  IControlDescriptor,
  IControlSerializedData,
  ISerializedPropertyBag,
  ControlRegistry,
} from '../../controls/@commonControls';
import { registerFocusCounter, unregisterFocusCounter } from '../../framework/focusService';
import { CustomHtmlJsxElement, customElement } from '@friendly/elements/CustomHtmlJsxElement';
import { config, development } from '../../runtime';
import { PropertyEditorRegistry } from '../../controls/editors/propertyEditor';
import { addCommonPropertyEditors } from '../../controls/editors/@commonEditors';

import defaultLayout from '../../default-layout.json';

declare var module;

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
  private descriptors: ControlRegistry = new ControlRegistry();
  private editorRegistry: PropertyEditorRegistry = new PropertyEditorRegistry();

  constructor() {
    super();

    // during development, auto-reload the last layout session
    if (config.isDevelopment()) {
      console.warn('preparing development layout');

      module.hot.addStatusHandler((status) => {
        if (status == 'ready') {
          this.saveLayout('development');
        }
      });

      window.addEventListener(
        'beforeunload',
        () => {
          if (!development.hasErrorOccurred() && !development.isReloadingDueToHmr()) {
            this.saveLayout('development');
          }
        },
        { once: true },
      );
    }

    // make sure that we keep ourselves focused; works around issue #21
    this.addEventListener(
      'mouseup',
      () => {
        if (document.activeElement.closest(DesignApp.tagName) == null) {
          this.focus();
        }
      },
      true,
    );

    undoCommandCreated.addListener(this, (command) => this.onUndoEventGenerated(command));

    let listener = RoutedCommand.createListener(this);
    listener.set(appRoutedCommands.undo, () => this.doUndo());
    listener.set(appRoutedCommands.redo, () => this.doRedo());
    listener.set(appRoutedCommands.delete, () => this.deleteCurrent());

    selectedControlChanged.addListener(this, (c) => this.onSelectedControlChanged(c));
    addCommonControlDescriptors(this.descriptors);
    addCommonPropertyEditors(this.editorRegistry);

    this.descriptors.addChangeListener(() => this.onControlsChange());
  }

  /** override */
  public onConnected() {
    registerFocusCounter(this);

    if (config.isProduction()) {
      this.loadInMemoryLayout((defaultLayout as any) as ISavedLayoutInfo);
    }
  }

  /** override */
  public onDisconnected() {
    unregisterFocusCounter(this);
  }

  private addControl(descriptor: IControlDescriptor) {
    this.editor.addNewControl(descriptor);
  }

  public deleteCurrent() {
    let container = this.editor.getActiveControlContainer();
    if (container != null) {
      this.editor.removeControls([this.editor.getActiveControl()]);
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

    if (config.isDevelopment()) {
      console.warn('Loading development layout');
      this.loadLayout('development');
      return;
    }
  }

  private onSelectedControlChanged(container: ControlContainer): void {
    if (container == null) {
      console.log('Focus was removed');
    } else {
      console.log(`Focus changed to Transferring focus to: ${container.control.id}`);
    }

    this.propertyPanel.container = container;
  }

  /** Saves the current control layout to LocalStorage */
  private saveLayout(layoutName: string) {
    let controls = this.editor.controls;
    let data: ISavedLayoutInfo = {
      controls: Array.from(controls).map((it) => it.serialize()),
      root: {
        properties: this.editor.root.serializeProperties(),
      },
    };
    let json = JSON.stringify(data);

    window.localStorage.setItem(`layout_${layoutName}`, json);
  }

  /** Restores the previously-saved control layout from LocalStorage */
  private loadLayout(layoutName: string) {
    console.log('loading layout', layoutName);

    let jsonLayout = window.localStorage.getItem(`layout_${layoutName}`);
    if (jsonLayout == null) {
      alert('No layout saved');
      return;
    }

    let layoutInfo = JSON.parse(jsonLayout) as ISavedLayoutInfo;

    if (Array.isArray(layoutInfo)) {
      layoutInfo = {
        controls: layoutInfo as IControlSerializedData[],
        root: {
          properties: null,
        },
      };
    }

    this.loadInMemoryLayout(layoutInfo);
  }

  private loadInMemoryLayout(layoutInfo: ISavedLayoutInfo) {
    this.editor.removeAllControls();
    this.undoRedoQueue.clear();

    let lastControl: ControlContainer;
    for (let serialized of layoutInfo.controls) {
      let descriptor = this.descriptors.getDescriptor(serialized.typeId);
      let control = descriptor.createInstance();
      control.deserialize(serialized);
      lastControl = this.editor.addControlNoUndo(control);
    }

    if (lastControl != null) {
      this.editor.selectAndMarkActive(lastControl);
    }

    this.editor.root.deserializeProperties(layoutInfo.root?.properties);
  }

  /** Deletes all controls in the editor **/
  private resetCanvas() {
    this.editor.removeAllControls();
  }

  /* override */
  public onRender() {
    return (
      <div>
        <header>
          <h1>Web App Builder</h1>
          {/* Render each control as a button that inserts it */}
          {Array.from(this.descriptors.getDescriptors()).map((d) => (
            <button onClick={() => this.addControl(d)}>Add {d.id}</button>
          ))}
          <button onClick={() => this.deleteCurrent()}>Delete</button>
          <button onClick={() => this.doUndo()}>Undo</button>
          <button onClick={() => this.doRedo()}>Redo</button>
          <button onClick={() => this.saveLayout('manual')}>Save Layout</button>
          <button onClick={() => this.loadLayout('manual')}>Load Layout</button>
          <button onClick={() => this.resetCanvas()}>Reset Canvas</button>
        </header>
        <main>
          <div>
            <design-surface ref={(it) => (this.editor = it)} />
          </div>
        </main>
        <aside>
          <property-panel ref={(it) => (this.propertyPanel = it)} editorRegistry={this.editorRegistry} />
        </aside>
      </div>
    );
  }
}

interface ISavedLayoutInfo {
  root: {
    properties: ISerializedPropertyBag;
  };
  controls: IControlSerializedData[];
}
