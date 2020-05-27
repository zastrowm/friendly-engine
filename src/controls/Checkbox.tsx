import { Fragment, h, renderToElement } from '@friendly/elements/jsxElements';
import { IControlDescriptor, ReflectionBasedDescriptor } from 'src/framework/controlRegistry';
import { Control, implementProperty, IProperty, PropertyType } from './Control';
import {
  FontSizeProperty,
  Formatting,
  TextAlignmentProperty,
  TextContentProperty,
  TextFormattingProperty,
} from './properties/@commonProperties';

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

  @implementProperty(TextContentProperty, (c: Checkbox) => c.textElement)
  public text: string;

  @implementProperty(TextFormattingProperty, (c: Checkbox) => c.textElement)
  public textFormatting: Formatting;

  @implementProperty(FontSizeProperty, (c: Checkbox) => c.textElement)
  public fontSize: number;

  @implementProperty(TextAlignmentProperty, (c: Checkbox) => c.textElement)
  public textAlignment: string;

  @implementProperty(CheckedProperty, (c: Checkbox) => c.input)
  public isChecked: boolean;

  public get descriptor(): IControlDescriptor<Checkbox> {
    return checkboxDescriptor;
  }

  protected initialize(): HTMLElement {
    let root = renderToElement(
      'div',
      <Fragment>
        <input ref={(e) => (this.input = e)} type="checkbox" />
        <span ref={(e) => (this.textElement = e)}></span>
      </Fragment>,
    );

    return root;
  }
}

export let checkboxDescriptor = new ReflectionBasedDescriptor('checkbox', Checkbox);
