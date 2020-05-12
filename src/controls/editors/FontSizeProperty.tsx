import { ControlProperty, IPropertyEditor } from '../controlProperties';
import { ControlContainer } from '../../components/design/control-container.e';
import { Fragment, h } from '@friendly/elements/jsxElements';
import { Icon } from '../icon';

export class FontSizeProperty extends ControlProperty<number> {
  public id = 'text.size';
  public displayName = 'Font Size';

  /* override */
  protected getValueRaw(e: HTMLElement) {
    let fontSize = getComputedStyle(e).fontSize;
    return Number(fontSize.substr(0, fontSize.length - 2));
  }

  /* override */
  protected setValueRaw(e: HTMLElement, value: number) {
    e.style.fontSize = value + 'px';
  }

  /* override */
  protected hasDefaultValueRaw(e: HTMLElement): boolean {
    return e.style.fontSize == null;
  }

  public getEditor(instance: ControlContainer): IPropertyEditor {
    return this.createJsxEditor(instance, (refresh) => {
      let value = this.getValue(instance.control);

      let changeValue = (value) => {
        refresh({ old: value, new: value });
      };

      return (
        <Fragment>
          <button onClick={() => changeValue(value - 1)}>
            <Icon type="minus" />
          </button>
          {this.getValue(instance.control)}
          <button onClick={() => changeValue(value + 1)}>
            <Icon type="plus" />
          </button>
        </Fragment>
      );
    });
  }
}
