import { IProperty, PropertyType } from './controlProperties';

export const VerticalAlignmentProperty: IProperty<HTMLElement, string> = {
  id: 'content.verticalAlignment',
  displayName: 'Vertical Alignment',
  propertyType: PropertyType.string,

  getValue(element: HTMLElement) {
    return getComputedStyle(element).alignItems;
  },

  setValue(element: HTMLElement, value: string) {
    element.style.alignItems = value;
  },

  serializeValue(element: HTMLElement) {
    return element.style.alignItems;
  },
};
