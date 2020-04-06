import { registerUndoHandler } from '../../framework/undoRedo';
import { UniqueId } from '../../framework/util';
import { IPropertyDescriptor } from '../commonDescriptors';
import { getFocusCount, FocusCount } from '../../framework/focusService';

interface SetPropertyUndoArgs {
  id: UniqueId;
  property: IPropertyDescriptor;
  originalValue: string;
  newValue: string;
  canMerge?: boolean;
  focusCount?: FocusCount;
}

export const undoRedoValueChangeId = 'undoRedo';

export let setPropertyUndoRedo = registerUndoHandler<SetPropertyUndoArgs>('setProperty', () => ({
  initialize() {
    if (this.focusCount == null) {
      this.focusCount = getFocusCount();
    }
  },

  undo() {
    let container = this.context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.originalValue, undoRedoValueChangeId);
  },

  redo() {
    let container = this.context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.newValue, undoRedoValueChangeId);
  },

  tryMerge(rhs: SetPropertyUndoArgs) {
    if (this.canMerge !== true) {
      return false;
    }

    let shouldMerge =
      this.focusCount == rhs.focusCount &&
      this.property == rhs.property &&
      this.dateInfo.isLastModifiedWithinMs(3000) &&
      this.dateInfo.isOriginalCreationWithinMs(5000);

    if (!shouldMerge) {
      return false;
    }

    this.newValue = rhs.newValue;
    return true;
  },
}));
