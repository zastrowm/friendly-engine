import { IPropertyEditor } from '../controlProperties';
import { ControlContainer } from '../../components/design/control-container.e';
import { Fragment, h } from '@friendly/elements/jsxElements';
import { Icon } from '../icon';
import { IOwnedProperty, PropertyType } from '../defineControl';

export const FontSizeProperty: IOwnedProperty<HTMLElement, number> = {
  id: 'text.fontSize',
  displayName: 'Font Size',
  propertyType: PropertyType.number | PropertyType.enum,

  getValue(element: HTMLElement): number {
    let fontSize = getComputedStyle(element).fontSize;
    return Number(fontSize.substr(0, fontSize.length - 2));
  },

  setValue(element: HTMLElement, value: number) {
    if (value < 1) {
      throw new Error(`Font size cannot be < 1, but is ${value}`);
    }

    element.style.fontSize = value + 'px';
  },

  getEditor(instance: ControlContainer): IPropertyEditor {
    return this.createJsxEditor(instance, (refresh) => {
      let value = this.getValue(instance.control);

      let changeValue = (value) => {
        refresh({ old: value, new: value });
      };

      return (
        <Fragment>
          <button onClick={() => changeValue(value - 1)}>
            <Icon type="minus" />
          </button>
          {this.getValue(instance.control)}
          <button onClick={() => changeValue(value + 1)}>
            <Icon type="plus" />
          </button>
        </Fragment>
      );
    });
  },
};
