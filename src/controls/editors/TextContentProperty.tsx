import { ControlContainer } from '../../components/design/control-container.e';
import { setPropertyUndoRedo } from './_shared';
import { ControlProperty } from '../Control';

export class TextContentProperty extends ControlProperty<string> {
  public id = 'text.text';
  public displayName = 'Text';

  /* override */
  protected getValueRaw(e: HTMLElement) {
    return e.textContent;
  }

  /* override */
  protected setValueRaw(e: HTMLElement, value: string) {
    e.textContent = value;
  }

  /* override */
  protected hasDefaultValueRaw(e: HTMLElement): boolean {
    return e.textContent == null || e.textContent == '';
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
        id: instance.control.id,
        property: this,
        originalValue,
        newValue,
        canMerge: true,
      });
    });

    return { elementToMount: input };
  }
}
