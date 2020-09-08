import { editorPriorities, IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import React, { ChangeEvent } from "react";

// try-parse is "extra" - ignore the error
// @ts-ignore
function tryParse(value: string): { success: boolean; value: any } {
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
}

export const FallbackPropertyEditor: IPropertyEditor<string> = {
  priority: editorPriorities.fallback - 100,

  canProcess(property) {
    return true;
  },

  factory: function TextPropertyEditor(props: IReactPropertyEditorArgs<string>) {

    let json = JSON.stringify(props.property.value);

    let callback = (e: ChangeEvent<HTMLTextAreaElement>) => {
      console.log("Changing");
      let maybe = tryParse(e.target.value);

      if (!maybe.success || props.property.value === maybe.value) {
        return;
      }

      let newValue = maybe.value;

      props.property.updateValue(newValue, { canMerge: true });
    };

    return <textarea defaultValue={json} onBlur={callback} />
  },
};
