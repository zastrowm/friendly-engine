import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import { IControlDescriptor, ReflectionBasedDescriptor } from 'src/framework/controlsRegistry';
import { ControlContainer } from 'src/components/design/control-container.e';
import { h, renderToFragment } from '@friendly/elements/jsxElements';
import { CodeDialog } from 'src/components/code/code-dialog.e';
import { Control, ControlProperty, controlProperty, IPropertyEditor } from './Control';
import { Formatting, TextFormattingProperty } from './editors/TextFormattingProperty';
import { FontSizeProperty } from "./editors/FontSizeProperty";

let codeDialog = CodeDialog.createInstance();

document.body.append(codeDialog);

/**
 * The text that should be shown when the button is clicked
 */
class ClickActionProperty extends ControlProperty<string> {
  id: 'button.scripts.click';
  displayName: '';

  /* override */
  getValueRaw(e: HTMLElement): string {
    return (e as any).scriptsClick ?? '';
  }

  /* override */
  setValueRaw(e: HTMLElement, value: string) {
    (e as any).scriptsClick = value;
  }

  /* override */
  protected hasDefaultValueRaw(e: HTMLElement): boolean {
    return (e as any).scriptsClick == null;
  }

  getEditor(instance: ControlContainer): IPropertyEditor {
    let onEditScript = async () => {
      let response = await codeDialog.showDialog(`${instance.control.id}.click`, this.getValue(instance.control));
      if (response.didSave) {
        this.setValue(instance.control, response.code);
      }
    };

    let onTestScript = () => {
      eval(this.getValue(instance.control));
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

export class Button extends Control {
  private buttonElement: HTMLButtonElement;

  @controlProperty(new TextAlignmentProperty((c: Button) => c.buttonElement))
  public text: string;

  @controlProperty(new TextFormattingProperty((c: Button) => c.buttonElement))
  public textFormatting: Formatting;

  @controlProperty(new FontSizeProperty((c: Button) => c.buttonElement))
  public fontSize: number;

  @controlProperty(new TextContentProperty((c: Button) => c.buttonElement))
  public textAlignment: string;

  @controlProperty(new ClickActionProperty((c: Button) => c.buttonElement))
  public clickScript: string;

  protected initialize(): HTMLElement {
    this.buttonElement = document.createElement('button');
    return this.buttonElement;
  }

  public get descriptor(): IControlDescriptor<Control> {
    return buttonDescriptor;
  }
}

export let buttonDescriptor = new ReflectionBasedDescriptor('button', Button);
