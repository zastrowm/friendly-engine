import { determineEditStyle, calculateSnapTo } from "../api/positioner";
import {
  Anchor,
  Point,
  AnchoredBoundary,
  IStoredPositionInfo
} from "../api/layout";
import { IUndoCommand, IContext, undoCommandCreated } from "../api/undoCommand";
import { ControlContainer } from "./control-container";
import { DragHandle } from "./drag-handle";
import { DesignEditor } from "./design-editor";

export class ControlEditor extends HTMLElement {
  private mouseUpListener: (MouseEvent: MouseEvent) => void;
  private mouseMoveListener: (MouseEvent: MouseEvent) => void;

  private lastPosition: Point;

  private anchorAndBoundary: { anchor: number; boundaries: AnchoredBoundary };
  private sizeChange: Anchor;
  private lastUpdatedBoundary: AnchoredBoundary;

  /**
   * The original position of the element that is now being moved
   */
  private originalPosition: AnchoredBoundary;

  constructor() {
    super();

    this.addEventListener("mousedown", e => this.doMouseDown(e));

    this.mouseUpListener = () => this.onMouseUp();
    this.mouseMoveListener = mouseEvent => this.onMouseMove(mouseEvent);
  }

  public designEditor: DesignEditor;

  private get elementToMove(): HTMLElement {
    return this.parentElement;
  }

  private isInited: boolean;

  public connectedCallback() {
    if (this.isInited) {
      return;
    }

    this.isInited = true;

    this.designEditor = this.closest("design-editor");

    this.createDragHandleAndAdd(Anchor.west);
    this.createDragHandleAndAdd(Anchor.north);
    this.createDragHandleAndAdd(Anchor.east);
    this.createDragHandleAndAdd(Anchor.south);

    this.createDragHandleAndAdd(Anchor.nw);
    this.createDragHandleAndAdd(Anchor.ne);
    this.createDragHandleAndAdd(Anchor.se);
    this.createDragHandleAndAdd(Anchor.sw);
  }

  createDragHandleAndAdd(mode: Anchor) {
    let dragHandle = document.createElement("drag-handle") as DragHandle;
    dragHandle.anchorMode = mode;
    this.appendChild(dragHandle);
  }

  /** Transfer the mouse-down to be handled as if the event occurred on this element directly. */
  public transferMouseDown(mouseEvent: MouseEvent) {
    this.doMouseDown(mouseEvent);
  }

  public onMouseDown(mouseEvent: MouseEvent) {
    let target = mouseEvent.target as HTMLElement;
    let editorElement = target.closest("control-editor");

    if (editorElement == null) {
      debugger;
      // how did we get here?
      return;
    }

    mouseEvent.preventDefault();
    this.lastUpdatedBoundary = null;
    this.doMouseDown(mouseEvent);
  }

  /**
   * Common method for handling mouse down event (externally or internally)
   */
  private doMouseDown(mouseEvent: MouseEvent) {
    let target = this.parentElement;
    let controlContainer = target.closest(
      "control-container"
    ) as ControlContainer;

    // if we selected a drag handle, then use the anchoring given by that element
    let selectedDragHandle = (mouseEvent.target as HTMLElement).closest(
      "drag-handle"
    ) as DragHandle;
    if (selectedDragHandle != null) {
      this.sizeChange = selectedDragHandle.anchorMode;
    } else {
      // otherwise default to resizing all of them (e.g. a move operation)
      this.sizeChange = Anchor.all;
    }

    this.lastUpdatedBoundary = null;
    this.anchorAndBoundary = determineEditStyle(
      controlContainer.positionInfo,
      controlContainer.parentElement
    );
    this.originalPosition = this.anchorAndBoundary.boundaries.clone();

    window.addEventListener("mousemove", this.mouseMoveListener);
    window.addEventListener("mouseup", this.mouseUpListener);
    this.lastPosition = this.getPosition(mouseEvent);
  }

