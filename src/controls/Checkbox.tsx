import { h, Fragment, renderToElement } from '@friendly/elements/jsxElements';

import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { IControlDescriptor, ReflectionBasedDescriptor } from 'src/framework/controlsRegistry';
import { ControlContainer } from 'src/components/design/control-container.e';
import { TextContentProperty } from './editors/TextContentProperty';
import { ControlProperty, IPropertyEditor, Control, controlProperty } from './Control';

/**
 * Whether or not the checkbox is checked
 */
class CheckedProperty extends ControlProperty<boolean> {
  public id = 'checkbox.isChecked';
  public displayName = 'Checked';

  /* override */
  protected getValueRaw(e: HTMLInputElement) {
    return e.checked;
  }

  /* override */
  protected setValueRaw(e: HTMLInputElement, value: boolean) {
    e.checked = value;
  }

  /* override */
  protected hasDefaultValueRaw(e: HTMLInputElement): boolean {
    return e.checked == false;
  }

  public getEditor(instance: ControlContainer): IPropertyEditor {
    return this.createJsxEditor(instance, (refresh) => (
      <input
        type="checkbox"
        checked={this.getValue(instance.control)}
        onChange={() => {
          let old = this.getValue(instance.control);
          refresh({ old: old, new: !old });
        }}
      />
    ));
  }
}

export class Checkbox extends Control {
  private input: HTMLInputElement;
  private textElement: HTMLElement;

  @controlProperty(new TextAlignmentProperty((c: Checkbox) => c.textElement))
  public text: string;

  @controlProperty(new TextContentProperty((c: Checkbox) => c.textElement))
  public textAlignment: string;

  @controlProperty(new CheckedProperty((c: Checkbox) => c.input))
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
