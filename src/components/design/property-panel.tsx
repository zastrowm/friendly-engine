import { CustomHtmlElement, h, customElement } from '../../../lib/friendlee/CustomHtmlElement';
import { ControlContainer } from './control-container';
import { IPropertyDescriptor } from '../../framework/controlsRegistry';
import { ref } from '../componentUtils';

/**
 * Allows editing of the properties for a specific container.
 */
@customElement(PropertyPanelElement.tagName)
export class PropertyPanelElement extends CustomHtmlElement {
  public static readonly tagName = 'property-panel';

  constructor() {
    super();
  }

  public get container() {
    return this._container;
  }

  public set container(value: ControlContainer) {
    this._container = value;
    this.onRender();
  }

  private _container: ControlContainer;

  /** Override */
  public onRender(): void {
    if (!this.isConnected) {
      return;
    }

    if (this._container == null) {
      this.renderJsx(<span>No Active Element</span>);
      return;
    }

    let descriptor = this._container.descriptor;

    this.renderJsx(
      <div>
        {descriptor.getProperties().map(p => (
          <PropertyEntry container={this._container} property={p} />
        ))}
      </div>,
    );
  }
}

function PropertyEntry(props: { property: IPropertyDescriptor; container: ControlContainer }) {
  let editor = props.property.getEditor(props.container);

  return (
    <div>
      <div>{props.property.name}</div>
      <div ref={ref.appendElement(editor.elementToMount)}></div>
    </div>
  );
}
