import { IControlDescriptor } from './controlRegistry';
import { assume } from '../framework/util';

import * as AllControls from './~AllControls';
import { Control } from './Control';

let knownControlDescriptors: IControlDescriptor<any>[] = [];

function isControlClass(descriptor: any) {
  return descriptor.prototype instanceof Control;
}

function isMissingProperty(descriptor: IControlDescriptor) {
  return descriptor.getProperties == null || descriptor.createInstance == null || descriptor.id == null;
}

// import all editors
for (let [key, value] of Object.entries(AllControls)) {
  assume<IControlDescriptor<any>>(value);

  // do a sanity test
  if (isControlClass(value)) {
    /* no-op - expected */
  } else if (isMissingProperty(value)) {
    console.error('Got a non control descriptor', key, value);
  } else {
    knownControlDescriptors.push(value);
  }
}

export function addCommonControlDescriptors(controlDescriptors) {
  for (let descriptor of knownControlDescriptors) {
    if (descriptor == AllControls.rootControlDescriptor) {
      // this one is excluded
      continue;
    }

    controlDescriptors.add(descriptor);
  }
}

export * from './controlRegistry';
export * from './Control';
export * from './controlProperties';
export * from './~AllControls';
export * from './ControlPositioning';
