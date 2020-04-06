import { h, customElement, CustomHtmlJsxElement } from '@friendly/elements/CustomHtmlJsxElement';
import { ControlContainer } from './control-container.e';
import {
  IPropertyDescriptor,
  controlValueChanged,
  IControlValueChangedArguments,
} from '../../framework/controlsRegistry';
import { ref } from '../componentUtils';
import { property } from '@friendly/elements/CustomHtmlElement';
import { undoRedoValueChangeId } from 'src/controls/editors/_shared';

/**
 * Allows editing of the properties for a specific container.
 */
@customElement(PropertyPanelElement.tagName)
export class PropertyPanelElement extends CustomHtmlJsxElement {
  public static readonly tagName = 'property-panel';

  private _currentListener: () => void;

  constructor() {
    super();
  }

  @property({ invalidateOnSet: true })
  public container: ControlContainer;

  /**
   * Called to notify the panel that a property changed externally.
   */
  public markPropertyExternallyChanged() {
    this.invalidate();
  }

  /** Override */
  public onRender(): void {
    this._currentListener?.();
    this._currentListener = null;

    if (this.container == null) {
      return <span>No Active Element</span>;
    }

    let descriptor = this.container.descriptor;
    this._currentListener = controlValueChanged.addListener(this.container, (args) =>
      this.onControlPropertyChanged(args),
    );

    return (
      <div>
        {descriptor.getProperties().map((p) => (
          <PropertyEntry container={this.container} property={p} />
        ))}
      </div>
    );
  }

  /** Invoked when one of the controls' properties changes */
  public onControlPropertyChanged(args: IControlValueChangedArguments): void {
    if (args.source == undoRedoValueChangeId) {
      this.invalidate();
    }
  }
}

function PropertyEntry(props: { property: IPropertyDescriptor; container: ControlContainer }) {
  let editor = props.property.getEditor(props.container);

  return (
    <div>
      <div>{props.property.displayName}</div>
      <div ref={ref.appendElement(editor.elementToMount)}></div>
    </div>
  );
}
