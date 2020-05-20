import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import { ControlContainer } from 'src/components/design/control-container.e';
import { h, renderToFragment } from '@friendly/elements/jsxElements';
import { CodeDialog } from 'src/components/code/code-dialog.e';
import { TextFormattingProperty } from './editors/TextFormattingProperty';
import { FontSizeProperty } from './editors/FontSizeProperty';
import { IControlWithText } from './^TextControl';
import { IPropertyEditor } from './framework/controlPropertyEditor';
import { createControlDefinition, IOwnedProperty, PropertyType } from './framework/defineControl';

let codeDialog = CodeDialog.createInstance();

document.body.append(codeDialog);

/**
 * The text that should be shown when the button is clicked
 */
const ClickActionProperty: IOwnedProperty<HTMLElement, string> = {
  id: 'button.scripts.click',
  displayName: 'Click Script',
  propertyType: PropertyType.string,

  /* override */
  getValue(element: HTMLElement) {
    return (element as any).scriptsClick ?? '';
  },

  setValue(element: HTMLElement, value: string) {
    (element as any).scriptsClick = value;
  },

  getEditor(instance: ControlContainer): IPropertyEditor {
    let onEditScript = async () => {
      let response = await codeDialog.showDialog(`${instance.control.id}.click`, this.getValue(instance.control.state));
      if (response.didSave) {
        this.setValue(instance.control.state, response.code);
      }
    };

    let onTestScript = () => {
      eval(this.getValue(instance.control.state));
    };

    let fragment = renderToFragment([
      <a href="#" onClick={onEditScript}>
        Edit Script
      </a>,
      <br />,
      <a href="#" onClick={onTestScript}>
        Test Script
      </a>,
    ]);

    return {
      elementToMount: fragment as any,
    };
  },
};

interface IButton extends IControlWithText {
  clickScript: string;
}

interface IButtonState {
  root: HTMLElement;
}

export const Button = createControlDefinition<IButton, IButtonState>({
  id: 'button',
  displayName: 'Button',
  factory: function () {
    let button = document.createElement('button');
    return {
      root: button,
      button: button,
    };
  },
}).defineProperties((meta) => ({
  text: meta.compose(TextContentProperty, 'root'),
  fontSize: meta.compose(FontSizeProperty, 'root'),
  textFormatting: meta.compose(TextFormattingProperty, 'root'),
  textAlignment: meta.compose(TextAlignmentProperty, 'root'),
  clickScript: meta.compose(ClickActionProperty, 'root'),
}));

let test = Button.descriptor;
let button = new Button();
button.textAlignment = 9;
