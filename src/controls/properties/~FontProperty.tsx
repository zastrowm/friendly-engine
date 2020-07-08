import { IEnumProperty, IProperty, PropertyType } from '../controlProperties';
import { IEnumValue } from '../../framework/Enums';

let defaultValue = '<default>';

let fontValues = [defaultValue, 'Times New Roman', 'Consolas', 'Fira Code'].map((it) => ({
  value: it.includes(' ') ? `"${it}"` : it,
  display: it,
}));

export const FontProperty: IProperty<HTMLElement, string> & IEnumProperty<string> = {
  id: 'text.fontFamily',
  displayName: 'Font',
  propertyType: PropertyType.string | PropertyType.enum,

  getValue(element) {
    return element.style.fontFamily ?? '<default>';
  },

  setValue(element, value) {
    if (value == defaultValue) {
      element.style.fontFamily = null;
    } else {
      element.style.fontFamily = value;
    }
  },

  serializeValue(element) {
    return element.style.fontFamily;
  },

  enumOptions: {
    values: fontValues,
    preexistingOnly: true,
  },
};