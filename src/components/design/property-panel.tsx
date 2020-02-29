import { CustomHtmlElement, h, customElement } from '../../../lib/friendlee/CustomHtmlElement';
import { ControlContainer } from './control-container';

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

    if (this._container == null) {
      this.renderJsx(<span>No Active Element</span>);
      return;
    }

    let descriptor = this._container.descriptor;
    let control = this._container.control;

    this.renderJsx(
      <table>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
        {descriptor.getProperties().map(p => (
          <tr>
            <td>{p.name}</td>
            <td>{descriptor.getValue(control, p)}</td>
          </tr>
        ))}
      </table>,
    );
  }
}
