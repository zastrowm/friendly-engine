import { GettableSettableProperty, PropertyType } from '../../framework/controlsRegistry';
import { ControlContainer } from '../../components/design/control-container';
import { renderToFragment, Fragment, h } from '../../../lib/friendlee/jsxElements';

export class TextAlignmentProperty extends GettableSettableProperty<string> {
  constructor() {
    super('text.alignment', PropertyType.string);
  }

  public setValue(instance: ControlContainer, value: string) {
    instance.control.style.textAlign = value;
  }
  public getValue(instance: ControlContainer): string {
    return getComputedStyle(instance.control).textAlign;
  }

  public getEditor(instance: ControlContainer) {
    let handleClick = (evt: MouseEvent) => {
      this.setValue(instance, (evt.target as HTMLElement).dataset.alignment);
      input.value = this.getValue(instance);
    };

    let input = document.createElement('input');
    input.value = this.getValue(instance);

    let fragment = renderToFragment(
      <Fragment>
        <button data-alignment="left" onClick={handleClick}>
          L
        </button>
        <button data-alignment="center" onClick={handleClick}>
          C
        </button>
        <button data-alignment="right" onClick={handleClick}>
          R
        </button>
      </Fragment>,
    );

    input.addEventListener('input', () => {
      this.setValue(instance, input.value);
    });

    fragment.appendChild(input);

    let it = fragment as any;
    return { elementToMount: it };
  }
}
