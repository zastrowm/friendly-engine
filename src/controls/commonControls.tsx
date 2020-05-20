import { ControlDescriptors } from '../framework/controlsRegistry';
import { Button } from './Button';
import { Label } from './Label';
import { Checkbox } from './Checkbox';

export function installCommonDescriptors(controlDescriptors: ControlDescriptors) {
  controlDescriptors.add(Button);
  controlDescriptors.add(Checkbox);
  controlDescriptors.add(Label);
}

export { controlDescriptors, IControlDescriptor } from '../framework/controlsRegistry';
export { Control, ControlProperty, IPropertyEditor, IControlSerializedData } from './Control';
