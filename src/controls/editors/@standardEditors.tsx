import { IPropertyEditor, PropertyEditorRegistry } from '@/control/propertyEditor';
import { h } from '@friendly/elements/jsxElements';

import { assume } from '@/framework/util';

import * as AllPropertyEditors from './~AllPropertyEditors';

let commonEditors: IPropertyEditor<any>[] = [];

// import all editors
for (let [key, value] of Object.entries(AllPropertyEditors)) {
  assume<IPropertyEditor<any>>(value);

  // do a sanity test
  if (value.createEditorFor == null) {
    console.error('Got a non property-editor', key, value);
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
