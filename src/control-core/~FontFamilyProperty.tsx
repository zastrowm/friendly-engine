import { IEnumProperty, IProperty, PropertyType } from './controlProperties';

let defaultValue = '<default>';
let defaultCssValue = '';

let fontValues = [defaultValue, 'Times New Roman', 'Consolas', 'Fira Code'].map((it) => ({
  value: it.includes(' ') ? `"${it}"` : it,
  display: it,
}));

export const FontFamilyProperty: IProperty<HTMLElement, string> & IEnumProperty<string> = {
  id: 'text.fontFamily',
  displayName: 'Font',
  propertyType: PropertyType.string | PropertyType.enum,

  getValue(element) {
    if (element.style.fontFamily === defaultCssValue) {
      return defaultValue;
    } else {
      return element.style.fontFamily;
    }
  },

  setValue(element, value) {
    if (value === defaultValue) {
      element.style.fontFamily = defaultCssValue;
    } else {
      element.style.fontFamily = value;
    }
  },

  serializeValue(element) {
    if (element.style.fontFamily === defaultCssValue) {
      return undefined;
    }
    return element.style.fontFamily;
  },

  enumOptions: {
    values: fontValues,
    preexistingOnly: true,
  },
};
