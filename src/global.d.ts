import { DesignApp } from "./components/design-app";
import { DesignEditor } from "./components/design-editor";
import { DragHandle } from "./components/drag-handle";
import { ControlContainer } from "./components/control-container";
import { ControlEditor } from "./components/control-editor";

import * as PJSX from "preact/src/jsx";

declare global {
  interface HTMLElementTagNameMap {
    "control-container": ControlContainer;
    "control-editor": ControlEditor;
    "design-app": DesignApp;
    "design-editor": DesignEditor;
    "drag-handle": DragHandle;
  }
}

/**
 * This is the only way I've been able to get typescript compiler happy (and provide
 *  intellisense) when using preact to render the custom elements.
 *
 * It seems like a hack and should be revisited at some point
 **/
declare module "preact" {
  namespace JSXInternal {
    interface IntrinsicElements extends PJSX.JSXInternal.IntrinsicElements {
      "control-container": ControlContainer;
      "control-editor": ControlEditor;
      "design-app": DesignApp;
      "design-editor": DesignEditor;
      "drag-handle": Partial<DragHandle>;
    }
  }
}
