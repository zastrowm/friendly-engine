import { controlDescriptors } from '../framework/controlsRegistry';
import { buttonDescriptor } from './button';
import { labelDescriptor } from './label';
import { checkboxDescriptor } from './checkbox';

export function installCommonDescriptors() {
  controlDescriptors.add(buttonDescriptor);
  controlDescriptors.add(labelDescriptor);
  controlDescriptors.add(checkboxDescriptor);
}

export { Control, controlDescriptors, IControlDescriptor, IControlSerializedData } from '../framework/controlsRegistry';
