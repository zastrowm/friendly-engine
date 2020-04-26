import { ControlContainer } from '../../components/design/control-container.e';
import { setPropertyUndoRedo } from './_shared';
import { ControlProperty } from '../Control';

export class TextContentProperty extends ControlProperty<string> {
  id: 'text.text';
  displayName: 'Text';

  /* override */
  protected getValueRaw(e: HTMLElement) {
    return e.textContent;
  }

  /* override */
  protected setValueRaw(e: HTMLElement, value: string) {
    e.textContent = value;
  }

  /* override */
  public getEditor(instance: ControlContainer) {
    let input = document.createElement('input');
    input.value = this.getValue(instance.control);

    input.addEventListener('input', () => {
      let originalValue = this.getValue(instance.control);
      let newValue = input.value;
      this.setValue(instance.control, newValue);

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
