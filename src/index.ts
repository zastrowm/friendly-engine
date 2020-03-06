import { DesignApp } from './components/design/design-app';
import { DesignSurfaceElement } from './components/design/design-surface';
import { DragHandle } from './components/design/drag-handle';
import { ControlContainer } from './components/design/control-container';
import { ControlEditor } from './components/design/control-editor';
import { PropertyPanelElement } from './components/design/property-panel';
import { getCustomElementNames } from '../lib/friendlee/CustomHtmlElement';

(async () => {
  let elements = [DesignApp, DesignSurfaceElement, DragHandle, ControlContainer, ControlEditor];
  console.log('Registered Custom Elements Count', elements.length);
  let customElementNames = Array.from(getCustomElementNames());

  await Promise.all(customElementNames.map(name => customElements.whenDefined(name)));
  await customElements.whenDefined(PropertyPanelElement.tagName);

  document.body.append(document.createElement('design-app'));
})();
