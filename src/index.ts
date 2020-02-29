import { DesignApp } from './components/design/design-app';
import { DesignSurfaceElement } from './components/design/design-surface';
import { DragHandle } from './components/design/drag-handle';
import { ControlContainer } from './components/design/control-container';
import { ControlEditor } from './components/design/control-editor';
import { PropertyPanelElement } from './components/design/property-panel';
import { getCustomElementNames } from '../lib/friendlee/CustomHtmlElement';

(async () => {
  console.log(DesignApp, DesignSurfaceElement, DragHandle, ControlContainer, ControlEditor);
  let customElementNames = Array.from(getCustomElementNames());

  await Promise.all(customElementNames.map(name => customElements.whenDefined(name)));
  await customElements.whenDefined(PropertyPanelElement.tagName);

  document.body.append(document.createElement('design-app'));
})();
