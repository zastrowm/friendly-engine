import { GettableSettableProperty, PropertyType } from '../../framework/controlsRegistry';
import { ControlContainer } from '../../components/design/control-container';
import { SetPropertyCommand } from './_shared';
import { undoCommandCreated } from '../../framework/undoCommand';

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

      undoCommandCreated.trigger(input, new SetPropertyCommand(instance.uniqueId, this, originalValue, newValue));
    });

    return { elementToMount: input };
  }
}
