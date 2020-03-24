import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { ControlContainer } from '../components/design/control-container.e';
import { IPropertyDescriptor, GettableSettableProperty, IControlDescriptor } from '../framework/controlsRegistry';
import { TextContentProperty } from './editors/TextContentProperty';

class LabelDescriptor implements IControlDescriptor {
  public id = 'label';

  private static properties = [new TextContentProperty(), new TextAlignmentProperty()];

  public createInstance(): HTMLElement {
    return document.createElement('div');
  }

  public getProperties() {
    return LabelDescriptor.properties;
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

export let labelDescriptor = new LabelDescriptor();
