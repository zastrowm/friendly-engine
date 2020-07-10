import { PropertyType } from '@/control';
import { h } from '@friendly/elements/jsxElements';
import { createJsxEditor, IPropertyEditor } from '@/control/propertyEditor';

export const BooleanPropertyEditor: IPropertyEditor<boolean> = {
  canProcess(property) {
    return property.propertyType == PropertyType.boolean;
  },

  createEditorFor(wrapped) {
    return createJsxEditor(wrapped, (refresh) => (
      <input
        type="checkbox"
        checked={wrapped.getValue()}
        onChange={() => {
          let old = wrapped.getValue();
          refresh({ old: old, new: !old });
        }}
      />
    ));
  },
};
