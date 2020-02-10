import { Component, h, Prop, Host, Listen } from '@stencil/core';
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

  // the designer that we're attached to
  private designCanvas: HTMLDesignEditorElement;

  constructor() {}

  /**
   * On mouse down if we're not the active editor, make ourselves the active editor.  Then
   * pass the mouse event down into the editor.
   */
  @Listen('mousedown', { passive: false })
  public async onMouseDown(mouseEvent: MouseEvent) {
    let activeEditor = this.designCanvas.helpers.activeEditor;
    if (activeEditor.parentElement == this.host) {
      return;
    }

    console.log('Stealing active control editor');

    this.host.appendChild(activeEditor);
    mouseEvent.preventDefault();

    await activeEditor.transferMouseDown(mouseEvent);
  }

  /** STENCIL :: Called every time the component is connected to the DOM */
  public connectedCallback() {
    this.designCanvas = this.host.closest('design-editor');
  }

  /** STENCIL :: Called evertime the element needs to be rendered */
  public render() {
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
      </Host>
    );
  }
}
