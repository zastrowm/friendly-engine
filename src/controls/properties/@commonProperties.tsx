import { IProperty, PropertyType } from '../controlProperties';

export const BackgroundProperty: IProperty<HTMLElement, string> = {
  id: 'control.backgroundColor',
  displayName: 'Background Color',
  propertyType: PropertyType.string,

  getValue(element) {
    return element.style.backgroundColor;
  },

  setValue(element, value) {
    element.style.backgroundColor = value;
  },

  serializeValue(element) {
    return this.getValue(element);
  },
};

export const TextContentProperty: IProperty<HTMLElement, string> = {
  id: 'text.text',
  displayName: 'Text',
  propertyType: PropertyType.string,

  getValue(element) {
    return element.textContent;
  },

  setValue(element, value) {
    element.textContent = value;
  },

  serializeValue(element) {
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

  getValue(element) {
    let fontSize = getComputedStyle(element).fontSize;
    return Number(fontSize.substr(0, fontSize.length - 2));
  },

  setValue(element, value) {
    element.style.fontSize = value + 'px';
  },

  serializeValue(element) {
    let fontSize = element.style.fontSize;
    if (fontSize == null) {
      return undefined;
    }

    return Number(fontSize.substr(0, fontSize.length - 2));
  },
};

export const TextAlignmentProperty: IProperty<HTMLElement, string> = {
  id: 'text.alignment',
  displayName: 'Alignment',
  propertyType: PropertyType.string,

  getValue(element) {
    return getComputedStyle(element).textAlign;
  },

  setValue(element, value) {
    element.style.textAlign = value;
  },

  serializeValue(element) {
    return element.style.textAlign;
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

  getValue(element) {
    return (
      (element.style.fontWeight == 'bold' ? Formatting.Bold : Formatting.None) |
      (element.style.textDecoration == 'underline' ? Formatting.Underline : Formatting.None) |
      (element.style.fontStyle == 'italic' ? Formatting.Italics : Formatting.None)
    );
  },

  setValue(element, value) {
    element.style.fontWeight = (value & Formatting.Bold) > 0 ? 'bold' : null;
    element.style.textDecoration = (value & Formatting.Underline) > 0 ? 'underline' : null;
    element.style.fontStyle = (value & Formatting.Italics) > 0 ? 'italic' : null;
  },

  serializeValue(element) {
    let value = this.getValue();
    return value > 0 ? value : undefined;
  },
};