  private onMouseUp() {
    window.removeEventListener("mousemove", this.mouseMoveListener);
    window.removeEventListener("mouseup", this.mouseUpListener);

    if (this.lastUpdatedBoundary == null) {
      return;
    }

    this.anchorAndBoundary.boundaries = this.lastUpdatedBoundary;
    let controlContainer = this.elementToMove.closest(
      "control-container"
    ) as ControlContainer;
    controlContainer.positionInfo = this.lastUpdatedBoundary;

    let moveCommand = new MoveCommand(
      controlContainer.uniqueId,
      this.originalPosition.clone(),
      this.lastUpdatedBoundary.clone()
    );

    undoCommandCreated.trigger(this, moveCommand);
  }

  private onMouseMove(mouseEvent: MouseEvent) {
    const minimumChangeRequired = 1;

    let position = this.getPosition(mouseEvent);
    let diff = position.subtract(this.lastPosition);
    if (
      Math.abs(diff.x) < minimumChangeRequired &&
      Math.abs(diff.y) < minimumChangeRequired
    ) {
      return;
    }

    // and now move as we need to
    let boundaryInfo = this.anchorAndBoundary.boundaries.clone();

    const gridSnap = this.designEditor.gridSnap;

    // cache the values
    let isAdjustingWest = this.sizeChange & Anchor.west;
    let isAdjustingEast = this.sizeChange & Anchor.east;
    let isAdjustingNorth = this.sizeChange & Anchor.north;
    let isAdjustingSouth = this.sizeChange & Anchor.south;

    if (isAdjustingWest && isAdjustingEast) {
      // if we're moving left & right, then we want to snap in whichever direction we're moving
      // e.g. if we're moving right, snap right
      let diffValue;

      if (diff.x > 0) {
        diffValue =
          boundaryInfo.left -
          calculateSnapTo(boundaryInfo.left + diff.x, gridSnap);
        diffValue = -diffValue;
      } else {
        diffValue =
          boundaryInfo.right -
          calculateSnapTo(boundaryInfo.right - diff.x, gridSnap);
      }

      boundaryInfo.left += diffValue;
      boundaryInfo.right -= diffValue;
    } else if (isAdjustingWest) {
      boundaryInfo.left = calculateSnapTo(boundaryInfo.left + diff.x, gridSnap);
    } else if (isAdjustingEast) {
      boundaryInfo.right = calculateSnapTo(
        boundaryInfo.right - diff.x,
        gridSnap
      );
    }

    // same logic above as for left & right, but this time for up/down
    if (isAdjustingNorth && isAdjustingSouth) {
      let snapToValue;

      if (diff.y > 0) {
        snapToValue =
          boundaryInfo.top -
          calculateSnapTo(boundaryInfo.top + diff.y, gridSnap);
        snapToValue = -snapToValue;
      } else {
        snapToValue =
          boundaryInfo.bottom -
          calculateSnapTo(boundaryInfo.bottom - diff.y, gridSnap);
      }

      boundaryInfo.top += snapToValue;
      boundaryInfo.bottom -= snapToValue;
    } else if (isAdjustingNorth) {
      boundaryInfo.top = calculateSnapTo(boundaryInfo.top + diff.y, gridSnap);
    } else if (isAdjustingSouth) {
      boundaryInfo.bottom = calculateSnapTo(
        boundaryInfo.bottom - diff.y,
        gridSnap
      );
    }

    if (!boundaryInfo.equals(this.anchorAndBoundary.boundaries)) {
      // and apply it to the element

      boundaryInfo.applyTo(this.elementToMove);
      this.lastUpdatedBoundary = boundaryInfo;
    }
  }

  /** Gets a point that represents the given mouse location. */
  private getPosition(event: MouseEvent): Point {
    return new Point(event.clientX, event.clientY);
  }
}

class MoveCommand implements IUndoCommand {
  constructor(
    private id: string,
    private startingPosition: IStoredPositionInfo,
    private endingPosition: IStoredPositionInfo
  ) {}

  undo(context: IContext): void | Promise<void> {
    let controlContainer = context.editor.getControlContainer(this.id);
    controlContainer.positionInfo = this.startingPosition;
    context.editor.selectAndMarkActive(controlContainer);
  }

  redo(context: IContext): void | Promise<void> {
    let controlContainer = context.editor.getControlContainer(this.id);
    controlContainer.positionInfo = this.endingPosition;
    context.editor.selectAndMarkActive(controlContainer);
  }
}

window.customElements.define("control-editor", ControlEditor);
