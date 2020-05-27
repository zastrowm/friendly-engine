import { buttonDescriptor } from './Button';
import { labelDescriptor } from './Label';
import { checkboxDescriptor } from './Checkbox';

export function addCommonControlDescriptors(controlDescriptors) {
  controlDescriptors.add(buttonDescriptor);
  controlDescriptors.add(labelDescriptor);
  controlDescriptors.add(checkboxDescriptor);
}

export { IControlDescriptor } from '../framework/controlRegistry';
export { Control, IControlSerializedData } from './Control';
