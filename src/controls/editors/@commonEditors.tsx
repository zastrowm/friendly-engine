import { IPropEditor, PropertyEditorRegistry } from './propertyEditor';
import { h } from '@friendly/elements/jsxElements';

import { assume } from '../../framework/util';

import * as TextPropertyEditors from './~TextPropertyEditors';
import * as ScriptPropertyEditors from './~ScriptPropertyEditor';
import * as BackgroundProperties from './~BackgroundColorPropertyEditor';

let commonEditors: IPropEditor<any>[] = [];

function importAllValuesOf(data: any) {
  for (let [key, value] of Object.entries(data)) {
    assume<IPropEditor<any>>(value);

    // do a sanity test
    if (value.createEditorFor == null) {
      console.log('Got a non property-editor', key, value);
    } else {
      commonEditors.push(value);
    }
  }
}

importAllValuesOf(TextPropertyEditors);
importAllValuesOf(ScriptPropertyEditors);
importAllValuesOf(BackgroundProperties);

export function addCommonPropertyEditors(registry: PropertyEditorRegistry) {
  for (let editor of commonEditors) {
    registry.add(editor);
  }
}
