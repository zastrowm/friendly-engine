import { createJsxEditor, editorPriorities, IPropertyEditor } from './propertyEditor';
import { Enums } from '../../framework/Enums';
import { h } from '@friendly/elements/jsxElements';
import { IEnumProperty, PropertyType } from '../controlProperties';

export const RestrictedSubsetEnumPropertyEditor: IPropertyEditor<string> = {
  priority: editorPriorities.fallback + 1,

  canProcess(property) {
    return (
      Enums.hasFlag(property.propertyType, PropertyType.enum) &&
      (property as IEnumProperty<any>).enumOptions?.preexistingOnly === true
    );
  },

  createEditorFor(wrapped) {
    return createJsxEditor(wrapped, (refresh) => {
      let property = (wrapped.property as any) as IEnumProperty<any>;
      let values = property.enumOptions.values;

      let currentIndex = 0;
      let lastValue = wrapped.getValue();

      let index = 0;
      for (let enumValue of values) {
        if (lastValue == enumValue.value) {
          currentIndex = index;
          break;
        }

        index++;
      }

      let onChange = (e) => {
        let newIndex = e.target.value;
        refresh({
          new: values[newIndex].value,
          old: lastValue,
        });
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
    });
  },
};
