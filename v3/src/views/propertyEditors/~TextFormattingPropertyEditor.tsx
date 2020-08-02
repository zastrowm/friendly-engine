import { IPropertyEditor } from './propertyEditor';
import { Formatting, TextFormattingProperty } from '../../control-core/~TextFormattingProperty';
import { Enums } from '../../util/enums';
import React from 'react';
import { Icon } from '../Icon';

export const TextFormattingPropertyEditor: IPropertyEditor<Formatting> = {
  canProcess(property) {
    return property.id === TextFormattingProperty.id;
  },

  factory: function FontSizePropertyEditor(props) {
    let originalValue = props.property.value;

    let toggleFormatting = (format: Formatting) => {
      props.property.value = Enums.toggleFlag(originalValue, format);
    };

    let Button = (props: { format: Formatting; children?: React.ReactElement }) => (
      <>
        <button
          onClick={() => toggleFormatting(props.format)}
          data-selected={Enums.hasFlag(originalValue, props.format)}
        >
          {props.children}
        </button>
      </>
    );

    return (
      <span>
        <Button format={Formatting.Bold}>
          <Icon type="bold" />
        </Button>
        <Button format={Formatting.Italics}>
          <Icon type="italic" />
        </Button>
        <Button format={Formatting.Underline}>
          <Icon type="underline" />
        </Button>
      </span>
    );
  },
};
