import { ControlContainer } from '../../components/design/control-container.e';
import { setPropertyUndoRedo } from './_shared';
import { ControlProperty, IProperty, PropertyType } from '../Control';

export class BackgroundProperty extends ControlProperty<string> {
  public id = 'control.backgroundColor';
  public displayName = 'Background Color';

  /* override */
  protected getValueRaw(e: HTMLElement) {
    return e.style.backgroundColor ?? '';
  }

  /* override */
  protected setValueRaw(e: HTMLElement, value: string) {
    e.style.backgroundColor = value;
  }

  /* override */
  protected hasDefaultValueRaw(e: HTMLElement): boolean {
    return false;
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
