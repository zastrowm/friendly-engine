import { EditorAppViewModel } from '../viewmodels/EditorAppViewModel';
import { ControlInformationViewModel } from '../viewmodels/ControlInformationViewModel';
import { UniqueId } from '../util/UniqueId';
import { registerUndoHandler } from '../viewmodels/UndoRedoQueueViewModel';
import { ControlCollectionViewModel } from '../viewmodels/ControlCollectionViewModel';
import {  ControlPositioning, DragAnchor, Point } from "../controls/@control";
import {
  adjustAnchoredLayout, AnchorAxisLayout,
  AnchorAxisLayoutAdjustmentMode,
  AnchorAxisLayoutMode,
  AnchorLayoutSnapshot,
  areAnchorSnapshotsEqual, BiAxis, convertToAnchorLayout
} from "../control-core/anchoring";
import { Enums } from "../util/enums";

/**
 * Handles the mouse-interacts with controls to move them around; also selects controls when they're clicked.
 */
export class ControlMovementManager {
  private _editorApp: EditorAppViewModel;
  private _canvasElement: HTMLElement;
  private _startingPosition: Point;

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
    this._startingPosition = null as any;

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

    this._startingPosition = getPosition(mouseEvent);

    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
  }

  /* ~ */
  private onMouseMove(mouseEvent: MouseEvent) {
    const minimumChangeRequired = 1;

    let position = getPosition(mouseEvent);
    let diff = position.subtract(this._startingPosition);
    if (Math.abs(diff.x) < minimumChangeRequired && Math.abs(diff.y) < minimumChangeRequired) {
      return;
    }

    this.editingControl?.applyDifference(diff);
  }

  /* ~ */
  private onMouseUp() {
    this.removeWindowListeners();

    if (this.editingControl?.didChange() === true) {
      this._editorApp.undoRedo.add(moveUndoHandler, {
        controlsVm: this._editorApp.controls,
        id: this.editingControl.controlId,
        startingPosition: this.editingControl.layoutOriginal,
        endingPosition: this.editingControl.layoutCurrent,
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

interface IAxisData {
  mode: AnchorAxisLayoutMode;
  snapshotInitial: AnchorLayoutSnapshot;
  snapshotLatest: AnchorLayoutSnapshot;
  adjustType: AnchorAxisLayoutAdjustmentMode;
}

/**
 * The movement data for a single control
 */
class ControlMovementData {

  public readonly container: HTMLDivElement;
  public readonly controlId: UniqueId;

  private readonly _position: ControlPositioning;

  private readonly _hData: IAxisData;
  private readonly _vData: IAxisData;

  private _didChange: boolean;

  /* ~ */
  constructor(
    control: ControlInformationViewModel,
    controlContainer: HTMLDivElement,
    designCanvasElement: HTMLElement,
    sizeChange: DragAnchor,
  ) {
    this._position = control.position;
    this.controlId = control.id;
    this.container = controlContainer;

    let hAdjustmentMode: AnchorAxisLayoutAdjustmentMode =
      (Enums.hasFlag(sizeChange, DragAnchor.west) ? AnchorAxisLayoutAdjustmentMode.start : 0)
      | (Enums.hasFlag(sizeChange, DragAnchor.east) ? AnchorAxisLayoutAdjustmentMode.end : 0)

    let vAdjustmentMode: AnchorAxisLayoutAdjustmentMode =
      (Enums.hasFlag(sizeChange, DragAnchor.north) ? AnchorAxisLayoutAdjustmentMode.start : 0)
      | (Enums.hasFlag(sizeChange, DragAnchor.south) ? AnchorAxisLayoutAdjustmentMode.end : 0)

    this._hData = {
      mode: this._position.hMode,
      snapshotInitial: this._position.getHSnapshot(),
      snapshotLatest: this._position.getHSnapshot(),
      adjustType: hAdjustmentMode,
    }

    this._vData = {
      mode: this._position.vMode,
      snapshotInitial: this._position.getVSnapshot(),
      snapshotLatest: this._position.getVSnapshot(),
      adjustType: vAdjustmentMode,
    }

    this._didChange = false;
  }

  public get layoutOriginal(): BiAxis<AnchorAxisLayout> {
    return {
      horizontal: convertToAnchorLayout(this._hData.snapshotInitial, this._hData.mode),
      vertical: convertToAnchorLayout(this._vData.snapshotInitial, this._vData.mode),
    }
  }

  public get layoutCurrent(): BiAxis<AnchorAxisLayout> {
    return {
      horizontal: convertToAnchorLayout(this._hData.snapshotLatest, this._hData.mode),
      vertical: convertToAnchorLayout(this._vData.snapshotLatest, this._vData.mode),
    }
  }

  public didChange(): boolean {
    return this._didChange;
  }

  /** Take the given difference in point value, and apply it to the controlt o move it */
  public applyDifference(diff: Point) {

    // TODO grid snap from somewhere else
    const gridSnap = 8;

    // and now move as we need to
    let newHSnapshot = adjustAnchoredLayout(
      this._hData.snapshotInitial,
      this._hData.adjustType,
      diff.x,
      gridSnap
    );

    let newVSnapshot = adjustAnchoredLayout(
      this._vData.snapshotInitial,
      this._vData.adjustType,
      diff.y,
      gridSnap
    );

    let didChange = false;

    if (!areAnchorSnapshotsEqual(this._hData.snapshotLatest, newHSnapshot)) {
      this._hData.snapshotLatest = newHSnapshot;
      didChange = true;
    }

    if (!areAnchorSnapshotsEqual(this._vData.snapshotLatest, newVSnapshot)) {
      this._vData.snapshotLatest = newVSnapshot;
      didChange = true;
    }

    if (didChange) {
      this._didChange = true;

      this.pushData();
      console.log("Updating");
    }
  }

  private pushData() {
    this._position.updateLayout(
      convertToAnchorLayout(this._hData.snapshotLatest, this._hData.mode),
      convertToAnchorLayout(this._vData.snapshotLatest, this._vData.mode)
    );
  }

  /** Finalize any movement that needs to be applied */
  public markMovementDone() {
    this.pushData();
  }
}

/** Gets a point that represents the given mouse location. */
function getPosition(event: MouseEvent): Point {
  return new Point(event.clientX, event.clientY);
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
  startingPosition: BiAxis<AnchorAxisLayout>;
  endingPosition: BiAxis<AnchorAxisLayout>;
}

let moveUndoHandler = registerUndoHandler<UndoArgs>('moveControl', () => ({
  undo() {
    let control = this.controlsVm.findControlById(this.id);
    control.position.updateLayout(this.startingPosition.horizontal, this.startingPosition.vertical);
    control.isSelected = true;
  },

  redo() {
    let control = this.controlsVm.findControlById(this.id);
    control.position.updateLayout(this.endingPosition.horizontal, this.endingPosition.vertical);
    control.isSelected = true;
  },
}));
