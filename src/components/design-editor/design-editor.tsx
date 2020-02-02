import { Component, h, State } from '@stencil/core';
import { Element } from '@stencil/core';

import { determineEditStyle } from '../../api/positioner';
import hmr from '../../api/hmr';
import { Anchor, Point, AnchoredBoundary } from '../../api/layout';

@Component({
  tag: 'design-editor',
  styleUrl: 'design-editor.css',
})
export class DesignEditor {
  @Element() host: HTMLElement;

  private mouseDownListener: (mouseEvent: MouseEvent) => void;
  private mouseUpListener: (MouseEvent: MouseEvent) => void;
  private mouseMoveListener: (MouseEvent: MouseEvent) => void;

  private lastPosition: Point;
  private elementToMove: HTMLElement;
  private dragTarget: HTMLElement;
  private anchorAndBoundary: { anchor: number; boundaries: AnchoredBoundary };
  lastUpdatedBoundary: AnchoredBoundary;

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

    let anchorAndBoundary = determineEditStyle(buttonPositionInfo, this.host);

    console.log('re-render');

    let styleInfo = anchorAndBoundary.boundaries.toStyle() as any;

    this.anchorAndBoundary = anchorAndBoundary;

    return (
      <div>
        <div class="control-container button" style={styleInfo}>
          <button onClick={() => alert()}>This is a button</button>
          <div class="active-editor">
            <drag-handle anchorMode={Anchor.west}></drag-handle>
            <drag-handle anchorMode={Anchor.north}></drag-handle>
            <drag-handle anchorMode={Anchor.east}></drag-handle>
            <drag-handle anchorMode={Anchor.south}></drag-handle>

            <drag-handle anchorMode={Anchor.nw}></drag-handle>
            <drag-handle anchorMode={Anchor.ne}></drag-handle>
            <drag-handle anchorMode={Anchor.se}></drag-handle>
            <drag-handle anchorMode={Anchor.sw}></drag-handle>
          </div>
        </div>
      </div>
    );
  }

  public componentDidRender() {
    this.elementToMove = this.host.querySelector('.control-container');
  }

  private handleMouseDown(mouseEvent: MouseEvent) {
    let target = mouseEvent.target as HTMLElement;
    let editorElement = target.closest('.active-editor');

    this.dragTarget = target;

    if (editorElement != null) {
      window.addEventListener('mousemove', this.mouseMoveListener);
      window.addEventListener('mouseup', this.mouseUpListener);

      this.lastPosition = this.getPosition(mouseEvent);
    }
  }

  private handleMouseUp(mouseEvent: MouseEvent) {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);

    this.anchorAndBoundary.boundaries = this.lastUpdatedBoundary;
  }

  private handleMouseMove(mouseEvent: MouseEvent) {
    if (this.elementToMove == null) {
      return;
    }

    const minimumChangeRequired = 1;

    let position = this.getPosition(mouseEvent);
    let diff = position.subtract(this.lastPosition);
    if (Math.abs(diff.x) < minimumChangeRequired && Math.abs(diff.y) < minimumChangeRequired) {
      return;
    }

    // by default assuming we're moving the element
    let sizeChange = Anchor.all;

    // but if we selected a drag handle, then use the anchoring given by that element
    let selectedDragHandle = this.dragTarget.closest('drag-handle');
    if (selectedDragHandle != null) {
      sizeChange = selectedDragHandle.anchorMode;
    }

    // and now move as we need to
    let boundaryInfo = this.anchorAndBoundary.boundaries.clone();

    const clampper = 10;

    if (sizeChange & Anchor.west) {
      boundaryInfo.left += diff.x;
    }
    if (sizeChange & Anchor.east) {
      boundaryInfo.right -= diff.x;
    }
    if (sizeChange & Anchor.north) {
      boundaryInfo.top += diff.y;
    }
    if (sizeChange & Anchor.south) {
      boundaryInfo.bottom -= diff.y;
    }

    let hOffset = DesignEditor.calculateOffset(
      boundaryInfo.left,
      boundaryInfo.right,
      sizeChange,
      Anchor.west,
    );

    let vOffset = DesignEditor.calculateOffset(
      boundaryInfo.top,
      boundaryInfo.bottom,
      sizeChange,
      Anchor.north,
    );

    boundaryInfo.left -= hOffset;
    boundaryInfo.right += hOffset;
    boundaryInfo.top -= vOffset;
    boundaryInfo.bottom += vOffset;

    if (!boundaryInfo.equals(this.anchorAndBoundary.boundaries)) {
      // and apply it to the element

      console.log(boundaryInfo);

      boundaryInfo.applyTo(this.elementToMove);
      this.lastUpdatedBoundary = boundaryInfo;
    }
  }

  private static calculateOffset(a: number, b: number, anchor: Anchor, anchorFlag: Anchor) {
    const clamper = 8;

    let aFlag = anchorFlag;
    let bFlag = anchorFlag << 1;

    if (anchor & (aFlag | bFlag)) {
      return Math.abs(a % clamper);
    } else if (anchorFlag & aFlag) {
      return Math.abs(a % clamper);
    } else if (anchorFlag & bFlag) {
      return Math.abs(b % clamper);
    } else {
      return 0;
    }
  }

  private static clampValue(value: number, clampper: number) {
    return value;
  }

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

  private getPosition(event: MouseEvent): Point {
    return new Point(event.clientX, event.clientY);
  }
}
