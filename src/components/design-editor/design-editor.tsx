import { Component, h } from '@stencil/core';
import { Element } from '@stencil/core';

import { determineEditStyle } from '../../api/positioner';
import hmr from '../../api/hmr';

@Component({
  tag: 'design-editor',
  styleUrl: 'design-editor.css',
})
export class DesignEditor {
  @Element() host: HTMLElement;

  private mouseDownListener: (mouseEvent: MouseEvent) => void;
  private mouseUpListener: (MouseEvent: MouseEvent) => void;
  private mouseMoveListener: (MouseEvent: MouseEvent) => void;

  constructor() {
    this.mouseDownListener = mouseEvent => this.handleMouseDown(mouseEvent);
    this.mouseUpListener = mouseEvent => this.handleMouseUp(mouseEvent);
    this.mouseMoveListener = mouseEvent => this.handleMouseMove(mouseEvent);
  }

  render() {
    let buttonPositionInfo = {
      left: 20,
      top: 70,
      width: 100,
      height: 100,
    };

    let positionInfo = determineEditStyle(buttonPositionInfo, this.host);

    console.log(positionInfo);
    console.log({
      clientWidth: this.host.clientWidth,
      clientHeight: this.host.clientHeight,
    });

    return (
      <div>
        <div class="control-container button" style={positionInfo as any}>
          <button onClick={() => alert()}>This is a button</button>
          <div class="active-editor">
            <div class="drag-handle-nw"></div>
            <div class="drag-handle-ne"></div>
            <div class="drag-handle-se"></div>
            <div class="drag-handle-sw"></div>
          </div>
        </div>
      </div>
    );
  }

  private handleMouseDown(mouseEvent: MouseEvent) {
    let target = mouseEvent.target as HTMLElement;
    let editorElement = target.closest('.active-editor');

    if (editorElement != null) {
      window.addEventListener('mousemove', this.mouseMoveListener);
      window.addEventListener('mouseup', this.mouseUpListener);
    }
  }

  private handleMouseUp(mouseEvent: MouseEvent) {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  }

  private handleMouseMove(mouseEvent: MouseEvent) {}

  public componentWillLoad() {
    hmr.componentWillLoad(this.host, this);

    console.log('Editor added');

    this.host.addEventListener('mousedown', this.mouseDownListener);
  }

  public componentDidUnload() {
    hmr.componentDidUnload(this.host);

    console.log('Editor removed');
    this.host.removeEventListener('mousedown', this.mouseDownListener);
  }
}
