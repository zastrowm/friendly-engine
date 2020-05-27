import { PropertyType } from '../controlProperties';
import { h, renderToFragment } from '@friendly/elements/jsxElements';
import { CodeDialog } from '../../components/code/code-dialog.e';
import { IPropEditor } from './propertyEditor';

let codeDialog = CodeDialog.createInstance();
document.body.append(codeDialog);

export const ScriptPropertyEditor: IPropEditor<string> = {
  canProcess(property) {
    return property.propertyType == PropertyType.script;
  },

  createEditorFor(wrapped) {
    let onEditScript = async () => {
      let response = await codeDialog.showDialog(`${wrapped.id}.click`, wrapped.getValue());
      if (response.didSave) {
        wrapped.setValue(response.code);
        console.log('Saving script');
      } else {
        console.log('Discarding script');
      }
    };

    let onTestScript = () => {
      eval(wrapped.getValue());
    };

    let fragment = renderToFragment([
      <a href="#" onClick={onEditScript}>
        Edit Script
      </a>,
      <br />,
      <a href="#" onClick={onTestScript}>
        Test Script
      </a>,
    ]);

    return fragment as any;
  },
};
