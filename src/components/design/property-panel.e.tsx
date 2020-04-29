import { h, customElement, CustomHtmlJsxElement } from '@friendly/elements/CustomHtmlJsxElement';
import { ControlContainer } from './control-container.e';
import { ref } from '../componentUtils';
import { property } from '@friendly/elements/CustomHtmlElement';
import {
  controlValueChanged as propertyChangedFromUndoRedo,
  IControlValueChangedArguments,
} from 'src/controls/editors/_shared';

import './property-panel.css';
import { ControlProperty } from 'src/controls/commonControls';

/**
 * Allows editing of the properties for a specific container.
 */
@customElement(PropertyPanelElement.tagName)
export class PropertyPanelElement extends CustomHtmlJsxElement {
  public static readonly tagName = 'property-panel';

  private _undoRedoListener: () => void;

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
  public onConnected() {
    this._undoRedoListener = propertyChangedFromUndoRedo.addListener(document.body, (args) => {
      this.onControlPropertyChanged(args);
    });
  }

  /** Override */
  public onDisconnected() {
    this._undoRedoListener?.();
    this._undoRedoListener = null;
  }

  /** Override */
  public onRender(): void {
    if (this.container == null) {
      return <span>No Active Element</span>;
    }

    let descriptor = this.container.control.descriptor;

    return (
      <div>
        <span class="name">{this.container.control.id}</span>
        {descriptor.getProperties().map((p) => (
          <PropertyEntry container={this.container} property={p} />
        ))}
      </div>
    );
  }

  /** Invoked when one of the controls' properties changes */
  public onControlPropertyChanged(args: IControlValueChangedArguments): void {
    if (args.instance == this.container) {
      this.invalidate();
    }
  }
}

function PropertyEntry(props: { property: ControlProperty<any>; container: ControlContainer }) {
  let editor = props.property.getEditor(props.container);

  return (
    <div>
      <div>{props.property.displayName}</div>
      <div ref={ref.appendElement(editor.elementToMount)}></div>
    </div>
  );
}
