import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import { IControlDescriptor, ReflectionBasedDescriptor } from 'src/framework/controlsRegistry';
import { Control, controlProperty } from './Control';
import { Formatting, TextFormattingProperty } from './editors/TextFormattingProperty';

export class Label extends Control {
  private labelElement: HTMLDivElement;

  @controlProperty(new TextAlignmentProperty((c: Label) => c.labelElement))
  public text: string;

  @controlProperty(new TextFormattingProperty((c: Label) => c.labelElement))
  public textFormatting: Formatting;

  @controlProperty(new TextContentProperty((c: Label) => c.labelElement))
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
