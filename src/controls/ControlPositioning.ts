import { Control, IControlDesigner } from './Control';
import {
  AnchorHorizontal,
  AnchorModeHorizontal,
  AnchorModeVertical,
  AnchorVertical,
  applyAnchorH,
  applyAnchorV,
} from '../framework/anchoring';
import { Anchor, IStoredPositionInfo } from '../framework/layout';

/**
 * Encapsulates the position of a control and methods to manipulate the position of it.
 */
export class ControlPositioning {
  private readonly _control: Control;
  private _designer: IControlDesigner = null;
  private _layout: IStoredPositionInfo = null;
  private _anchor: Anchor;
  private _anchorV: AnchorVertical;
  private _anchorH: AnchorHorizontal;

  constructor(control: Control) {
    this._control = control;
  }

  /** Gets the html element whose properties are actually positioned on the canvas. */
  private get layoutElement(): HTMLElement {
    return this._control['_rootElement'].parentElement;
  }

  /** The current layout position stored in the object.  TODO remove as part of Issue #19 */
  public get layout(): IStoredPositionInfo {
    return this._layout ?? { left: 0, top: 0, width: 100, height: 20 };
  }

  /**
   * Updates the layout all at once.  TODO remove as part of Issue #19
   */
  public update(positionInfo: IStoredPositionInfo) {
    this._layout = positionInfo;
    this._designer?.notifyLayoutChanged(this._control);

    this.anchorV = {
      mode: AnchorModeVertical.stretch,
      top: positionInfo.top,
      bottom: positionInfo.bottom,
    };

    this.anchorH = {
      mode: AnchorModeHorizontal.stretch,
      left: positionInfo.left,
      right: positionInfo.right,
    };
  }

  /** Returns the vertical anchoring for the control */
  public get anchorV(): AnchorVertical {
    return this._anchorV;
  }

  /** Sets the vertical anchoring for the control */
  public set anchorV(anchor: AnchorVertical) {
    this._anchorV = anchor;
    if (this.layoutElement != null) {
      applyAnchorV(this.layoutElement, anchor);
    }
  }

  /** Returns the vertical anchoring mode for the control */
  public get anchorModeV(): AnchorModeVertical {
    return this.anchorV.mode;
  }

  /** Sets the vertical anchoring mode for the control */
  public set anchorModeV(anchorMode: AnchorModeVertical) {
    this.anchorV = this.calculateAnchorVertical(anchorMode);
  }

  /** Returns the horizontal anchoring for the control */
  public get anchorH(): AnchorHorizontal {
    return this._anchorH;
  }

  /** Sets the horizontal anchoring for the control */
  public set anchorH(anchor: AnchorHorizontal) {
    this._anchorH = anchor;
    if (this.layoutElement != null) {
      applyAnchorH(this.layoutElement, anchor);
    }
  }

  /** Gets the horizontal anchoring mode for the control */
  public get anchorModeH(): AnchorModeHorizontal {
    return this.anchorH.mode;
  }

  /** Sets the horizontal anchoring mode for the control */
  public set anchorModeH(anchorMode: AnchorModeHorizontal) {
    this.anchorH = this.calculateAnchorHorizontal(anchorMode);
  }

  /**
   * Calculates what anchoring would be used if the given mode was set on the control.
   * @param mode the mode to use for calculations
   */
  public calculateAnchorVertical(mode: AnchorModeVertical): AnchorVertical {
    let top = this.layoutElement.offsetTop;
    let myHeight = this.layoutElement.offsetHeight;
    let parentHeight = this.layoutElement.parentElement.offsetHeight;
    let bottom = this.layoutElement.parentElement.offsetHeight - (top + myHeight);

    switch (mode) {
      case AnchorModeVertical.none:
        let mid = (top + bottom) / 2 / parentHeight;
        return {
          mode: AnchorModeVertical.none,
          center: mid,
        };
      case AnchorModeVertical.top:
        return {
          mode: AnchorModeVertical.top,
          top: top,
          height: myHeight,
        };
      case AnchorModeVertical.bottom:
        return {
          mode: AnchorModeVertical.bottom,
          bottom: bottom,
          height: myHeight,
        };
      case AnchorModeVertical.stretch:
        return {
          mode: AnchorModeVertical.stretch,
          top: top,
          bottom: bottom,
        };
    }
  }

  /**
   * Calculates what anchoring would be used if the given mode was set on the control.
   * @param mode the mode to use for calculations
   */
  public calculateAnchorHorizontal(mode: AnchorModeHorizontal): AnchorHorizontal {
    let left = this.layoutElement.offsetLeft;
    let myWidth = this.layoutElement.offsetWidth;
    let parentWidth = this.layoutElement.parentElement.offsetWidth;
    let right = this.layoutElement.parentElement.clientWidth - (left + myWidth);

    switch (mode) {
      case AnchorModeHorizontal.none:
        let mid = (left + right) / 2 / parentWidth;
        return {
          mode: AnchorModeHorizontal.none,
          center: mid,
        };
      case AnchorModeHorizontal.left:
        return {
          mode: AnchorModeHorizontal.left,
          left: left,
          width: myWidth,
        };
      case AnchorModeHorizontal.right:
        return {
          mode: AnchorModeHorizontal.right,
          right: right,
          width: myWidth,
        };
      case AnchorModeHorizontal.stretch:
        return {
          mode: AnchorModeHorizontal.stretch,
          left: left,
          right: right,
        };
    }
  }
}
