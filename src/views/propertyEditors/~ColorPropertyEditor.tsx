import { IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import { PropertyType } from '../../control-core/controlProperties';
import React from 'react';

export const ColorPropertyEditor: IPropertyEditor<string> = {
  canProcess(property) {
    return property.propertyType === PropertyType.color;
  },

  factory: function TextPropertyEditor(props: IReactPropertyEditorArgs<string>) {
    return (
      <input
        placeholder={props.property.property.displayName}
        value={props.property.value}
        onChange={(evt) => props.property.updateValue(evt.target.value, { canMerge: true })}
      />
    );
  },
};
