import {
  Control,
  implementProperty,
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

import './~Label.css';

export class Label extends Control {
  private readonly labelElement: HTMLDivElement;

  constructor() {
    super();

    this.labelElement = document.createElement('div');
    this.setRoot(this.labelElement);
  }

  @implementProperty(TextContentProperty, (c: Label) => c.labelElement)
  public text!: string;

  @implementProperty(TextFormattingProperty, (c: Label) => c.labelElement)
  public textFormatting!: Formatting;

  @implementProperty(FontSizeProperty, (c: Label) => c.labelElement)
  public fontSize!: number;

  @implementProperty(HorizontalAlignmentProperty, (c: Label) => c.labelElement)
  public textAlignment!: string;

  @implementProperty(VerticalAlignmentProperty, (c: Label) => c.labelElement)
  public verticalAlignment!: string;

  public get descriptor(): IControlDescriptor<Label> {
    return labelDescriptor;
  }
}

export let labelDescriptor = new ReflectionBasedDescriptor('label', 'Label', Label, () => ({
  position: {
    width: 200,
    height: 30,
  },
  properties: {
    [TextContentProperty.id]: 'A simple label',
  },
}));
