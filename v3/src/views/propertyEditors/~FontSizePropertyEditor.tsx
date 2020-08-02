import { IPropertyEditor } from './propertyEditor';
import { FontSizeProperty } from '../../control-core/~FontSizeProperty';
import { Icon } from '../Icon';
import React from 'react';

export const FontSizePropertyEditor: IPropertyEditor<number> = {
  canProcess(property) {
    return property.id === FontSizeProperty.id;
  },

  factory: function FontSizePropertyEditor(props) {
    let value = props.property.value;

    let changeValue = (value: number) => {
      props.property.updateValue(value);
    };

    return (
      <>
        <button onClick={() => changeValue(value - 1)}>
          <Icon type="minus" />
        </button>
        {value}
        <button onClick={() => changeValue(value + 1)}>
          <Icon type="plus" />
        </button>
      </>
    );
  },
};
