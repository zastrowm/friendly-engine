import { Component, h, Prop, Host, Method } from '@stencil/core';
import { Element } from '@stencil/core';

import { determineEditStyle } from '../../../api/positioner';
import { AnchoredBoundary, IStoredPositionInfo } from '../../../api/layout';

@Component({
  tag: 'control-container',
  styleUrl: 'control-container.css',
})
export class DesignEditor {
  @Element()
  host: HTMLElement;

  @Prop()
  positionInfo: IStoredPositionInfo;

  render() {
    console.log('re-render');

    let anchorAndBoundary = determineEditStyle(this.positionInfo, this.host.parentElement);
    let styleInfo = anchorAndBoundary.boundaries.toStyle() as any;

    return (
      <Host class="control-container" style={styleInfo}>
        <slot />
        <control-editor />
      </Host>
    );
  }
}
