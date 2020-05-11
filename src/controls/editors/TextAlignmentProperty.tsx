import { ControlContainer } from '../../components/design/control-container.e';
import { Fragment, h, VNode } from '@friendly/elements/jsxElements';
import { ControlProperty } from '../Control';
import { Icon } from '../icon';

export class TextAlignmentProperty extends ControlProperty<string> {
  public id = 'text.alignment';
  public displayName = 'Alignment';

  /* override */
  protected getValueRaw(e: HTMLElement) {
    return getComputedStyle(e).textAlign;
  }

  /* override */
  protected setValueRaw(e: HTMLElement, value: string) {
    e.style.textAlign = value;
  }

  /* override */
  protected hasDefaultValueRaw(e: HTMLElement): boolean {
    return e.style.textAlign == null;
  }

  public getEditor(instance: ControlContainer) {
    return this.createJsxEditor(instance, (refresh) => (
      <Fragment>
        <OptionsSelector
          current={this.getValue(instance.control)}
          onChanged={(newValue) => {
            let oldValue = this.getValue(instance.control);
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
  }
}

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
