import { IEnumProperty, IProperty, PropertyType } from './controlProperties';

export const HorizontalAlignmentProperty: IProperty<HTMLElement, string> & IEnumProperty<string> = {
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
    if (alignment === '') {
      return undefined;
    }
    return alignment;
  },

  enumOptions: {
    preexistingOnly: true,
    values: [
      {
        value: '',
        display: "<default>",
      },
      {
        value: 'left',
        display: "Left",
      },
      {
        value: 'right',
        display: "Right",
      },
      {
        value: 'center',
        display: "Center",
      }
    ]
  }
};
