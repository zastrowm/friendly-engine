import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import {
  BaseControlDescriptor,
  GettableSettableProperty,
  PropertyType,
  IPropertyEditor,
} from 'src/framework/controlsRegistry';
import { ControlContainer } from 'src/components/design/control-container.e';
import { h } from '@friendly/elements/jsxElements';

/**
 * The text that should be shown when the button is clicked
 */
class CheckedProperty extends GettableSettableProperty<boolean> {
  constructor() {
    super('checkbox.isChecked', 'Checked', PropertyType.boolean);
  }

  public setValue(instance: ControlContainer, value: boolean) {
    (instance.control as HTMLInputElement).checked = value;
  }

  public getValue(instance: ControlContainer): boolean {
    return (instance.control as HTMLInputElement).checked ?? false;
  }

  public getEditor(instance: ControlContainer): IPropertyEditor {
    return this.createJsxEditor(instance, (refresh) => (
      <input
        type="checkbox"
        checked={this.getValue(instance)}
        onChange={() => {
          let old = this.getValue(instance);
          refresh({ old: old, new: !old });
        }}
      />
    ));
  }
}

class CheckboxDescriptor extends BaseControlDescriptor {
  public id = 'checkbox';

  private static properties = [new TextContentProperty(), new TextAlignmentProperty(), new CheckedProperty()];

  public createInstance(): HTMLElement {
    let input = document.createElement('input');
    input.type = 'checkbox';
    return input;
  }

  public getProperties() {
    return CheckboxDescriptor.properties;
  }
}

export let checkboxDescriptor = new CheckboxDescriptor();
