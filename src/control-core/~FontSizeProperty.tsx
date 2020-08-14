import { IProperty, PropertyType } from './controlProperties';

export const FontSizeProperty: IProperty<HTMLElement, number> = {
  id: 'text.size',
  displayName: 'Font Size',
  propertyType: PropertyType.string,

  getValue(element: HTMLElement) {
    let fontSize = getComputedStyle(element).fontSize;
    return Number(fontSize.substr(0, fontSize.length - 2));
  },

  setValue(element: HTMLElement, value: number) {
    element.style.fontSize = value + 'px';
  },

  serializeValue(element: HTMLElement) {
    let fontSize = element.style.fontSize;
    if (fontSize === '') {
      return undefined;
    }

    return Number(fontSize.substr(0, fontSize.length - 2));
  },
};
