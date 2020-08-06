import React from 'react';
import { IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import { PropertyType } from '../../controls/@properties';

export const BooleanPropertyEditor: IPropertyEditor<boolean> = {
  canProcess(property) {
    return property.propertyType === PropertyType.boolean;
  },

  factory: function TextPropertyEditor(props: IReactPropertyEditorArgs<boolean>) {
    return (
      <label>
        <input
          type="checkbox"
          checked={props.property.value}
          onChange={() => (props.property.value = !props.property.value)}
        />
        {props.property.property.displayName}
      </label>
    );
  },
};
