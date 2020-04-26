import { controlDescriptors } from '../framework/controlsRegistry';
import { buttonDescriptor } from './button2';
import { labelDescriptor } from './label2';
import { checkboxDescriptor } from './checkbox2';

export function installCommonDescriptors() {
  controlDescriptors.add(buttonDescriptor);
  controlDescriptors.add(labelDescriptor);
  controlDescriptors.add(checkboxDescriptor);
}

export {
  controlDescriptors,
  IControlDescriptor,
  IControlSerializedData,
  deserializeProperties,
  serializeProperties,
} from '../framework/controlsRegistry';
export { Control, ControlProperty, IPropertyEditor } from './Control';
