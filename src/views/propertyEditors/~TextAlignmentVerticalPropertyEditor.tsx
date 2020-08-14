import { IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import { VerticalAlignmentProperty } from '../../controls/@properties';
import React from 'react';
import { Icon } from '../Icon';
import { ExclusivePushButtonSelector, PushButton } from '../nodes/ExclusivePushButtonSelector';

export const TextAlignmentVerticalPropertyEditor: IPropertyEditor<string> = {
  canProcess(property) {
    return property.id === VerticalAlignmentProperty.id;
  },

  factory: function TextPropertyEditor(props: IReactPropertyEditorArgs<string>) {
    return (
      <>
        <ExclusivePushButtonSelector
          current={props.property.value}
          onChanged={(newValue) => {
            props.property.value = newValue;
          }}
        >
          <PushButton data="flex-start">
            <Icon type="align-left" style={{ transform: 'rotate(90deg)' }} />
          </PushButton>
          <PushButton data="center">
            <Icon type="align-center" style={{ transform: 'rotate(90deg)' }} />
          </PushButton>
          <PushButton data="flex-end">
            <Icon type="align-right" style={{ transform: 'rotate(90deg)' }} />
          </PushButton>
        </ExclusivePushButtonSelector>
      </>
    );
  },
};
