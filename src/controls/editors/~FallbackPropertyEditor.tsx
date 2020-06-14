import { editorPriorities, IPropertyEditor, isAttached } from './propertyEditor';
import { setPropertyUndoRedo } from './_shared';

export const FallbackPropertyEditor: IPropertyEditor<string> = {
  priority: editorPriorities.fallback - 100,

  canProcess(property) {
    return true;
  },

  createEditorFor(wrapped) {
    let input = document.createElement('input');
    input.value = JSON.stringify(wrapped.getValue());

    input.addEventListener('input', () => {
      if (!isAttached(input)) {
        return;
      }

      let originalValue = wrapped.getValue();
      let maybe = this.tryParse(input.value);

      if (!maybe.success) {
        return;
      }

      let newValue = maybe.value;
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

  // try-parse is "extra" - ignore the error
  // @ts-ignore
  tryParse(value: string): { success: boolean; value: any } {
    try {
      return {
        value: JSON.parse(value),
        success: true,
      };
    } catch {
      return {
        success: false,
        value: null,
      };
    }
  },
};
