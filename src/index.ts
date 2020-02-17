import { DesignApp } from "./components/design-app";
import { DesignEditor } from "./components/design-editor";
import { DragHandle } from "./components/drag-handle";
import { ControlContainer } from "./components/control-container";
import { ControlEditor } from "./components/control-editor";

(async () => {
  console.log(
    DesignApp,
    DesignEditor,
    DragHandle,
    ControlContainer,
    ControlEditor
  );

  await customElements.whenDefined("design-editor");
  console.warn("Starting App");
  document.body.append(document.createElement("design-app"));
})();
