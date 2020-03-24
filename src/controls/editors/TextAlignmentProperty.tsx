import { GettableSettableProperty, PropertyType } from '../../framework/controlsRegistry';
import { ControlContainer } from '../../components/design/control-container.e';
import { renderToFragment, Fragment, h, VNode } from '../../../lib/friendlee/jsxElements';
import { setPropertyUndoRedo } from './_shared';

export class TextAlignmentProperty extends GettableSettableProperty<string> {
  constructor() {
    super('text.alignment', 'Alignment', PropertyType.string);
  }

  public setValue(instance: ControlContainer, value: string) {
    instance.control.style.textAlign = value;
  }
  public getValue(instance: ControlContainer): string {
    return getComputedStyle(instance.control).textAlign;
  }

  public getEditor(instance: ControlContainer) {
    let onValueChanged = (data: string, element: HTMLElement) => {
      let originalValue = this.getValue(instance);
      this.setValue(instance, data);

      setPropertyUndoRedo.trigger(element, {
        id: instance.uniqueId,
        property: this,
        originalValue,
        newValue: data,
      });
    };

    let currentValue = this.getValue(instance);

    let fragment = renderToFragment(
      <Fragment>
        <OptionsSelector onChanged={onValueChanged} current={currentValue}>
          <Option data="left">L</Option>
          <Option data="center">C</Option>
          <Option data="right">R</Option>
        </OptionsSelector>
      </Fragment>,
    );

    return { elementToMount: fragment as any };
  }
}

function Option<T>(props: { data: T }) {
  console.log(props);
}

function OptionsSelector(props: {
  onChanged: (data: string, targetElement?: HTMLElement) => void;
  children?: VNode[];
  current: string;
}) {
  let handleClick = (evt: MouseEvent) => {
    let button = evt.target as HTMLButtonElement;
    let previous = button.parentElement.querySelector('button[selected]');
    if (previous == button) {
      return;
    }

    if (previous != null) {
      previous.removeAttribute('selected');
    }
    button.setAttribute('selected', 'true');
    let data = button.dataset.data;
    props.onChanged(data, evt.target as HTMLElement);
  };

  return (
    <span>
      {props.children.map(it => (
        <button
          onClick={handleClick}
          data-data={(it.props as any).data}
          selected={(it.props as any).data == props.current ? true : undefined}
        >
          {it.props.children}
        </button>
      ))}
    </span>
  );
}
