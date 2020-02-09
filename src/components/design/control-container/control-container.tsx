import { Component, h, Prop, Host } from '@stencil/core';
import { Element } from '@stencil/core';

import { determineEditStyle } from '../../../api/positioner';
import { IStoredPositionInfo } from '../../../api/layout';

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

    if (this.positionInfo == null) {
      debugger;
      return;
    }

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
