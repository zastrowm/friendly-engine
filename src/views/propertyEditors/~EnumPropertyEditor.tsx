import React from 'react';

import { editorPriorities, IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import { Enums } from '../../util/enums';
import { IEnumProperty, PropertyType } from '../../controls/@properties';

export const RestrictedSubsetEnumPropertyEditor: IPropertyEditor<string> = {
  priority: editorPriorities.fallback + 1,

  canProcess(property) {
    return (
      Enums.hasFlag(property.propertyType, PropertyType.enum) &&
      (property as IEnumProperty<any>).enumOptions?.preexistingOnly === true
    );
  },

  factory: function TextPropertyEditor(props: IReactPropertyEditorArgs<string>) {
    let property = (props.property.property as any) as IEnumProperty<string>;
    let values = property.enumOptions.values;

    let currentIndex = 0;
    let lastValue = props.property.value;

    let index = 0;

    for (let enumValue of values) {
      if (lastValue === enumValue.value) {
        currentIndex = index;
        break;
      }

      index++;
    }

    let onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      props.property.value = values[Number(e.target.value)].value;
    };

    return (
      <select onChange={onChange} value={currentIndex}>
        {values.map((e, i) => (
          <option value={i} key={i}>
            {e.display}
          </option>
        ))}
      </select>
    );
  },
};
