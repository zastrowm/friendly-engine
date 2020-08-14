import { IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import { HorizontalAlignmentProperty } from '../../controls/@properties';
import React from 'react';
import { Icon } from '../Icon';
import { ExclusivePushButtonSelector, PushButton } from '../nodes/ExclusivePushButtonSelector';

export const TextAlignmentHorizontalPropertyEditor: IPropertyEditor<string> = {
  canProcess(property) {
    return property.id === HorizontalAlignmentProperty.id;
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
          <PushButton data="left">
            <Icon type="align-left" />
          </PushButton>
          <PushButton data="center">
            <Icon type="align-center" />
          </PushButton>
          <PushButton data="right">
            <Icon type="align-right" />
          </PushButton>
        </ExclusivePushButtonSelector>
      </>
    );
  },
};
