import { DesignApp } from "./components/design-app";
import { DesignEditor } from "./components/design-editor";
import { DragHandle } from "./components/drag-handle";
import { ControlContainer } from "./components/control-container";
import { ControlEditor } from "./components/control-editor";

import * as PJSX from "preact/src/jsx";
import * as preact from "preact";

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
    // TODO should we use preact.ClassAttributes or PJSX.JSXInternal.HTMLAttributes

    // Use Partial because otherwise JSX complains that we're not providing all the properties
    // use ClassAttributes because that gives use jsx goodies like "key", "jsx", & "ref"
    type JSXType<T> = Partial<preact.ClassAttributes<T> | T>;

    interface IntrinsicElements extends PJSX.JSXInternal.IntrinsicElements {
      "control-container": JSXType<ControlContainer>;
      "control-editor": JSXType<ControlEditor>;
      "design-app": JSXType<DesignApp>;
      "design-editor": JSXType<DesignEditor>;
      "drag-handle": JSXType<DragHandle>;
    }
  }
}
