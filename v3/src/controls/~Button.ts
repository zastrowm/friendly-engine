import {
  Control,
  implementProperty,
  IProperty,
  PropertyType,
  IControlDescriptor,
  ReflectionBasedDescriptor,
} from './@control';

import {
  FontProperty,
  FontSizeProperty,
  Formatting,
  HorizontalAlignmentProperty,
  TextContentProperty,
  TextFormattingProperty,
} from './@properties';

/**
 * The text that should be shown when the button is clicked
 */
const ClickActionProperty: IProperty<HTMLElement, Formatting> = {
  id: 'button.scripts.click',
  displayName: '',
  propertyType: PropertyType.script,

  /* override */
  getValue(element) {
    return (element as any).scriptsClick ?? '';
  },

  /* override */
  setValue(element, value) {
    (element as any).scriptsClick = value;
  },
};

export class Button extends Control {

  private buttonElement: HTMLButtonElement;

  constructor() {
    super();

    this.buttonElement = document.createElement('button');
    this.buttonElement.addEventListener("click", () => alert('hello'))
    this.setRoot(this.buttonElement);
  }

  @implementProperty(TextContentProperty, (c: Button) => c.buttonElement)
  public text!: string;

  @implementProperty(TextFormattingProperty, (c: Button) => c.buttonElement)
  public textFormatting!: Formatting;

  @implementProperty(FontProperty, (c: Button) => c.buttonElement)
  public fontFamily!: string;

  @implementProperty(FontSizeProperty, (c: Button) => c.buttonElement)
  public fontSize!: number;

  @implementProperty(HorizontalAlignmentProperty, (c: Button) => c.buttonElement)
  public textAlignment!: string;

  @implementProperty(ClickActionProperty, (c: Button) => c.buttonElement)
  public clickScript!: string;

  public get descriptor(): IControlDescriptor {
    return buttonDescriptor;
  }
}

export let buttonDescriptor = new ReflectionBasedDescriptor('button', 'Button', Button, () => ({
  position: {
    width: 100,
    height: 30,
  },
}));
