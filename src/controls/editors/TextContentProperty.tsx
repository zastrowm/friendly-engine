import { ControlContainer } from '../../components/design/control-container.e';
import { setPropertyUndoRedo } from './_shared';
import { IOwnedProperty, IStateDefinition, PropertyType } from "../defineControl";

export class TextContentProperty<TState> implements IOwnedProperty<TState, string> {
  constructor(stateDefinition: IStateDefinition<TState>, private getter: (TState) => HTMLElement) {
    console.log(stateDefinition);
  }

  public readonly id = 'text.text';
  public readonly displayName = 'Text';
  public readonly propertyType = PropertyType.string;

  getValue(state: TState) {
    return this.getter(state).textContent;
  }

  setValue(state: TState, value: string) {
    this.getter(state).textContent = value;
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
