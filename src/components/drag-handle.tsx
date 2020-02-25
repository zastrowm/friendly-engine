import { Anchor } from '../framework/layout';

export class DragHandle extends HTMLElement {
  constructor() {
    super();

    this.anchorMode = Anchor.none;
  }

  public anchorMode: Anchor;

  public connectedCallback() {
    this.classList.add('drag-handle-' + Anchor[this.anchorMode]);
  }
}

window.customElements.define('drag-handle', DragHandle);
