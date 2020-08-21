import { IProperty, PropertyType } from './controlProperties';

export const HorizontalAlignmentProperty: IProperty<HTMLElement, string> = {
  id: 'text.alignment',
  displayName: 'Alignment',
  propertyType: PropertyType.string,

  getValue(element: HTMLElement) {
    return getComputedStyle(element).textAlign;
  },

  setValue(element: HTMLElement, value: string) {
    element.style.textAlign = value;
  },

  serializeValue(element: HTMLElement) {
    let alignment = element.style.textAlign;
    if (alignment == '') {
      return undefined;
    }
    return alignment;
  },
};
