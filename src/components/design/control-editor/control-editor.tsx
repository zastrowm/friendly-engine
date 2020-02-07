import { Component, h, State } from '@stencil/core';
import { Element } from '@stencil/core';

import { determineEditStyle, calculateSnapTo } from '../../../api/positioner';
import { Anchor, Point, AnchoredBoundary } from '../../../api/layout';

@Component({
  tag: 'control-editor',
  styleUrl: 'control-editor.css',
})
export class ControlEditor {
  @Element() host: HTMLElement;

  private mouseDownListener: (mouseEvent: MouseEvent) => void;
  private mouseUpListener: (MouseEvent: MouseEvent) => void;
  private mouseMoveListener: (MouseEvent: MouseEvent) => void;

  private lastPosition: Point;

  private dragTarget: HTMLElement;
  private anchorAndBoundary: { anchor: number; boundaries: AnchoredBoundary };
  lastUpdatedBoundary: AnchoredBoundary;

  constructor() {
    this.mouseDownListener = mouseEvent => this.handleMouseDown(mouseEvent);
    this.mouseUpListener = mouseEvent => this.handleMouseUp(mouseEvent);
    this.mouseMoveListener = mouseEvent => this.handleMouseMove(mouseEvent);
  }

  private get elementToMove(): HTMLElement {
    return this.host.parentElement;
  }

  render() {
    let buttonPositionInfo = {
      left: 20,
      top: 70,
      width: 100,
      height: 100,
    };

    return (
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
    );
  }

  private async handleMouseDown(mouseEvent: MouseEvent) {
    let target = mouseEvent.target as HTMLElement;
    let editorElement = target.closest('.active-editor');

    this.dragTarget = target;

    if (editorElement != null) {
      let controlContainer = target.closest('control-container');
      this.anchorAndBoundary = determineEditStyle(
        controlContainer.positionInfo,
        controlContainer.parentElement,
      );

      window.addEventListener('mousemove', this.mouseMoveListener);
      window.addEventListener('mouseup', this.mouseUpListener);

      this.lastPosition = this.getPosition(mouseEvent);
    }
  }

  private handleMouseUp(mouseEvent: MouseEvent) {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);

    this.anchorAndBoundary.boundaries = this.lastUpdatedBoundary;
    let controlContainer = this.elementToMove.closest('control-container');
    controlContainer.positionInfo = this.lastUpdatedBoundary;
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

    const clampper = 8;

    // cache the values
    let isAdjustingWest = sizeChange & Anchor.west;
    let isAdjustingEast = sizeChange & Anchor.east;
    let isAdjustingNorth = sizeChange & Anchor.north;
    let isAdjustingSouth = sizeChange & Anchor.south;

    if (isAdjustingWest && isAdjustingEast) {
      // if we're moving left & right, then we want to snap in whichever direction we're moving
      // e.g. if we're moving right, snap right
      let diffValue;

      if (diff.x > 0) {
        diffValue = boundaryInfo.left - calculateSnapTo(boundaryInfo.left + diff.x, clampper);
        diffValue = -diffValue;
      } else {
        diffValue = boundaryInfo.right - calculateSnapTo(boundaryInfo.right - diff.x, clampper);
      }

      boundaryInfo.left += diffValue;
      boundaryInfo.right -= diffValue;
    } else if (isAdjustingWest) {
      boundaryInfo.left = calculateSnapTo(boundaryInfo.left + diff.x, clampper);
    } else if (isAdjustingEast) {
      boundaryInfo.right = calculateSnapTo(boundaryInfo.right - diff.x, clampper);
    }

    // same logic above as for left & right, but this time for up/down
    if (isAdjustingNorth && isAdjustingSouth) {
      let snapToValue;

      if (diff.y > 0) {
        snapToValue = boundaryInfo.top - calculateSnapTo(boundaryInfo.top + diff.y, clampper);
        snapToValue = -snapToValue;
      } else {
        snapToValue = boundaryInfo.bottom - calculateSnapTo(boundaryInfo.bottom - diff.y, clampper);
      }

      boundaryInfo.top += snapToValue;
      boundaryInfo.bottom -= snapToValue;
    } else if (isAdjustingNorth) {
      boundaryInfo.top = calculateSnapTo(boundaryInfo.top + diff.y, clampper);
    } else if (isAdjustingSouth) {
      boundaryInfo.bottom = calculateSnapTo(boundaryInfo.bottom - diff.y, clampper);
    }

    if (!boundaryInfo.equals(this.anchorAndBoundary.boundaries)) {
      // and apply it to the element

      boundaryInfo.applyTo(this.elementToMove);
      this.lastUpdatedBoundary = boundaryInfo;
    }
  }

  public componentWillLoad() {
    console.log('Editor added');

    this.host.addEventListener('mousedown', this.mouseDownListener);
  }

  public componentDidUnload() {
    console.log('Editor removed');
    this.host.removeEventListener('mousedown', this.mouseDownListener);
  }

  private getPosition(event: MouseEvent): Point {
    return new Point(event.clientX, event.clientY);
  }
}
