import { determineEditStyle } from "../api/positioner";
import { IStoredPositionInfo } from "../api/layout";
import { DesignEditor } from "./design-editor";

export class ControlContainer extends HTMLElement {
  public controlType: string;

  public uniqueId: string;

  public get positionInfo(): IStoredPositionInfo {
    return this._positionInfo;
  }

  public set positionInfo(value: IStoredPositionInfo) {
    this._positionInfo = value;

    if (!this.isConnected) {
      return;
    }

    let anchorAndBoundary = determineEditStyle(
      this.positionInfo,
      this.parentElement
    );
    anchorAndBoundary.boundaries.applyTo(this);
  }

  private _positionInfo: IStoredPositionInfo;

  // the designer that we're attached to
  private designCanvas: DesignEditor;

  constructor() {
    super();
  }

  private isInited: boolean;

  public connectedCallback() {
    if (this.isInited) {
      return;
    }

    this.isInited = true;

    this.classList.add("control-container");

    let anchorAndBoundary = determineEditStyle(
      this.positionInfo,
      this.parentElement
    );

    anchorAndBoundary.boundaries.applyTo(this);

    this.addEventListener("mousedown", e => this.onMouseDown(e));
    this.designCanvas = this.closest("design-editor") as DesignEditor;
  }

  /**
   * On mouse down if we're not the active editor, make ourselves the active editor.  Then
   * pass the mouse event down into the editor.
   */
  public async onMouseDown(mouseEvent: MouseEvent) {
    this.designCanvas.helpers.selectAndMarkActive(this, mouseEvent);
  }
}

window.customElements.define("control-container", ControlContainer);
