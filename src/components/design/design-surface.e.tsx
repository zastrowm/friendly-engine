import { IStoredPositionInfo, snapLayout } from '../../framework/layout';
import { registerUndoHandler } from '../../framework/undoRedo';
import { ControlContainer } from './control-container.e';
import { ControlEditor } from './control-editor.e';
import { IControlDescriptor } from '../../framework/controlsRegistry';
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
} from 'src/controls/Control';

export let selectedControlChanges = new RoutedEventDescriptor<ControlContainer>({
  id: 'selectedControlChanged',
  mustBeHandled: false,
});

/**
 * A control that represents the canvas that can have controls added/deleted/moved.
 */
@customElement(DesignSurfaceElement.tagName)
export class DesignSurfaceElement extends CustomHtmlElement {
  public static readonly tagName = 'design-surface';

  private activeEditor: ControlEditor;
  private childControls: Map<UniqueId, Control> = new Map();

  constructor() {
    super();

    this.activeEditor = document.createElement('control-editor');
    this.addEventListener('mousedown', (evt) => this.onMouseDown(evt));
  }

  /** Determines the grid-snap for the controls */
  public gridSnap = 8;

  /** obvious */
  public getActiveControlContainer(): ControlContainer {
    return this.activeEditor.parentElement as ControlContainer;
  }

  public getControlContainer(id: UniqueId): ControlContainer {
    return this.getAssociatedContainer(this.childControls.get(id));
  }

  public getControl(id: UniqueId): Control {
    return this.childControls.get(id);
  }

  /** Returns all of the controls in the editor */
  public get controls(): Iterable<Control> {
    return this.getLazyControls();
  }

  /** Returns all of the controls in the editor */
  private *getLazyControls(): Iterable<Control> {
    for (let [, control] of this.childControls) {
      yield control;
    }
  }

  /**
   * Sets the given control to be the actively selected control
   * @param container The container which should be marked as the active control
   * @param mouseEvent (optional) the mouse event that triggered the operation
   */
  public selectAndMarkActive(container: ControlContainer, mouseEvent?: MouseEvent) {
    if (container == null) {
      throw new Error('Control cannot be null');
    }

    let activeEditor = this.activeEditor;
    if (activeEditor.parentElement == container) {
      return false;
    }

    container.appendChild(this.activeEditor);

    if (mouseEvent != null) {
      mouseEvent.preventDefault();
      activeEditor.transferMouseDown(mouseEvent);
    }

    selectedControlChanges.trigger(this, container);

    return true;
  }

  private onMouseDown(eventArgs: MouseEvent) {
    eventArgs.stopPropagation();
    this.clearActiveEditor();
  }

  private clearActiveEditor() {
    this.activeEditor.remove();
    selectedControlChanges.trigger(this, null);
  }

  public addNewControl(
    descriptor: IControlDescriptor,
    layout: IStoredPositionInfo = null,
    properties: ISerializedPropertyBag = null,
  ): ControlContainer {
    let control = descriptor.createInstance();

    // TODO copy the data
    let data: IControlSerializedData = {
      position: layout ?? this.getDefaultLayoutInfo(descriptor),
      id: generateGuid(),
      properties: properties ?? {},
      typeId: descriptor.id,
    };

    control.deserialize(data);
    snapLayout(data.position, this.gridSnap);

    let container = this.addControlNoUndo(control);
    addControlUndoHandler.trigger(this, {
      descriptor: descriptor,
      data,
    });

    return container;
  }

  /**
   * Adds a control to the design surface without adding an undo event for it.
   * @param type the type of control to add
   * @param id the unique id of the control
   * @param layoutInfo the initial position information of the control
   */
  public addControlNoUndo(control: Control): ControlContainer {
    let controlContainer = document.createElement('control-container');
    controlContainer.control = control;
    this.appendChild(controlContainer);
    setControlDesigner(control, controlContainer);
    this.childControls.set(control.id, control);

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

  public removeControl(control: Control) {
    this.removeControlNoUndo(control);

    removeControlUndoHandler.trigger(this, {
      descriptor: control.descriptor,
      data: {
        id: control.id,
        position: control.layout,
        properties: control.serialize(),
        typeId: control.descriptor.id,
      },
    });
  }

  /**
   * Removes a control from the design surface without adding an undo event.
   * @param id the unique id of the control to remove
   */
  public removeControlNoUndo(control: Control) {
    let container = this.getAssociatedContainer(control);

    if (this.activeEditor.elementToMove == container) {
      this.clearActiveEditor();
    }

    setControlDesigner(control, null);
    this.removeChild(container);
    this.childControls.delete(control.id);
  }

  private getAssociatedContainer(control: Control): ControlContainer {
    let container = getControlDesigner(control) as ControlContainer;
    if (container?.parentElement != this) {
      throw new Error('Control does not belong to this design surface');
    }

    return container;
  }

  /**
   * Removes all of the controls from the editor
   * @param controls the controls to remove
   */
  public removeControls(controls: Control[])  {
    // TODO switch to iterators
    let serializedControlData = controls.map(control => ({
      descriptor: control.descriptor,
      data: {
        id: control.id,
        position: control.layout,
        properties: control.serialize(),
        typeId: control.descriptor.id,
      },
    }));

    removeAllControlsUndoHandler.trigger(this, {
      entries: serializedControlData
    });
  }
}

interface UndoArgs {
  descriptor: IControlDescriptor;
  data: IControlSerializedData;
}

function addControl(editor: DesignSurfaceElement, arg: UndoArgs) {
  let control = arg.descriptor.createInstance();
  control.deserialize(arg.data);
  let container = editor.addControlNoUndo(control);
  editor.selectAndMarkActive(container);
}

function removeControl(editor: DesignSurfaceElement, arg: UndoArgs) {
  editor.removeControlNoUndo(editor.getControl(arg.data.id));
}

/**
 * Undo event for adding a control to the design surface.
 */
let addControlUndoHandler = registerUndoHandler<UndoArgs>('addControl', () => ({
  undo() {
    removeControl(this.context.editor, this);
  },

  redo() {
    addControl(this.context.editor, this);
  },
}));

/**
 * Undo event for removing a control from the design surface.
 */
let removeControlUndoHandler = registerUndoHandler<UndoArgs>('removeControl', () => ({
  undo() {
    addControl(this.context.editor, this);
  },

  redo() {
    removeControl(this.context.editor, this);
  },
}));

interface IUndoRemoveControlsArgs {
  entries: UndoArgs[];
}

let removeAllControlsUndoHandler = registerUndoHandler<IUndoRemoveControlsArgs>('removeControls', () => ({

  do() {
    this.redo();
  },

  undo() {
    for (let undoArg of this.entries) {
      addControl(this.context.editor, undoArg);
    }
  },

  redo() {
    for (let undoArg of this.entries) {
      removeControl(this.context.editor, undoArg);
    }
  }
}))
