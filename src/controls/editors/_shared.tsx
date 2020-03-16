import { IUndoCommand, IContext } from '../../framework/undoCommand';
import { UniqueId } from '../../framework/util';
import { IPropertyDescriptor } from '../commonDescriptors';

/**
 * An undo/redo command that sets a specific property on a control
 */
export class SetPropertyCommand implements IUndoCommand {
  constructor(
    private id: UniqueId,
    private property: IPropertyDescriptor,
    private originalValue: string,
    private newValue: string,
  ) {}

  /** Override */
  undo(context: IContext) {
    let container = context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.originalValue);
  }

  /** Override */
  redo(context: IContext) {
    let container = context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.newValue);
  }
}
