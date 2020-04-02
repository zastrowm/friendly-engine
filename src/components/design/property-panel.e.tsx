import { h, customElement, CustomHtmlJsxElement } from '@friendly/elements/CustomHtmlJsxElement';
import { ControlContainer } from './control-container.e';
import { IPropertyDescriptor } from '../../framework/controlsRegistry';
import { ref } from '../componentUtils';
import { property } from '@friendly/elements/CustomHtmlElement';

/**
 * Allows editing of the properties for a specific container.
 */
@customElement(PropertyPanelElement.tagName)
export class PropertyPanelElement extends CustomHtmlJsxElement {
  public static readonly tagName = 'property-panel';

  constructor() {
    super();
  }

  @property({ invalidateOnSet: true })
  public container: ControlContainer;

  /** Override */
  public onRender(): void {
    if (this.container == null) {
      return <span>No Active Element</span>;
    }

    let descriptor = this.container.descriptor;

    return (
      <div>
        {descriptor.getProperties().map(p => (
          <PropertyEntry container={this.container} property={p} />
        ))}
      </div>
    );
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
