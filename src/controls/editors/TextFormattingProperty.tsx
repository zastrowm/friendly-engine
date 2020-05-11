import { ControlContainer } from '../../components/design/control-container.e';
import { Fragment, h } from '@friendly/elements/jsxElements';
import { ControlProperty } from '../Control';
import { Enums } from '../../framework/Enums';

export enum Formatting {
  None = 0,
  Bold = 1 << 1,
  Italics = 1 << 2,
  Underline = 1 << 3,
}

export class TextFormattingProperty extends ControlProperty<Formatting> {
  public id = 'text.formatting';
  public displayName = 'Formatting';

  /* override */
  public getEditor(instance: ControlContainer) {
    return this.createJsxEditor(instance, (refresh) => {
      let originalValue = this.getValue(instance.control);

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
          <Button format={Formatting.Bold}>B</Button>
          <Button format={Formatting.Italics}>I</Button>
          <Button format={Formatting.Underline}>U</Button>
        </span>
      );
    });
  }

  /* override */
  protected getValueRaw(e: HTMLElement) {
    return (
      (e.style.fontWeight == 'bold' ? Formatting.Bold : Formatting.None) |
      (e.style.textDecoration == 'underline' ? Formatting.Underline : Formatting.None) |
      (e.style.fontStyle == 'italic' ? Formatting.Italics : Formatting.None)
    );
  }

  /* override */
  protected setValueRaw(e: HTMLElement, value: Formatting) {
    e.style.fontWeight = (value & Formatting.Bold) > 0 ? 'bold' : null;
    e.style.textDecoration = (value & Formatting.Underline) > 0 ? 'underline' : null;
    e.style.fontStyle = (value & Formatting.Italics) > 0 ? 'italic' : null;
  }

  /* override */
  protected hasDefaultValueRaw(e: HTMLElement): boolean {
    return this.getValueRaw(e) == Formatting.None;
  }
}
