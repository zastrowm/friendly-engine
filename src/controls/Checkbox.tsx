import { Fragment, h, renderToElement } from '@friendly/elements/jsxElements';

import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { ControlContainer } from 'src/components/design/control-container.e';
import { TextContentProperty } from './editors/TextContentProperty';
import { IPropertyEditor } from './Control';
import { TextFormattingProperty } from './editors/TextFormattingProperty';
import { FontSizeProperty } from './editors/FontSizeProperty';
import { IControlWithText } from './^TextControl';
import { createControlDefinition, IOwnedProperty, PropertyType } from './defineControl';

export const CheckedProperty: IOwnedProperty<HTMLElement, boolean> = {
  id: 'checkbox.isChecked',
  displayName: 'Checked',
  propertyType: PropertyType.boolean,

  getValue(e: HTMLInputElement) {
    return e.checked;
  },

  setValue(e: HTMLInputElement, value: boolean) {
    e.checked = value;
  },

  getEditor(instance: ControlContainer): IPropertyEditor {
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
  },
};

interface ICheckbox extends IControlWithText {
  isChecked: boolean;
}

export const Checkbox = createControlDefinition<ICheckbox>({
  id: 'checkbox',
  displayName: 'Checkbox',
})
  .withFactory(() => {
    let input: HTMLElement;
    let textElement: HTMLElement;

    let root = renderToElement(
      'div',
      <Fragment>
        <input ref={(e) => (input = e)} type="checkbox" />
        <span ref={(e) => (textElement = e)} />
      </Fragment>,
    );

    return {
      root,
      input,
      textElement,
    };
  })
  .defineProperties((meta) => ({
    text: meta.compose(TextContentProperty, 'textElement'),
    fontSize: meta.compose(FontSizeProperty, 'textElement'),
    textFormatting: meta.compose(TextFormattingProperty, 'textElement'),
    textAlignment: meta.compose(TextAlignmentProperty, 'textElement'),
    isChecked: meta.compose(CheckedProperty, 'input'),
  }));
