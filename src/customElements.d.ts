import { DesignApp } from './components/design/design-app.e';
import { DesignSurfaceElement } from './components/design/design-surface.e';
import { DragHandle } from './components/design/drag-handle.e';
import { ControlContainer } from './components/design/control-container.e';
import { ControlEditor } from './components/design/control-editor.e';

import * as PJSX from 'preact/src/jsx';
import * as preact from 'preact';
import { PropertyPanelElement } from './components/design/property-panel.e';

declare global {
  interface HTMLElementTagNameMap {
    [ControlContainer.tagName]: ControlContainer;
    [ControlEditor.tagName]: ControlEditor;
    [DesignApp.tagName]: DesignApp;
    [DesignSurfaceElement.tagName]: DesignSurfaceElement;
    [PropertyPanelElement.tagName]: PropertyPanelElement;
    [DragHandle.tagName]: DragHandle;
  }
}

/**
 * This is the only way I've been able to get typescript compiler happy (and provide
 *  intellisense) when using preact to render the custom elements.
 *
 * It seems like a hack and should be revisited at some point
 **/
declare module 'preact' {
  namespace JSXInternal {
    // TODO should we use preact.ClassAttributes or PJSX.JSXInternal.HTMLAttributes

    // Use Partial because otherwise JSX complains that we're not providing all the properties
    // use ClassAttributes because that gives use jsx goodies like "key", "jsx", & "ref"
    type JSXType<T> = Partial<preact.ClassAttributes<T> | T>;

    interface IntrinsicElements extends PJSX.JSXInternal.IntrinsicElements {
      [ControlContainer.tagName]: JSXType<ControlContainer>;
      [ControlEditor.tagName]: JSXType<ControlEditor>;
      [DesignApp.tagName]: JSXType<DesignApp>;
      [DesignSurfaceElement.tagName]: JSXType<DesignSurfaceElement>;
      [PropertyPanelElement.tagName]: JSXType<PropertyPanelElement>;
      [DragHandle.tagName]: JSXType<DragHandle>;
    }
  }
}

declare interface NodeModule {
  hot: any;
}
