import { IProperty, PropertyType } from './controlProperties';

export enum Formatting {
  None = 0,
  Bold = 1 << 1,
  Italics = 1 << 2,
  Underline = 1 << 3,
}

export const TextFormattingProperty: IProperty<HTMLElement, Formatting> = {
  id: 'text.formatting',
  displayName: 'Formatting',
  propertyType: PropertyType.number | PropertyType.enum,

  getValue(element: HTMLElement) {
    return (
      (element.style.fontWeight === 'bold' ? Formatting.Bold : Formatting.None) |
      (element.style.textDecoration === 'underline' ? Formatting.Underline : Formatting.None) |
      (element.style.fontStyle === 'italic' ? Formatting.Italics : Formatting.None)
    );
  },

  setValue(element: HTMLElement, value: Formatting) {
    element.style.fontWeight = (value & Formatting.Bold) > 0 ? 'bold' : '';
    element.style.textDecoration = (value & Formatting.Underline) > 0 ? 'underline' : '';
    element.style.fontStyle = (value & Formatting.Italics) > 0 ? 'italic' : '';
  },

  serializeValue(element: HTMLElement) {
    let value = this.getValue(element);
    return value > 0 ? value : undefined;
  },
};
