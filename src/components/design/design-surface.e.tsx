import { IStoredPositionInfo, snapLayout } from '../../framework/layout';
import { registerUndoHandler } from '../../framework/undoRedo';
import { ControlContainer } from './control-container.e';
import { ControlEditor } from './control-editor.e';
import { generateGuid, UniqueId } from '../../framework/util';
import { CustomHtmlElement, customElement } from '@friendly/elements/CustomHtmlElement';

import './design-surface.css';
import { RoutedEventDescriptor } from '../../framework/routedEvents';
import {
  Control,
  getControlDesigner,
  setControlDesigner,
  IControlSerializedData,
  ISerializedPropertyBag,
  RootControl,
  rootControlDescriptor,
  IControlDescriptor,
  tryGetValue,
  addValue,
} from 'src/controls/@commonControls';
import { TextContentProperty } from '../../controls/properties/~TextProperties';

export let selectedControlChanged = new RoutedEventDescriptor<ControlContainer>({
  id: 'selectedControlChanged',
  mustBeHandled: false,
});

/**
 * A control that represents the canvas that can have controls added/deleted/moved.
 */
@customElement(DesignSurfaceElement.tagName)
export class DesignSurfaceElement extends CustomHtmlElement {
  public static readonly tagName = 'design-surface';

  private readonly _activeEditor: ControlEditor;
  private _childControls: Map<UniqueId, Control> = new Map();
  private _rootContainer: ControlContainer;

  constructor() {
    super();

    this._activeEditor = document.createElement('control-editor');
    this.addEventListener('mousedown', (evt) => this.onMouseDown(evt));

    this._rootContainer = DesignSurfaceElement.createUserControlContainer();
  }

  /**
   * Gets the root control of the design-canvas.
   */
  public get root(): RootControl {
    return this._rootContainer.control as RootControl;
  }

  /** override */
  public onFirstConnected() {
    this.appendChild(this._rootContainer);
    this._rootContainer.control.layout = {
      bottom: 0,
      top: 0,
      left: 0,
      right: 0,
    };
  }

  private static createUserControlContainer(): ControlContainer {
    let container = document.createElement(ControlContainer.tagName);
    let userControl = rootControlDescriptor.createInstance();
    container.control = userControl;
    setControlDesigner(userControl, container);
    return container;
  }

  /** Determines the grid-snap for the controls */
  public gridSnap = 8;

  /** obvious */
  public getActiveControlContainer(): ControlContainer | null {
    let container = this._activeEditor.parentElement as ControlContainer;
    return container ?? this._rootContainer;
  }

  /** obvious */
  public getActiveControl(): Control | null {
    return this.getActiveControlContainer()?.control;
  }

  public getControlContainer(id: UniqueId): ControlContainer {
    let control = this._childControls.get(id);

    if (control == null && this._rootContainer.control.id == id) {
      return this._rootContainer;
    }

    if (control == null) {
      throw new Error(`No control with id: ${id} found`);
    }

    return this.getAssociatedContainer(control);
  }

  public getControl(id: UniqueId): Control {
    let control = this._childControls.get(id);
    if (control == null) throw new Error(`No control with id '${id}' exists`);

    return control;
  }

  /** Returns all of the controls in the editor */
  public get controls(): Iterable<Control> {
    return this.getLazyControls();
  }

  /** Returns all of the controls in the editor */
  private *getLazyControls(): Iterable<Control> {
    for (let [, control] of this._childControls) {
      yield control;
    }
  }

  /**
   * Sets the given control to be the actively selected control
   * @param container The container which should be marked as the active control
   * @param mouseEvent (optional) the mouse event that triggered the operation
   * @returns true if the element was newly selected, false if it was already the active element
   */
  public selectAndMarkActive(container: ControlContainer, mouseEvent?: MouseEvent) {
    if (container == null) {
      throw new Error('Control cannot be null');
    }

    let activeEditor = this._activeEditor;
    if (activeEditor.parentElement == container) {
      return false;
    }

    if (container == this._rootContainer) {
      this._activeEditor.remove();
      mouseEvent?.preventDefault();
    } else {
      container.appendChild(this._activeEditor);

      if (mouseEvent != null) {
        mouseEvent.preventDefault();
        activeEditor.transferMouseDown(mouseEvent);
      }
    }

    selectedControlChanged.trigger(this, container);
    return true;
  }

  private onMouseDown(eventArgs: MouseEvent) {
    eventArgs.stopPropagation();
    this.clearActiveEditor();
  }

  private clearActiveEditor() {
    this._activeEditor.remove();
    selectedControlChanged.trigger(this, this.getActiveControlContainer());
  }

