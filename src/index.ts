import { DesignApp } from './components/design/design-app';
import { DesignSurfaceElement } from './components/design/design-surface';
import { DragHandle } from './components/design/drag-handle';
import { ControlContainer } from './components/design/control-container';
import { ControlEditor } from './components/design/control-editor';
import { PropertyPanelElement } from './components/design/property-panel';

(async () => {
  console.log(DesignApp, DesignSurfaceElement, DragHandle, ControlContainer, ControlEditor);

  await customElements.whenDefined(DesignSurfaceElement.tagName);
  await customElements.whenDefined(PropertyPanelElement.tagName);
  console.warn('Starting App');
  document.body.append(document.createElement('design-app'));
})();
