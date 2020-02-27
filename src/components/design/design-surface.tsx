import { IStoredPositionInfo, snapLayout } from '../../framework/layout';
import { IUndoCommand, IContext, undoCommandCreated } from '../../framework/undoCommand';
import { ControlContainer } from './control-container';
import { ControlEditor } from './control-editor';
import { IControlDescriptor, IControlSerializedData } from '../../framework/controlsRegistry';
import { generateGuid } from '../../framework/util';
import { CustomHtmlElement } from '../../../lib/friendlee/CustomHtmlElement';

import './design-surface.css';

export class DesignSurfaceElement extends CustomHtmlElement {
  private activeEditor: ControlEditor;

  constructor() {
    super();

    this.activeEditor = document.createElement('control-editor');
  }

  public static readonly tagName = 'design-surface';

  /** Determines the grid-snap for the controls */
  public gridSnap = 8;

  /** obvious */
  public getActiveControlContainer(): ControlContainer {
    return this.activeEditor.parentElement as ControlContainer;
  }

  /** obvious */
  public getControlContainer(id: string): ControlContainer {
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

    console.log(`Transferring focus to: ${control.uniqueId}`);
    control.appendChild(this.activeEditor);

    if (mouseEvent != null) {
      mouseEvent.preventDefault();
      activeEditor.transferMouseDown(mouseEvent);
    }

    return true;
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
    undoCommandCreated.trigger(this, new UndoAddCommand(descriptor, data));
    return container;
  }

  /**
   * Gets the default layout information for the given control
   */
  private getDefaultLayoutInfo(descriptor: IControlDescriptor): IStoredPositionInfo {
    console.log(descriptor);

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

  public removeControl(id: string) {
    let container = this.getControlContainer(id);
    let data = container.serialize();

    this.removeControlNoUndo(id);

    undoCommandCreated.trigger(this, new UndoRemoveCommand(container.descriptor, data));
  }

  /**
   * Removes a control from the design surface without adding an undo event.
   * @param id the unique id of the control to remove
   */
  public removeControlNoUndo(id: string) {
    let container = this.getControlContainer(id);
    this.removeChild(container);
  }
}

/**
 * Undo event for adding a control to the design surface.
 */
class UndoAddCommand implements IUndoCommand {
  constructor(private descriptor: IControlDescriptor, private data: IControlSerializedData) {}

  undo(context: IContext): void {
    context.editor.removeControlNoUndo(this.data.id);
  }

  redo(context: IContext): void {
    let container = context.editor.addControlNoUndo(this.descriptor, this.data);
    context.editor.selectAndMarkActive(container);
  }
}

/**
 * Undo event for removing a control from the design surface.
 */
class UndoRemoveCommand implements IUndoCommand {
  constructor(private descriptor: IControlDescriptor, private data: IControlSerializedData) {}

  undo(context: IContext): void {
    let container = context.editor.addControlNoUndo(this.descriptor, this.data);
    context.editor.selectAndMarkActive(container);
  }

  redo(context: IContext): void {
    context.editor.removeControlNoUndo(this.data.id);
  }
}

window.customElements.define(DesignSurfaceElement.tagName, DesignSurfaceElement);