  public addNewControl(
    descriptor: IControlDescriptor,
    layout: IStoredPositionInfo = null,
    properties: ISerializedPropertyBag = null,
  ) {
    let control = descriptor.createInstance();

    // TODO copy the data
    let data: IControlSerializedData = {
      position: layout ?? this.getDefaultLayoutInfo(descriptor),
      id: generateGuid(),
      properties: properties ?? {},
      typeId: descriptor.id,
    };

    this.addDefaultTextIfNeeded(descriptor, data.properties);

    control.deserialize(data);

    snapLayout(data.position, this.gridSnap);

    addControlsUndoHandler.trigger(this, {
      entries: [
        {
          descriptor: descriptor,
          data,
        },
      ],
    });
  }

  private addDefaultTextIfNeeded(descriptor: IControlDescriptor, propertyBag: ISerializedPropertyBag) {
    let textProperty = descriptor.getProperty<string>(TextContentProperty.id);

    if (textProperty != null) {
      let existingValue = tryGetValue(propertyBag, textProperty);
      if (existingValue == undefined) {
        addValue(propertyBag, textProperty, `${descriptor.id} text`);
      }
    }
  }

  /**
   * Adds a control to the design surface without adding an undo event for it.
   * @param control the control to add
   */
  public addControlNoUndo(control: Control): ControlContainer {
    let controlContainer = document.createElement('control-container');
    controlContainer.control = control;
    this.appendChild(controlContainer);
    setControlDesigner(control, controlContainer);
    this._childControls.set(control.id, control);

    return controlContainer;
  }

  /**
   * Gets the default layout information for the given control
   */
  private getDefaultLayoutInfo(descriptor: IControlDescriptor): IStoredPositionInfo {
    if (descriptor == null) {
      throw new Error('Null Descriptor');
    }

    return {
      left: 20,
      top: 20,
      width: 40,
      height: 60,
    };
  }

  /**
   * Removes all of the given controls from the editor
   * @param controls the controls to remove
   */
  public removeControls(controls: Control[]) {
    // TODO switch to iterators
    let serializedControlData = controls
      .filter((control) => control != this._rootContainer.control)
      .map((control) => ({
        descriptor: control.descriptor,
        data: control.serialize(),
      }));

    // Because we remove the root control if it was present, it's possible to end up with an empty list - in that
    // case, we don't want to add an undo entry
    if (serializedControlData.length > 0) {
      removeControlsUndoHandler.trigger(this, {
        entries: serializedControlData,
      });
    }
  }

  /**
   * Removes all of the controls from the editor
   */
  public removeAllControls() {
    this.removeControls(Array.from(this.controls));
  }

  /**
   * Removes a control from the design surface without adding an undo event.
   * @param control the control to remove from the design surface
   */
  public removeControlNoUndo(control: Control) {
    let container = this.getAssociatedContainer(control);

    if (this._activeEditor.elementToMove == container) {
      this.clearActiveEditor();
    }

    setControlDesigner(control, null);
    this.removeChild(container);
    this._childControls.delete(control.id);
  }

  private getAssociatedContainer(control: Control): ControlContainer {
    let container = getControlDesigner(control) as ControlContainer;
    if (container?.parentElement != this) {
      throw new Error('Control does not belong to this design surface');
    }

    return container;
  }
}

interface IUndoRemoveControlsArgs {
  entries: {
    descriptor: IControlDescriptor;
    data: IControlSerializedData;
  }[];
}

/** Add controls for undo/redo */
function addControls(editor: DesignSurfaceElement, arg: IUndoRemoveControlsArgs) {
  for (let entry of arg.entries) {
    let control = entry.descriptor.createInstance();
    control.deserialize(entry.data);
    let container = editor.addControlNoUndo(control);
    editor.selectAndMarkActive(container);
  }
}

/** Remove controls for undo/redo */
function removeControls(editor: DesignSurfaceElement, arg: IUndoRemoveControlsArgs) {
  for (let entry of arg.entries) {
    editor.removeControlNoUndo(editor.getControl(entry.data.id));
  }
}

let addControlsUndoHandler = registerUndoHandler<IUndoRemoveControlsArgs>('removeControls', () => ({
  do() {
    this.redo();
  },

  undo() {
    removeControls(this.context.editor, this);
  },

  redo() {
    addControls(this.context.editor, this);
  },
}));

let removeControlsUndoHandler = registerUndoHandler<IUndoRemoveControlsArgs>('removeControls', () => ({
  do() {
    this.redo();
  },

  undo() {
    addControls(this.context.editor, this);
  },

  redo() {
    removeControls(this.context.editor, this);
  },
}));
