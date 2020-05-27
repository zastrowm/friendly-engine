import { h, customElement, CustomHtmlJsxElement } from '@friendly/elements/CustomHtmlJsxElement';
import { ControlContainer } from './control-container.e';
import { ref } from '../componentUtils';
import { property } from '@friendly/elements/CustomHtmlElement';
import {
  controlValueChanged as propertyChangedFromUndoRedo,
  IControlValueChangedArguments,
} from 'src/controls/editors/_shared';

import './property-panel.css';
import { PropertyEditorRegistry } from '../../controls/editors/propertyEditor';
import { IControlProperty, IProperty } from '../../controls/controlProperties';

/**
 * Allows editing of the properties for a specific container.
 */
@customElement(PropertyPanelElement.tagName)
export class PropertyPanelElement extends CustomHtmlJsxElement {
  public static readonly tagName = 'property-panel';

  private _undoRedoListener: () => void;

  constructor() {
    super();

    this.editorRegistry = null;
  }

  @property({ invalidateOnSet: true })
  public container: ControlContainer;

  /** The editors to use when editing properties */
  public editorRegistry: PropertyEditorRegistry;

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
          <PropertyEntry container={this.container} property={p} editorRegistry={this.editorRegistry} />
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

function PropertyEntry(props: {
  property: IControlProperty;
  container: ControlContainer;
  editorRegistry: PropertyEditorRegistry;
}) {
  let { property, container, editorRegistry } = props;
  let control = container.control;

  let betterEditor = editorRegistry.findEditorFor(property);
  let htmlElementToMount = betterEditor.createEditorFor({
    getValue(): any {
      return property.getValue(control);
    },
    setValue(value: any) {
      property.setValue(control, value);
    },
    get id() {
      return control.id;
    },
    get property() {
      return property;
    },
  });

  return (
    <div>
      <div>{props.property.displayName}</div>
      <div ref={ref.appendElement(htmlElementToMount)} />
    </div>
  );
}
