import { determineEditStyle } from '../../framework/positioner';
import { IStoredPositionInfo } from '../../framework/layout';
import { DesignSurfaceElement } from './design-surface.e';
import { CustomHtmlElement, customElement } from '@friendly/elements/CustomHtmlElement';

import { Control } from 'src/controls/commonControls';
import { IControlDesigner } from 'src/controls/Control';

@customElement(ControlContainer.tagName)
export class ControlContainer extends CustomHtmlElement implements IControlDesigner {
  public static readonly tagName = 'control-container';

  private _control: Control;

  constructor() {
    super();

    this.addEventListener('mousedown', (e) => this.onMouseDown(e));
  }

  public get control(): Control {
    return this._control;
  }

  public set control(value: Control) {
    if (value == null) {
      throw new Error('Null control is not allowed');
    } else if (this._control != null) {
      throw new Error('Control has already been set; cannot change controls');
    }

    this._control = value;
    this.positionInfo = this._control.layout;
    this.appendChild(this.control.createElement());
  }

  public get positionInfo(): IStoredPositionInfo {
    return this._positionInfo;
  }

  public set positionInfo(value: IStoredPositionInfo) {
    this._positionInfo = value;
    this._control.layout = value;

    if (!this.isConnected) {
      return;
    }

    let anchorAndBoundary = determineEditStyle(this.positionInfo, this.parentElement);
    anchorAndBoundary.boundaries.applyTo(this);
  }

  public notifyLayoutChanged(_: Control): void {
    if (this.positionInfo != this.control.layout) {
      this.positionInfo = this.control.layout;
    }
  }

  private _positionInfo: IStoredPositionInfo;

  // the designer that we're attached to
  private designCanvas: DesignSurfaceElement;

  public onFirstConnected() {
    this.classList.add('control-container');

    let anchorAndBoundary = determineEditStyle(this.positionInfo, this.parentElement);

    anchorAndBoundary.boundaries.applyTo(this);

    this.designCanvas = this.closest(DesignSurfaceElement.tagName);
  }

  /**
   * On mouse down if we're not the active editor, make ourselves the active editor.  Then
   * pass the mouse event down into the editor.
   */
  public onMouseDown(mouseEvent: MouseEvent) {
    mouseEvent.stopPropagation();
    this.designCanvas.selectAndMarkActive(this, mouseEvent);
  }
}
