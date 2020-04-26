import { h, Fragment, renderToElement } from '@friendly/elements/jsxElements';
import {
  ControlProperty,
  Control,
  controlProperty,
  Descriptor,
  ReflectionBasedDescriptor,
} from 'src/framework/descriptors';

class TextAlignmentProperty extends ControlProperty<string> {
  id: 'text.alignment';
  displayName: 'Text Alignment';

  getValue = (e: HTMLElement) => e.style.textAlign;
  setValue = (e: HTMLElement, value: string) => (e.style.textAlign = value);
}

class TextContentProperty extends ControlProperty<string> {
  id: 'text.text';
  displayName: 'Text';

  getValue = (e: HTMLElement) => e.textContent;
  setValue = (e: HTMLElement, value: string) => (e.textContent = value);
}

class Checkbox extends Control {
  private input: HTMLInputElement;
  private textElement: HTMLElement;

  @controlProperty(new TextAlignmentProperty((c: Checkbox) => c.textElement))
  public text: string;

  @controlProperty(new TextContentProperty((c: Checkbox) => c.input))
  public textAlignment: string;

  @controlProperty('Checked', 'checkbox.isChecked', (c: Checkbox) => c.input.checked)
  public clickScript: boolean;

  public get descriptor(): Descriptor<Checkbox> {
    return checkboxDescriptor;
  }

  protected initialize(): HTMLElement {
    return renderToElement(
      'div',
      <Fragment>
        <input type="checkbox" />
        <span></span>
      </Fragment>,
    );
  }
}

export let checkboxDescriptor = new ReflectionBasedDescriptor(Checkbox);
