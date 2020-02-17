import { DesignApp } from "./components/design-app";
import { DesignEditor } from "./components/design-editor";
import { DragHandle } from "./components/drag-handle";
import { ControlContainer } from "./components/control-container";
import { ControlEditor } from "./components/control-editor";

declare global {
  interface HTMLElementTagNameMap {
    "control-container": ControlContainer;
    "control-editor": ControlEditor;
    "design-app": DesignApp;
    "design-editor": DesignEditor;
    "drag-handle": DragHandle;
  }
}
