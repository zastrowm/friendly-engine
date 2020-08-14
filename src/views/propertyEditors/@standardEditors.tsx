import * as AllPropertyEditors from './~AllPropertyEditors';
import { IPropertyEditor, PropertyEditorRegistry } from './propertyEditor';
import { assume } from '../../util/util';

let commonEditors: IPropertyEditor<any>[] = [];

// import all editors
for (let [key, value] of Object.entries(AllPropertyEditors)) {
  assume<IPropertyEditor<any>>(value);

  // do a sanity test
  if (value.factory == null) {
    throw new Error(`Got a non property-editor with key of ${key}`);
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
