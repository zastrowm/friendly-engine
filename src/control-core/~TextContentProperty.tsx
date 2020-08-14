import { IProperty, PropertyType, TextContentId } from './controlProperties';

export const TextContentProperty: IProperty<HTMLElement, string> = {
  id: TextContentId,
  displayName: 'Text',
  propertyType: PropertyType.string,

  getValue(element: HTMLElement): string {
    return element.textContent ?? '';
  },

  setValue(element: HTMLElement, value: string) {
    element.textContent = value;
  },

  serializeValue(element: HTMLElement) {
    let value = element?.textContent;
    if (value == null || value.length === 0) {
      return undefined;
    }

    return value;
  },
};
