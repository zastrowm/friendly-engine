import { EditorAppViewModel } from '../viewmodels/EditorAppViewModel';
import { ControlInformationViewModel } from '../viewmodels/ControlInformationViewModel';
import { UniqueId } from '../util/UniqueId';
import { registerUndoHandler } from '../viewmodels/UndoRedoQueueViewModel';
import { ControlCollectionViewModel } from '../viewmodels/ControlCollectionViewModel';
import { ControlPositioning, DragAnchor, AnchoredBoundary, IStoredPositionInfo, Point } from "../controls/@control";

/**
 * Handles the mouse-interacts with controls to move them around; also selects controls when they're clicked.
 */
export class ControlMovementManager {
  private _editorApp: EditorAppViewModel;
  private _canvasElement: HTMLElement;
  private lastPosition: Point;

  private readonly mouseUpListener: (MouseEvent: MouseEvent) => void;
  private readonly mouseMoveListener: (MouseEvent: MouseEvent) => void;
  private readonly mouseDownListener: (e: MouseEvent) => void;
  private readonly mouseClickListener: (e: MouseEvent) => boolean | undefined;

  private editingControl: ControlMovementData | null;

  constructor(editorApp: EditorAppViewModel, canvasElement: HTMLElement) {
    console.log('Detecting mouse clicks');

    this._editorApp = editorApp;
    this._canvasElement = canvasElement;
    this.editingControl = null;
    this.lastPosition = null as any;

    // bind events for "this"
    this.mouseUpListener = () => this.onMouseUp();
    this.mouseMoveListener = (mouseEvent) => this.onMouseMove(mouseEvent);
    this.mouseDownListener = (e) => this.onMouseDown(e);
    this.mouseClickListener = (e) => this.onMouseClick(e);

    this._canvasElement.addEventListener('click', this.mouseClickListener);
    this._canvasElement.addEventListener('mousedown', this.mouseDownListener);
  }

  /**
   *  Prevent clicks from going into controls so that the native handlers (like click or checkboxes) are triggered
   *  by the user moving around controls.
   */
  private onMouseClick(e: MouseEvent): boolean | undefined {
    let controlContainer = (e.target as HTMLElement).closest('.editable-control') as HTMLDivElement;
    if (controlContainer != null && !ControlMovementManager.isRootElement(controlContainer)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    } else {
      this._editorApp.controls.clearSelection();
    }
  }

  /* ~ */
  private static isRootElement(element: HTMLElement) {
    return element.classList.contains('~root');
  }

  /* ~ */
  private onMouseDown(mouseEvent: MouseEvent) {
    let targetElement = mouseEvent.target as HTMLElement;
    let controlContainer = targetElement.closest('.editable-control') as HTMLDivElement;

    if (controlContainer == null || ControlMovementManager.isRootElement(controlContainer)) return;

    let controlId = (controlContainer.dataset.id as any) as UniqueId;
    let controlVm = this._editorApp.controls.findControlById(controlId);

    controlVm.isSelected = true;

    // if we selected a drag handle, then use the anchoring given by that element
    let selectedDragHandle = targetElement.closest('.drag-handle') as HTMLElement;

    let sizeChange: DragAnchor;

    if (selectedDragHandle != null) {
      sizeChange = Number(selectedDragHandle.dataset.drag) as DragAnchor;
    } else {
      // by default to resizing all of them (e.g. a move operation)
      sizeChange = DragAnchor.all;
    }

    this.editingControl = new ControlMovementData(
      controlVm,
      controlContainer,
      controlContainer.parentElement!,
      sizeChange,
    );

    window.addEventListener('mousemove', this.mouseMoveListener);
    window.addEventListener('mouseup', this.mouseUpListener);

    this.lastPosition = getPosition(mouseEvent);

    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
  }

  /* ~ */
  private onMouseMove(mouseEvent: MouseEvent) {
    const minimumChangeRequired = 1;

    let position = getPosition(mouseEvent);
    let diff = position.subtract(this.lastPosition);
    if (Math.abs(diff.x) < minimumChangeRequired && Math.abs(diff.y) < minimumChangeRequired) {
      return;
    }

    this.editingControl?.applyDifference(diff);
  }

  /* ~ */
  private onMouseUp() {
    this.removeWindowListeners();

    if (this.editingControl != null && this.editingControl.lastUpdatedBoundary != null) {
      this._editorApp.undoRedo.add(moveUndoHandler, {
        controlsVm: this._editorApp.controls,
        id: this.editingControl.controlId,
        startingPosition: this.editingControl.originalPosition,
        endingPosition: this.editingControl.lastUpdatedBoundary?.clone(),
      });
    }

    this.editingControl?.markMovementDone();
  }

