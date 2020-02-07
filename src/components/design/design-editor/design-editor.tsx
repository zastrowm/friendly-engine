import { Component, h, Host } from '@stencil/core';
import { Element } from '@stencil/core';

@Component({
  tag: 'design-editor',
  styleUrl: 'design-editor.css',
})
export class DesignEditor {
  @Element() host: HTMLElement;

  render() {
    let buttonPositionInfo = {
      left: 20,
      top: 70,
      width: 100,
      height: 100,
    };

    return (
      <Host>
        <control-container positionInfo={buttonPositionInfo}>
          <button>This is a button</button>
        </control-container>
      </Host>
    );
  }
}
