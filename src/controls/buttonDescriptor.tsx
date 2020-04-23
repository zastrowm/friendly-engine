import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import {
  BaseControlDescriptor,
  GettableSettableProperty,
  PropertyType,
  IPropertyEditor,
} from 'src/framework/controlsRegistry';
import { ControlContainer } from 'src/components/design/control-container.e';
import { renderToFragment, h } from '@friendly/elements/jsxElements';
import { CodeDialog } from 'src/components/code/code-dialog.e';

let codeDialog = CodeDialog.createInstance();

document.body.append(codeDialog);

/**
 * The text that should be shown when the button is clicked
 */
class ClickActionProperty extends GettableSettableProperty<string> {
  constructor() {
    super('button.click.script', '', PropertyType.string);
  }

  setValue(instance: ControlContainer, value: string) {
    (instance as any).scriptsClick = value;
  }
  getValue(instance: ControlContainer): string {
    return (instance as any).scriptsClick ?? '';
  }

  getEditor(instance: ControlContainer): IPropertyEditor {
    let onEditScript = async () => {
      let response = await codeDialog.showDialog(`${instance.uniqueId}.click`, this.getValue(instance));
      if (response.didSave) {
        this.setValue(instance, response.code);
      }
    };

    let onTestScript = () => {
      eval(this.getValue(instance));
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
  }
}

class ButtonDescriptor extends BaseControlDescriptor {
  public id = 'button';

  private static properties = [new TextContentProperty(), new TextAlignmentProperty(), new ClickActionProperty()];

  public createInstance(): HTMLElement {
    return document.createElement('button');
  }

  public getProperties() {
    return ButtonDescriptor.properties;
  }
}

export let buttonDescriptor = new ButtonDescriptor();
