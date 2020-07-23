import { IProperty, PropertyType, TextContentId } from "./controlProperties";

export const BackgroundProperty: IProperty<HTMLElement, string> = {
  id: 'control.backgroundColor',
  displayName: 'Background Color',
  propertyType: PropertyType.string,

  getValue(element: HTMLElement) {
    return element.style.backgroundColor;
  },

  setValue(element: HTMLElement, value: string) {
    element.style.backgroundColor = value;
  },

  serializeValue(element: HTMLElement) {
    return this.getValue(element);
  },
};

export const TextContentProperty: IProperty<HTMLElement, string> = {
  id: TextContentId,
  displayName: 'Text',
  propertyType: PropertyType.string,

  getValue(element: HTMLElement): string {
    return element.textContent ?? "";
  },

  setValue(element: HTMLElement, value: string) {
    element.textContent = value;
  },

  serializeValue(element: HTMLElement) {
    let value = element?.textContent;
    if (value == null || value.length == 0) {
      return undefined;
    }

    return value;
  },
};

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
    if (fontSize == '') {
      return undefined;
    }

    return Number(fontSize.substr(0, fontSize.length - 2));
  },
};

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
    return element.style.textAlign;
  },
};

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
      (element.style.fontWeight == 'bold' ? Formatting.Bold : Formatting.None) |
      (element.style.textDecoration == 'underline' ? Formatting.Underline : Formatting.None) |
      (element.style.fontStyle == 'italic' ? Formatting.Italics : Formatting.None)
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
    return element.style.backgroundColor ?? undefined;
  },
};
