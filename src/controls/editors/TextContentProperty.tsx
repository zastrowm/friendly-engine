import { ControlContainer } from '../../components/design/control-container.e';
import { setPropertyUndoRedo } from './_shared';
import { IOwnedProperty, PropertyType } from "../defineControl";

export const TextContentProperty: IOwnedProperty<HTMLElement, string> = {
  id: 'text.text',
  displayName: 'Text',
  propertyType: PropertyType.string,

  getValue(element: HTMLElement) {
    return element.textContent;
  },

  setValue(element: HTMLElement, value: string) {
    element.textContent = value;
  },

  getEditor(instance: ControlContainer) {
    let input = document.createElement('input');
    input.value = this.getValue(instance.control.state);

    input.addEventListener('input', () => {
      let originalValue = this.getValue(instance.control.state);
      let newValue = input.value;
      this.setValue(instance.control.state, newValue);

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
