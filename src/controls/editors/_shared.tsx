import { registerUndoHandler } from '../../framework/undoRedo';
import { UniqueId } from '../../framework/util';
import { IPropertyDescriptor } from '../commonDescriptors';

interface SetPropertyUndoArgs {
  id: UniqueId;
  property: IPropertyDescriptor;
  originalValue: string;
  newValue: string;
}

export let setPropertyUndoRedo = registerUndoHandler<SetPropertyUndoArgs>('setProperty', () => ({
  undo() {
    let container = this.context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.originalValue);
  },

  redo() {
    let container = this.context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.newValue);
  },

  tryMerge(rhs: SetPropertyUndoArgs) {
    let shouldMerge =
      this.property == rhs.property &&
      this.dateInfo.isLastModifiedWithinMs(1000) &&
      this.dateInfo.isOriginalCreationWithinMs(3000);

    if (!shouldMerge) {
      return false;
    }

    this.newValue = rhs.newValue;
    return true;
  },
}));
