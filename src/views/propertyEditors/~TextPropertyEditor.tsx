import { editorPriorities, IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import { Enums } from '../../util/enums';
import { PropertyType } from '../../control-core/controlProperties';
import React from 'react';

export const TextPropertyEditor: IPropertyEditor<string> = {
  priority: editorPriorities.fallback,

  canProcess(property) {
    return Enums.hasFlag(property.propertyType, PropertyType.string);
  },

  factory: function TextPropertyEditor(props: IReactPropertyEditorArgs<string>) {
    return (
      <input
        placeholder="Text"
        value={props.property.value}
        onChange={(evt) => props.property.updateValue(evt.target.value, { canMerge: true })}
      />
    );
  },
};
