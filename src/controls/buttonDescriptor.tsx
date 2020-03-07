import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { ControlContainer } from '../components/design/control-container';
import { IPropertyDescriptor, GettableSettableProperty, IControlDescriptor } from '../framework/controlsRegistry';
import { TextContentProperty } from './editors/TextContentProperty';

class ButtonDescriptor implements IControlDescriptor {
  public id = 'button';

  private static properties = [new TextContentProperty(), new TextAlignmentProperty()];

  public createInstance(): HTMLElement {
    return document.createElement('button');
  }

  public getProperties() {
    return ButtonDescriptor.properties;
  }

  setValue(element: ControlContainer, property: IPropertyDescriptor, value: any) {
    if (property instanceof GettableSettableProperty) {
      return property.setValue(element, value);
    }

    throw new Error('Property set not supported: ' + property.name);
  }

  getValue(element: ControlContainer, property: IPropertyDescriptor) {
    if (property instanceof GettableSettableProperty) {
      return property.getValue(element);
    }

    throw new Error('Property get not supported: ' + property.name);
  }
}

export let buttonDescriptor = new ButtonDescriptor();
