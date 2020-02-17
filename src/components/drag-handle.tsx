import { Anchor } from "../api/layout";

export class DragHandle extends HTMLElement {
  constructor() {
    super();
  }

  public anchorMode: Anchor;

  public connectedCallback() {
    this.classList.add("drag-handle-" + Anchor[this.anchorMode]);
  }
}

window.customElements.define("drag-handle", DragHandle);
