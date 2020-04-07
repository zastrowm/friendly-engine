import { registerUndoHandler } from '../../framework/undoRedo';
import { UniqueId } from '../../framework/util';
import { IPropertyDescriptor } from '../commonDescriptors';
import { getFocusCount, FocusCount } from '../../framework/focusService';
import { ControlContainer } from 'src/components/design/control-container.e';
import { RoutedEventDescriptor } from 'src/framework/routedEvents';

interface SetPropertyUndoArgs {
  id: UniqueId;
  property: IPropertyDescriptor;
  originalValue: string;
  newValue: string;
  canMerge?: boolean;
  focusCount?: FocusCount;
}

export let setPropertyUndoRedo = registerUndoHandler<SetPropertyUndoArgs>('setProperty', () => ({
  initialize() {
    if (this.focusCount == null) {
      this.focusCount = getFocusCount();
    }
  },

  undo() {
    let container = this.context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.originalValue);

    controlValueChanged.trigger(container, {
      instance: container,
      property: this.property,
      value: this.originalValue,
    });

    this.context.editor.selectAndMarkActive(container);
  },

  redo() {
    let container = this.context.editor.getControlContainer(this.id);
    let descriptor = container.descriptor;
    descriptor.setValue(container, this.property, this.newValue);

    controlValueChanged.trigger(container, {
      instance: container,
      property: this.property,
      value: this.newValue,
    });

    this.context.editor.selectAndMarkActive(container);
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

/** Updated when a control's value changes through an instance of IPropertyDescriptor */
export let controlValueChanged = new RoutedEventDescriptor<IControlValueChangedArguments>({
  id: 'externalControlValueChanged',
  mustBeHandled: false,
});

/** Arguments for controlValueChanged*/
export interface IControlValueChangedArguments {
  instance: ControlContainer;
  value: any;
  property: IPropertyDescriptor;
}
