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

    this.forceRenderJsx(
      <table>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
        {descriptor.getProperties().map(p => this.getControlJsx(p))}
      </table>,
    );
  }

  private getControlJsx(property: IPropertyDescriptor) {
    return (
      <tr>
        <td>{property.name}</td>
        <td
          ref={element => {
            if (element == null) {
              return;
            }

            let editor = property.getEditor(this._container);
            element.appendChild(editor.elementToMount);
          }}
        ></td>
      </tr>
    );
  }
}