  /* ~ */
  private removeWindowListeners() {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  }

  /* ~ */
  public removeEventListeners() {
    this.removeWindowListeners();

    this._canvasElement.removeEventListener('mousedown', this.mouseDownListener);
    this._canvasElement.removeEventListener('click', this.mouseClickListener);
  }
}

/**
 * The movement data for a single control
 */
class ControlMovementData {
  public readonly anchorAndBoundary: { anchor: number; boundaries: AnchoredBoundary };
  public readonly sizeChange: DragAnchor;

  /**
   * The original position of the element that is now being moved
   */
  public readonly originalPosition: AnchoredBoundary;

  public readonly container: HTMLDivElement;
  public readonly controlId: UniqueId;

  public lastUpdatedBoundary: AnchoredBoundary | null;

  private readonly _position: ControlPositioning;

  /* ~ */
  constructor(
    control: ControlInformationViewModel,
    controlContainer: HTMLDivElement,
    designCanvasElement: HTMLElement,
    sizeChange: DragAnchor,
  ) {
    this._position = control.position;
    this.controlId = control.id;
    this.sizeChange = sizeChange;
    this.container = controlContainer;

    this.lastUpdatedBoundary = null;
    this.anchorAndBoundary = determineEditStyle(this._position.layout, designCanvasElement);
    this.originalPosition = this.anchorAndBoundary.boundaries.clone();
  }

  /** Take the given difference in point value, and apply it to the controlt o move it */
  public applyDifference(diff: Point) {
    // and now move as we need to
    let boundaryInfo = this.anchorAndBoundary.boundaries.clone();

    // TODO grid snap from somewhere else
    const gridSnap = 8;

    let sizeChange = this.sizeChange;

    // cache the values
    let isAdjustingWest = sizeChange & DragAnchor.west;
    let isAdjustingEast = sizeChange & DragAnchor.east;
    let isAdjustingNorth = sizeChange & DragAnchor.north;
    let isAdjustingSouth = sizeChange & DragAnchor.south;

    if (isAdjustingWest && isAdjustingEast) {
      // if we're moving left & right, then we want to snap in whichever direction we're moving
      // e.g. if we're moving right, snap right
      let diffValue;

      if (diff.x > 0) {
        diffValue = boundaryInfo.left - calculateSnapTo(boundaryInfo.left + diff.x, gridSnap);
        diffValue = -diffValue;
      } else {
        diffValue = boundaryInfo.right - calculateSnapTo(boundaryInfo.right - diff.x, gridSnap);
      }

      boundaryInfo.left += diffValue;
      boundaryInfo.right -= diffValue;
    } else if (isAdjustingWest) {
      boundaryInfo.left = calculateSnapTo(boundaryInfo.left + diff.x, gridSnap);
    } else if (isAdjustingEast) {
      boundaryInfo.right = calculateSnapTo(boundaryInfo.right - diff.x, gridSnap);
    }

    // same logic above as for left & right, but this time for up/down
    if (isAdjustingNorth && isAdjustingSouth) {
      let snapToValue;

      if (diff.y > 0) {
        snapToValue = boundaryInfo.top - calculateSnapTo(boundaryInfo.top + diff.y, gridSnap);
        snapToValue = -snapToValue;
      } else {
        snapToValue = boundaryInfo.bottom - calculateSnapTo(boundaryInfo.bottom - diff.y, gridSnap);
      }

      boundaryInfo.top += snapToValue;
      boundaryInfo.bottom -= snapToValue;
    } else if (isAdjustingNorth) {
      boundaryInfo.top = calculateSnapTo(boundaryInfo.top + diff.y, gridSnap);
    } else if (isAdjustingSouth) {
      boundaryInfo.bottom = calculateSnapTo(boundaryInfo.bottom - diff.y, gridSnap);
    }

    // if we've changed, go ahead and update the VM
    if (!boundaryInfo.equals(this.lastUpdatedBoundary)) {
      this.lastUpdatedBoundary = boundaryInfo;
      this._position.update(this.lastUpdatedBoundary);
      console.log("Updating");
    }
  }

  /** Finalize any movement that needs to be applied */
  public markMovementDone() {
    if (this.lastUpdatedBoundary == null) {
      return;
    }

    this.anchorAndBoundary!.boundaries = this.lastUpdatedBoundary;
    this._position.update(this.lastUpdatedBoundary);
  }
}

