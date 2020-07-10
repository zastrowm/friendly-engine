import { PropertyType } from '@/control';
import { h, renderToFragment } from '@friendly/elements/jsxElements';
import { CodeDialog } from '../../components/code/code-dialog.e';
import { IPropertyEditor, isAttached, setPropertyUndoRedo } from '@/control/propertyEditor';

let codeDialog = CodeDialog.createInstance();
document.body.append(codeDialog);

export const BackgroundColorPropertyEditor: IPropertyEditor<string> = {
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
        property: wrapped.property,
        originalValue,
        newValue,
        canMerge: true,
      });
    });

    return input;
  },
};
