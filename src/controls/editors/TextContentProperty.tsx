import { GettableSettableProperty, PropertyType } from '../../framework/controlsRegistry';
import { ControlContainer } from '../../components/design/control-container';
import { setPropertyUndoRedo } from './_shared';

export class TextContentProperty extends GettableSettableProperty<string> {
  constructor() {
    super('text.text', 'Text', PropertyType.string);
  }

  public setValue(instance: ControlContainer, value: string) {
    instance.control.textContent = value;
  }
  public getValue(instance: ControlContainer): string {
    return instance.control.textContent;
  }

  public getEditor(instance: ControlContainer) {
    let input = document.createElement('input');
    input.value = this.getValue(instance);

    input.addEventListener('input', () => {
      let originalValue = this.getValue(instance);
      let newValue = input.value;
      this.setValue(instance, newValue);

      setPropertyUndoRedo.trigger(input, {
        id: instance.uniqueId,
        property: this,
        originalValue,
        newValue,
        canMerge: true,
      });
    });

    return { elementToMount: input };
  }
}
