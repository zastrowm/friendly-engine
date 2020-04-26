import { ControlContainer } from '../../components/design/control-container.e';
import { renderToFragment, Fragment, h, VNode } from '@friendly/elements/jsxElements';
import { setPropertyUndoRedo } from './_shared';
import { ControlProperty } from '../Control';

export class TextAlignmentProperty extends ControlProperty<string> {
  id: 'text.alignment';
  displayName: 'Alignment';

  protected getValueRaw(e: HTMLElement) {
    return getComputedStyle(e).textAlign;
  }
  protected setValueRaw(e: HTMLElement, value: string) {
    e.style.textAlign = value;
  }

  public getEditor(instance: ControlContainer) {
    let onValueChanged = (data: string, element: HTMLElement) => {
      let originalValue = this.getValue(instance.control);
      this.setValue(instance.control, data);

      setPropertyUndoRedo.trigger(element, {
        id: instance.uniqueId,
        property: this,
        originalValue,
        newValue: data,
      });
    };

    let currentValue = this.getValue(instance.control);

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
      {props.children.map((it) => (
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
