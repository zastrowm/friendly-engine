import { CustomHtmlElement, h, customElement } from '../../../lib/friendlee/CustomHtmlElement';
import { ControlContainer } from './control-container';
import { IPropertyDescriptor } from '../../framework/controlsRegistry';

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
    this.rerender();
  }

  private _container: ControlContainer;

  /** Override */
  public onFirstConnected() {
    this.rerender();
  }

  private rerender(): void {
    if (!this.isConnected) {
      return;
    }

    console.log('re-rendered', this._container);

    if (this._container == null) {
      this.renderJsx(<span>No Active Element</span>);
      return;
    }

    let descriptor = this._container.descriptor;

    this.forceRenderJsx(<span></span>);
    this.forceRenderJsx(
      <table>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
        {descriptor.getProperties().map(p => (
          <property-panel-single-element propertyDescriptor={p} container={this._container} />
        ))}
      </table>,
    );
  }
}

@customElement(SinglePropertyElement.tagName)
export class SinglePropertyElement extends CustomHtmlElement {
  public static readonly tagName = 'property-panel-single-element';

  public dataNow;

  constructor() {
    super();

    this.propertyDescriptor = null;
    this.container = null;
  }

  public propertyDescriptor: IPropertyDescriptor;
  public container: ControlContainer;

  /* override */
  public onConnected() {
    if (!this.isConnected) {
      return;
    }

    let tr = document.createElement('tr');

    let td1 = document.createElement('td');
    td1.textContent = this.propertyDescriptor.name;
    tr.appendChild(td1);

    let td2 = document.createElement('td');
    let editor = this.propertyDescriptor.getEditor(this.container);
    td2.appendChild(editor.elementToMount);
    tr.appendChild(td2);

    this.appendChild(tr);
  }
}
