import { controlDescriptors } from '../framework/controlsRegistry';
import { buttonDescriptor } from './button';
import { labelDescriptor } from './label';
import { checkboxDescriptor } from './checkbox';

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
