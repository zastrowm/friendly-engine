import { Component, h, Prop, Host } from '@stencil/core';
import { Element } from '@stencil/core';
import { Anchor } from '../../../api/layout';

@Component({
  tag: 'drag-handle',
  styleUrl: 'drag-handle.css',
})
export class DragHandle {
  @Element() host: HTMLElement;

  @Prop()
  public anchorMode: Anchor;

  render() {
    let className = null;

    if (this.anchorMode == Anchor.topLeft) {
      className = 'drag-handle-nw';
    } else if (this.anchorMode == Anchor.topRight) {
      className = 'drag-handle-ne';
    } else if (this.anchorMode == Anchor.bottomRight) {
      className = 'drag-handle-se';
    } else if (this.anchorMode == Anchor.bottomLeft) {
      className = 'drag-handle-sw';
    }

    return <Host class={className}></Host>;
  }
}
