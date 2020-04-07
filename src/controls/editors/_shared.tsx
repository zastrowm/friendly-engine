import { registerUndoHandler } from '../../framework/undoRedo';
import { UniqueId } from '../../framework/util';
import { getFocusCount, FocusCount } from '../../framework/focusService';
import { ControlContainer } from 'src/components/design/control-container.e';
import { RoutedEventDescriptor } from 'src/framework/routedEvents';
import { IPropertyDescriptor, GettableSettableProperty, IPropertyEditor } from 'src/framework/controlsRegistry';

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

/** Implements a text-box that changes the property. */
export function createTextBoxEditor(
  self: GettableSettableProperty<string>,
  instance: ControlContainer,
): IPropertyEditor {
  let input = document.createElement('input');
  input.value = self.getValue(instance);

  input.addEventListener('input', function () {
    let originalValue = self.getValue(instance);
    let newValue = input.value;
    self.setValue(instance, newValue);

    setPropertyUndoRedo.trigger(input, {
      id: instance.uniqueId,
      property: self,
      originalValue,
      newValue,
      canMerge: true,
    });
  });

  return { elementToMount: input };
}
