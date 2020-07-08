import { PropertyType } from '../controlProperties';
import { setPropertyUndoRedo } from './_shared';
import {
  FontSizeProperty,
  Formatting,
  HorizontalAlignmentProperty,
  TextFormattingProperty,
  VerticalAlignmentProperty,
} from '../properties/@commonProperties';
import { isAttached, createJsxEditor, IPropertyEditor, editorPriorities } from './propertyEditor';
import { Fragment, h, VNode } from '@friendly/elements/jsxElements';
import { Icon } from './icon';
import { Enums } from '../../framework/Enums';

export const TextEditor: IPropertyEditor<string> = {
  priority: editorPriorities.fallback,

  canProcess(property) {
    return Enums.hasFlag(property.propertyType, PropertyType.string);
  },

  createEditorFor(wrapped) {
    let input = document.createElement('input');
    input.value = wrapped.getValue();

    input.addEventListener('input', () => {
      if (!isAttached(input)) {
        return;
      }

      let originalValue = wrapped.getValue();
      let newValue = input.value;
      wrapped.setValue(newValue);

      setPropertyUndoRedo.trigger(input, {
        id: wrapped.id,
        property: wrapped.property,
        originalValue,
        newValue,
        canMerge: true,
      });
    });

    return input;
  },
};

export const FontSizeEditor: IPropertyEditor<number> = {
  canProcess(property) {
    return property.id == FontSizeProperty.id;
  },

  createEditorFor(wrapped) {
    return createJsxEditor(wrapped, (refresh) => {
      let value = wrapped.getValue();

      let changeValue = (value) => {
        refresh({ old: value, new: value });
      };

      return (
        <Fragment>
          <button onClick={() => changeValue(value - 1)}>
            <Icon type="minus" />
          </button>
          {wrapped.getValue()}
          <button onClick={() => changeValue(value + 1)}>
            <Icon type="plus" />
          </button>
        </Fragment>
      );
    });
  },
};

export const TextFormattingEditor: IPropertyEditor<Formatting> = {
  canProcess(property) {
    return property.id == TextFormattingProperty.id;
  },

  createEditorFor(wrapped) {
    return createJsxEditor(wrapped, (refresh) => {
      let originalValue = wrapped.getValue();

      let toggleFormatting = (format: Formatting) => {
        refresh({ old: originalValue, new: Enums.toggleFlag(originalValue, format) });
      };

      let Button = (props: { format: Formatting; children?: string }) => (
        <Fragment>
          <button onClick={() => toggleFormatting(props.format)} selected={Enums.hasFlag(originalValue, props.format)}>
            {props.children}
          </button>
        </Fragment>
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
    });
  },
};

export const TextAlignmentEditor: IPropertyEditor<string> = {
  canProcess(property) {
    return property.id == HorizontalAlignmentProperty.id;
  },

  createEditorFor(wrapped) {
    return createJsxEditor(wrapped, (refresh) => (
      <Fragment>
        <OptionsSelector
          current={wrapped.getValue()}
          onChanged={(newValue) => {
            let oldValue = wrapped.getValue();
            refresh({ old: oldValue, new: newValue });
          }}
        >
          <Option data="left">
            <Icon type="align-left" />
          </Option>
          <Option data="center">
            <Icon type="align-center" />
          </Option>
          <Option data="right">
            <Icon type="align-right" />
          </Option>
        </OptionsSelector>
      </Fragment>
    ));
  },
};

function Option<T>(_: { data: T }) {}

function OptionsSelector(props: {
  onChanged: (data: string, targetElement?: HTMLElement) => void;
  children?: (VNode & { props: { data: any } })[];
  current: string;
}) {
  return (
    <span>
      {props.children.map((it) => (
        <button
          onClick={() => props.onChanged(it.props.data)}
          data-data={it.props.data}
          selected={it.props.data == props.current ? true : undefined}
        >
          {it.props.children}
        </button>
      ))}
    </span>
  );
}

export const VerticalAlignmentPropertyEditor: IPropertyEditor<string> = {
  canProcess(property) {
    return property.id == VerticalAlignmentProperty.id;
  },

  createEditorFor(wrapped) {
    return createJsxEditor(wrapped, (refresh) => (
      <Fragment>
        <OptionsSelector
          current={wrapped.getValue()}
          onChanged={(newValue) => {
            let oldValue = wrapped.getValue();
            refresh({ old: oldValue, new: newValue });
          }}
        >
          <Option data="flex-start">
            <Icon type="align-left" style="transform: rotate(90deg);" />
          </Option>
          <Option data="center">
            <Icon type="align-center" style="transform: rotate(90deg);" />
          </Option>
          <Option data="flex-end">
            <Icon type="align-right" style="transform: rotate(90deg);" />
          </Option>
        </OptionsSelector>
      </Fragment>
    ));
  },
};