/** Gets a point that represents the given mouse location. */
function getPosition(event: MouseEvent): Point {
  return new Point(event.clientX, event.clientY);
}

/**
 * Apply the position info from the given viewmodel-control to the html in the running application.  This method
 * requires that the control layout is as follows:
 *     canvasHtmlElement
 *        controlContainerElement
 *           controlElement
 */
export function applyLayoutInfo(controlVm: ControlInformationViewModel) {
  let controlContainer = controlVm.control.htmlRoot.parentElement as HTMLElement;
  let canvasHtml = controlContainer.parentElement as HTMLElement;
  let editStyle = determineEditStyle(controlVm.position.layout, canvasHtml);
  editStyle.boundaries.applyTo(controlContainer);
}

/**
 * Convert a controls' relative coordinates into absolute coordinates for easy editing
 * @param storedInfo the stored position information for the control
 * @param parent the parent container of the control
 */
export function determineEditStyle(
  storedInfo: IStoredPositionInfo,
  parent: HTMLElement,
): { anchor: DragAnchor; boundaries: AnchoredBoundary } {
  let leftRightData = getAbsoluteOffsets(
    storedInfo.left!,
    storedInfo.right!,
    storedInfo.width!,
    parent.clientWidth,
    storedInfo,
    'horizontal',
    DragAnchor.west,
  );

  let topRightData = getAbsoluteOffsets(
    storedInfo.top!,
    storedInfo.bottom!,
    storedInfo.height!,
    parent.clientHeight,
    storedInfo,
    'vertical',
    DragAnchor.north,
  );

  return {
    anchor: leftRightData.anchor! | topRightData.anchor!,
    boundaries: new AnchoredBoundary(
      leftRightData.offsetA,
      topRightData.offsetA,
      leftRightData.offsetB,
      topRightData.offsetB,
    ),
  };
}

/**
 * Convert relative offset to absolute offsets
 * @param a the left or top relative size of the element
 * @param b the right or bottom relative size of the element
 * @param size the horizontal or vertical size of the element
 * @param parentSize the size of the parent container
 * @param data data structure used for logging when an error occurs
 * @param mode the human-readable mode used for logging when an error occurs
 * @param aFlag the anchor direction
 */
function getAbsoluteOffsets(
  a: number,
  b: number,
  size: number,
  parentSize: number,
  data: any,
  mode: string,
  aFlag: DragAnchor,
): { offsetA: number; offsetB: number; anchor: DragAnchor } {
  let offsetA;
  let offsetB;
  let anchor = DragAnchor.none;

  if (a == null && b == null) {
    console.error(`No ${mode} offsets stored`, data);
    offsetA = 0;
    offsetB = parentSize - 100;
    return { offsetA, offsetB, anchor };
  }

  if (a != null && b != null) {
    offsetA = a;
    offsetB = b;
    anchor = aFlag | (anchor << 1);
    return { offsetA, offsetB, anchor };
  }

  if (size == null) {
    console.error(`No ${mode} size stored`, data);
    size = 100;
  }

  if (a != null /* && b == null*/) {
    offsetA = a;
    offsetB = parentSize - (a + size);
    anchor = aFlag;
    return { offsetA, offsetB, anchor };
  } /* if (b != null && a == null) */ else {
    offsetB = b;
    offsetA = parentSize - b - size;
    anchor = aFlag << 1;
    return { offsetA, offsetB, anchor };
  }
}

/**
 * Snaps a grid value to the given divider
 */
export function calculateSnapTo(value: number, snapToDivider: number) {
  // if the snap is 4, then we want to determine if we're closest to the "next"
  // multiple of 4 or the "previous" multiple of 4

  // so get the remainder
  let distanceToNext = snapToDivider - (value % snapToDivider);

  // and compare that to half of the divider (in this case, instead we multiple since
  // multiplication is easier than dividing)
  if (distanceToNext * 2 < snapToDivider) {
    return value + distanceToNext;
  } else {
    return value - (value % snapToDivider);
  }
}

interface UndoArgs {
  controlsVm: ControlCollectionViewModel;
  id: UniqueId;
  startingPosition: IStoredPositionInfo;
  endingPosition: IStoredPositionInfo;
}

let moveUndoHandler = registerUndoHandler<UndoArgs>('moveControl', () => ({
  undo() {
    let control = this.controlsVm.findControlById(this.id);
    control.position.update(this.startingPosition);
    control.isSelected = true;
  },

  redo() {
    let control = this.controlsVm.findControlById(this.id);
    control.position.update(this.endingPosition);
    control.isSelected = true;
  },
}));
