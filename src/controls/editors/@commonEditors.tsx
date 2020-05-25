import { setPropertyUndoRedo } from './_shared';
import {
  FontSizeProperty,
  Formatting,
  TextAlignmentProperty,
  TextFormattingProperty,
} from '../properties/@commonProperties';
import { Icon } from '../icon';
import { createJsxEditor, IPropEditor, PropertyEditorRegistry } from './propertyEditor';
import { Fragment, h, VNode } from '@friendly/elements/jsxElements';
import { PropertyType } from '../controlProperties';
import { Enums } from '../../framework/Enums';

const commonEditors = [];

function createEditor<T>(editor: IPropEditor<T>): IPropEditor<T> {
  commonEditors.push(editor);
  return editor;
}

export const TextEditor = createEditor<string>({
  canProcess(property) {
    return property.propertyType == PropertyType.string;
  },

  createEditorFor(wrapped) {
    let input = document.createElement('input');
    input.value = wrapped.getValue();

    input.addEventListener('input', () => {
      // it's possible through rapid undo/redo that we'll get input events to this item while it's unattached,
      // - if that occurs bail out so that we don't generate a useless undo event
      if (!document.contains(input)) {
        return;
      }

      let originalValue = wrapped.getValue();
      let newValue = input.value;
      wrapped.setValue(newValue);

      setPropertyUndoRedo.trigger(input, {
        id: wrapped.id,
        property: this,
        originalValue,
        newValue,
        canMerge: true,
      });
    });

    return input;
  },
});

export const FontSizeEditor = createEditor<number>({
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
});

export const TextFormattingEditor = createEditor<Formatting>({
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
});

export const TextAlignmentEditor = createEditor<string>({
  canProcess(property) {
    return property.id == TextAlignmentProperty.id;
  },

  createEditorFor(wrapped) {
    return this.createJsxEditor(wrapped, (refresh) => (
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
});

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

export function addCommonPropertyEditors(registry: PropertyEditorRegistry) {
  for (let editor of commonEditors) {
    registry.add(editor);
  }
}
