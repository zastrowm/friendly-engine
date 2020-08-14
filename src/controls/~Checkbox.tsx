import {
  Control,
  implementProperty,
  IProperty,
  PropertyType,
  IControlDescriptor,
  ReflectionBasedDescriptor,
} from './@control';

import {
  FontSizeProperty,
  Formatting,
  HorizontalAlignmentProperty,
  TextContentProperty,
  TextFormattingProperty, VerticalAlignmentProperty,
} from './@properties';

import './~Checkbox.css';

/**
 * Whether or not the checkbox is checked
 */
const CheckedProperty: IProperty<HTMLInputElement, boolean> = {
  id: 'checkbox.isChecked',
  displayName: 'Checked',
  propertyType: PropertyType.boolean,

  /* override */
  getValue(element) {
    return element.checked;
  },

  /* override */
  setValue(element, value) {
    element.checked = value;
  },

  serializeValue(element) {
    return element.checked;
  },
};

export class Checkbox extends Control {
  private readonly input: HTMLInputElement;
  private readonly textElement: HTMLElement;

  constructor() {
    super();

    let root = document.createElement("div");
    this.input = document.createElement("input");
    this.input.type = "checkbox";
    this.textElement = document.createElement("span");
    root.appendChild(this.input);
    root.appendChild(this.textElement);
    this.setRoot(root);
  }

  @implementProperty(TextContentProperty, (c: Checkbox) => c.textElement)
  public text!: string;

  @implementProperty(TextFormattingProperty, (c: Checkbox) => c.root)
  public textFormatting!: Formatting;

  @implementProperty(FontSizeProperty, (c: Checkbox) => c.root)
  public fontSize!: number;

  @implementProperty(HorizontalAlignmentProperty, (c: Checkbox) => c.root)
  public textAlignment!: string;

  @implementProperty(VerticalAlignmentProperty, (c: Checkbox) => c.root)
  public verticalAlignment!: string;

  // @ts-ignore
  @implementProperty(CheckedProperty, (c: Checkbox) => c.input)
  public isChecked!: boolean;

  public get descriptor(): IControlDescriptor<Checkbox> {
    return checkboxDescriptor;
  }
}

export let checkboxDescriptor = new ReflectionBasedDescriptor('checkbox', 'Checkbox', Checkbox, () => ({
  position: {
    width: 150,
    height: 30,
  },
  properties: {
    [TextContentProperty.id]: 'Checkbox',
  },
}));
