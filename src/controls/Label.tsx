import { IControlDescriptor, ReflectionBasedDescriptor } from 'src/framework/controlRegistry';
import { Control, implementProperty } from './Control';
import {
  FontSizeProperty,
  Formatting,
  TextAlignmentProperty,
  TextContentProperty,
  TextFormattingProperty,
} from './properties/@commonProperties';

export class Label extends Control {
  private labelElement: HTMLDivElement;

  @implementProperty(TextContentProperty, (c: Label) => c.labelElement)
  public text: string;

  @implementProperty(TextFormattingProperty, (c: Label) => c.labelElement)
  public textFormatting: Formatting;

  @implementProperty(FontSizeProperty, (c: Label) => c.labelElement)
  public fontSize: number;

  @implementProperty(TextAlignmentProperty, (c: Label) => c.labelElement)
  public textAlignment: string;

  protected initialize(): HTMLElement {
    this.labelElement = document.createElement('div');
    return this.labelElement;
  }

  public get descriptor(): IControlDescriptor<Label> {
    return labelDescriptor;
  }
}

export let labelDescriptor = new ReflectionBasedDescriptor('label', Label);
