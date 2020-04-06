import { IStoredPositionInfo, snapLayout } from '../../framework/layout';
import { registerUndoHandler } from '../../framework/undoRedo';
import { ControlContainer } from './control-container.e';
import { ControlEditor } from './control-editor.e';
import { IControlDescriptor, IControlSerializedData } from '../../framework/controlsRegistry';
import { generateGuid, UniqueId } from '../../framework/util';
import { CustomHtmlElement, customElement } from '@friendly/elements/CustomHtmlElement';

import './design-surface.css';
import { RoutedEventDescriptor } from '../../framework/routedEvents';

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

  constructor() {
    super();

    this.activeEditor = document.createElement('control-editor');
  }

  /** Determines the grid-snap for the controls */
  public gridSnap = 8;

  /** obvious */
  public getActiveControlContainer(): ControlContainer {
    return this.activeEditor.parentElement as ControlContainer;
  }

  /** obvious */
  public getControlContainer(id: UniqueId): ControlContainer {
    let query = `control-container[unique-id='${id}']`;
    let container: ControlContainer = this.querySelector(query);
    return container;
  }

  /**
   * Sets the given control to be the actively selected control
   * @param control The control which should be marked as the active control
   * @param mouseEvent (optional) the mouse event that triggered the operation
   */
  public selectAndMarkActive(control: ControlContainer, mouseEvent?: MouseEvent) {
    if (control == null) {
      throw new Error('Control cannot be null');
    }

    let activeEditor = this.activeEditor;
    if (activeEditor.parentElement == control) {
      return false;
    }

    control.appendChild(this.activeEditor);

    if (mouseEvent != null) {
      mouseEvent.preventDefault();
      activeEditor.transferMouseDown(mouseEvent);
    }

    selectedControlChanges.trigger(this, control);

    return true;
  }

  private clearActiveEditor() {
    this.activeEditor.remove();
    selectedControlChanges.trigger(this, null);
  }

  public addControl(descriptor: IControlDescriptor, layout: IStoredPositionInfo = null): ControlContainer {
    // TODO copy the data
    let data: IControlSerializedData = {
      position: layout ?? this.getDefaultLayoutInfo(descriptor),
      id: generateGuid(),
      properties: {},
      typeId: descriptor.id,
    };

    snapLayout(data.position, this.gridSnap);

    let container = this.addControlNoUndo(descriptor, data);
    addControlUndoHandler.trigger(this, {
      descriptor: container.descriptor,
      data,
    });

    return container;
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
   * Adds a control to the design surface without adding an undo event for it.
   * @param type the type of control to add
   * @param id the unique id of the control
   * @param layoutInfo the initial position information of the control
   */
  public addControlNoUndo(descriptor: IControlDescriptor, data: IControlSerializedData): ControlContainer {
    let controlContainer = document.createElement('control-container');
    controlContainer.deserialize(descriptor, data);
    this.appendChild(controlContainer);
    return controlContainer;
  }

  public removeControl(id: UniqueId) {
    let container = this.getControlContainer(id);
    let data = container.serialize();

    this.removeControlNoUndo(id);

    removeControlUndoHandler.trigger(this, {
      descriptor: container.descriptor,
      data,
    });
  }

  /**
   * Removes a control from the design surface without adding an undo event.
   * @param id the unique id of the control to remove
   */
  public removeControlNoUndo(id: UniqueId) {
    let container = this.getControlContainer(id);

    if (this.activeEditor.elementToMove == container) {
      this.clearActiveEditor();
    }

    this.removeChild(container);
  }
}

interface UndoArgs {
  descriptor: IControlDescriptor;
  data: IControlSerializedData;
}

/**
 * Undo event for adding a control to the design surface.
 */
let addControlUndoHandler = registerUndoHandler<UndoArgs>('addControl', () => ({
  undo() {
    this.context.editor.removeControlNoUndo(this.data.id);
  },

  redo() {
    let container = this.context.editor.addControlNoUndo(this.descriptor, this.data);
    this.context.editor.selectAndMarkActive(container);
  },
}));

/**
 * Undo event for removing a control from the design surface.
 */
let removeControlUndoHandler = registerUndoHandler<UndoArgs>('removeControl', () => ({
  undo() {
    let container = this.context.editor.addControlNoUndo(this.descriptor, this.data);
    this.context.editor.selectAndMarkActive(container);
  },

  redo() {
    this.context.editor.removeControlNoUndo(this.data.id);
  },
}));
