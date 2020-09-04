import { IProperty, PropertyType } from './controlProperties';

export const BackgroundColorProperty: IProperty<HTMLElement, string> = {
  id: 'control.backgroundColor',
  displayName: 'Background Color',
  propertyType: PropertyType.color,

  getValue(element: HTMLElement) {
    return element.style.backgroundColor ?? '';
  },

  setValue(element: HTMLElement, value: string) {
    element.style.backgroundColor = value;
  },

  serializeValue(element: HTMLElement) {
    let value = element.style.backgroundColor;
    if (value === "") {
      return undefined;
    }

    return value;
  },
};
