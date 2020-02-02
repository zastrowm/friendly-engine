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
    let className = 'drag-handle-' + Anchor[this.anchorMode];
    return <Host class={className}></Host>;
  }
}
