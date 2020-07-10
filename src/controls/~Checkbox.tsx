import { Fragment, h, renderToElement } from '@friendly/elements/jsxElements';
import {
  Control,
  implementProperty,
  IProperty,
  PropertyType,
  IControlDescriptor,
  ReflectionBasedDescriptor,
} from '@/control';
import {
  FontSizeProperty,
  Formatting,
  HorizontalAlignmentProperty,
  TextContentProperty,
  TextFormattingProperty,
  VerticalAlignmentProperty,
} from '@/control/standardProperties';

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
    return element.checked === true;
  },
};

export class Checkbox extends Control {
  private input: HTMLInputElement;
  private textElement: HTMLElement;
  private root: HTMLElement;

  @implementProperty(TextContentProperty, (c: Checkbox) => c.textElement)
  public text: string;

  @implementProperty(TextFormattingProperty, (c: Checkbox) => c.root)
  public textFormatting: Formatting;

  @implementProperty(FontSizeProperty, (c: Checkbox) => c.root)
  public fontSize: number;

  @implementProperty(HorizontalAlignmentProperty, (c: Checkbox) => c.root)
  public textAlignment: string;

  @implementProperty(VerticalAlignmentProperty, (c: Checkbox) => c.root)
  public verticalAlignment: string;

  @implementProperty(CheckedProperty, (c: Checkbox) => c.input)
  public isChecked: boolean;

  public get descriptor(): IControlDescriptor<Checkbox> {
    return checkboxDescriptor;
  }

  protected initialize(): HTMLElement {
    this.root = renderToElement(
      'div',
      <Fragment>
        <input ref={(e) => (this.input = e)} type="checkbox" />
        <span ref={(e) => (this.textElement = e)} />
      </Fragment>,
    );

    return this.root;
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
