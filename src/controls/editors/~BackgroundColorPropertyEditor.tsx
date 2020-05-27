import { PropertyType } from '../controlProperties';
import { h, renderToFragment } from '@friendly/elements/jsxElements';
import { CodeDialog } from '../../components/code/code-dialog.e';
import { setPropertyUndoRedo } from './_shared';
import { IPropEditor, isAttached } from './propertyEditor';

let codeDialog = CodeDialog.createInstance();
document.body.append(codeDialog);

export const ScriptPropertyEditor: IPropEditor<string> = {
  canProcess(property) {
    return property.propertyType == PropertyType.color;
  },

  createEditorFor(wrapped) {
    let input = document.createElement('input');
    input.value = wrapped.getValue();

    input.addEventListener('input', () => {
      if (!isAttached(input)) {
        return;
      }

      let originalValue = wrapped.getValue();
      let newValue = input.value;
      wrapped.setValue(newValue);

      setPropertyUndoRedo.trigger(input, {
        id: wrapped.id,
        property: this,
        originalValue,
        newValue,
        canMerge: true,
      });
    });

    return input;
  },
};
