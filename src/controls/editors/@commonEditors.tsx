import { IPropEditor, PropertyEditorRegistry } from './propertyEditor';
import { h } from '@friendly/elements/jsxElements';

import { assume } from '../../framework/util';

import * as AllPropertyEditors from './~AllPropertyEditors';

let commonEditors: IPropEditor<any>[] = [];

// import all editors
for (let [key, value] of Object.entries(AllPropertyEditors)) {
  assume<IPropEditor<any>>(value);

  // do a sanity test
  if (value.createEditorFor == null) {
    console.log('Got a non property-editor', key, value);
  } else {
    commonEditors.push(value);
  }
}

export function addCommonPropertyEditors(registry: PropertyEditorRegistry) {
  for (let editor of commonEditors) {
    registry.add(editor);
  }
}

export * from './~AllPropertyEditors';
