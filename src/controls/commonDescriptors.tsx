import { controlDescriptors } from '../framework/controlsRegistry';
import { buttonDescriptor } from './buttonDescriptor';
import { labelDescriptor } from './labelDescriptor';

export function installCommonDescriptors() {
  controlDescriptors.add(buttonDescriptor);
  controlDescriptors.add(labelDescriptor);
}

export * from '../framework/controlsRegistry';
