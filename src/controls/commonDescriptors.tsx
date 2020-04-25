import { controlDescriptors } from '../framework/controlsRegistry';
import { buttonDescriptor } from './buttonDescriptor';
import { labelDescriptor } from './labelDescriptor';
import { checkboxDescriptor } from './checkboxDescriptor';

export function installCommonDescriptors() {
  controlDescriptors.add(buttonDescriptor);
  controlDescriptors.add(labelDescriptor);
  controlDescriptors.add(checkboxDescriptor);
}

export * from '../framework/controlsRegistry';
