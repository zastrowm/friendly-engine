import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import {
  BaseControlDescriptor,
  GettableSettableProperty,
  PropertyType,
  IPropertyEditor,
} from 'src/framework/controlsRegistry';
import { ControlContainer } from 'src/components/design/control-container.e';
import { createTextBoxEditor } from './editors/_shared';

/**
 * The text that should be shown when the button is clicked
 */
class AlertTextProperty extends GettableSettableProperty<string> {
  constructor() {
    super('button.alert.text', 'Alert Text', PropertyType.string);
  }

  setValue(instance: ControlContainer, value: string) {
    (instance as any).alertText = value;
  }
  getValue(instance: ControlContainer): string {
    return (instance as any).alertText ?? '';
  }

  getEditor(instance: ControlContainer): IPropertyEditor {
    return createTextBoxEditor(this, instance);
  }
}

/**
 * Stubbed property merely for exposing an editor that allows the user to test the button.
 */
class ButtonClickProperty extends GettableSettableProperty<void> {
  constructor() {
    super('button.action', '', PropertyType.action);
  }

  setValue(_1: ControlContainer, _2: void) {
    /* no-op */
  }

  getValue(_: ControlContainer): void {
    /* no-op */
  }

  getEditor(instance: ControlContainer): IPropertyEditor {
    let button = document.createElement('button');
    button.addEventListener('click', function () {
      let alertText = new AlertTextProperty().getValue(instance);
      alert(alertText);
    });
    button.textContent = 'Test Alert';

    return {
      elementToMount: button,
    };
  }
}

class ButtonDescriptor extends BaseControlDescriptor {
  public id = 'button';

  private static properties = [
    new TextContentProperty(),
    new TextAlignmentProperty(),
    new AlertTextProperty(),
    new ButtonClickProperty(),
  ];

  public createInstance(): HTMLElement {
    return document.createElement('button');
  }

  public getProperties() {
    return ButtonDescriptor.properties;
  }
}

export let buttonDescriptor = new ButtonDescriptor();
