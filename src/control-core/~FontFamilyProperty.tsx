import { IEnumProperty, IProperty, PropertyType } from './controlProperties';

export const DefaultFontValue = '<default>';
let defaultCssValue = '';

let fontValues = [DefaultFontValue, 'Times New Roman', 'Consolas', 'Fira Code'].map((it) => ({
  value: it.includes(' ') ? `"${it}"` : it,
  display: it,
}));

export const FontFamilyProperty: IProperty<HTMLElement, string> & IEnumProperty<string> = {
  id: 'text.fontFamily',
  displayName: 'Font',
  propertyType: PropertyType.string | PropertyType.enum,

  getValue(element) {
    if (element.style.fontFamily === defaultCssValue) {
      return DefaultFontValue;
    } else {
      return element.style.fontFamily;
    }
  },

  setValue(element, value) {
    if (value === DefaultFontValue) {
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
