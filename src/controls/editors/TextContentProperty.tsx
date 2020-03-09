import { GettableSettableProperty, PropertyType } from '../../framework/controlsRegistry';
import { ControlContainer } from '../../components/design/control-container';

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
      this.setValue(instance, input.value);
    });

    return { elementToMount: input };
  }
}
