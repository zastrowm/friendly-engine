/**
 * Encapsulates the position of a control and methods to manipulate the position of it.
 */

// noinspection ES6PreferShortImport
import { Control } from "../control-core/Control";
import {
  AnchorAxisLayout,
  AnchorAxisLayoutMode,
  AnchorLayoutSnapshot,
  BiAxis,
  fromStoredPositionInfo,
} from "./anchoring";
import { assume } from "../util/util";
import { applyAnchorH, applyAnchorV } from "./anchoring.apply";
import { ISerializedLayout } from "./propertyBag";

export class ControlPositioning {
  private readonly _control: Control;

  private _anchorV: AnchorAxisLayout;
  private _anchorH: AnchorAxisLayout;

  constructor(control: Control) {
    this._control = control;
    this._anchorV = {
      mode: AnchorAxisLayoutMode.start,
      start: 0,
      size: 20
    };

    this._anchorH = {
      mode: AnchorAxisLayoutMode.start,
      size: 100,
      start: 0,
    };
  }

  /** Gets the html element whose properties are actually positioned on the canvas. */
  private get layoutElement(): HTMLElement | null {
    return this._control.htmlRoot.parentElement as HTMLElement;
  }

  public get isAttached(): boolean {
    return this.layoutElement?.parentElement != null;
  }

  public get hMode(): AnchorAxisLayoutMode {
    return this._anchorH.mode;
  }

  public get vMode(): AnchorAxisLayoutMode {
    return this._anchorV.mode;
  }

  public applyLayoutInfo(): boolean {
    if (!this.isAttached) {
      return false;
    }

    assume<HTMLElement>(this.layoutElement);

    applyAnchorH(this.layoutElement, this._anchorH);
    applyAnchorV(this.layoutElement, this._anchorV);
    return true;
  }

  /**
   * Updates the layout all at once.
   */
  public updateLayout(hAxisLayout: AnchorAxisLayout,
                      vAxisLayout: AnchorAxisLayout) {
    this._anchorH = { ...hAxisLayout };
    this._anchorV = { ...vAxisLayout };

    this.applyLayoutInfo();
  }

  public getHSnapshot(): AnchorLayoutSnapshot {
    if (!this.isAttached) {
      throw Error("Cannot get snapshot for a non-attached control");
    }

    assume<HTMLElement>(this.layoutElement);

    let left = this.layoutElement.offsetLeft;
    let myWidth = this.layoutElement.offsetWidth;
    let parentWidth = this.layoutElement.parentElement!.offsetWidth;
    let right = this.layoutElement.parentElement!.clientWidth - (left + myWidth);

    return {
      start: left,
      end: right,
      size: myWidth,
      parentSize: parentWidth,
    }
  }

  public getVSnapshot(): AnchorLayoutSnapshot {
    if (!this.isAttached) {
      throw Error("Cannot get snapshot for a non-attached control");
    }

    assume<HTMLElement>(this.layoutElement);

    let top = this.layoutElement.offsetTop;
    let myHeight = this.layoutElement.offsetHeight;
    let parentHeight = this.layoutElement.parentElement!.offsetHeight;
    let bottom = this.layoutElement.parentElement!.clientHeight - (top + myHeight);

    return {
      start: top,
      end: bottom,
      size: myHeight,
      parentSize: parentHeight,
    }
  }

  public serialize(): ISerializedLayout {
    return {
      horizontal: { ...this._anchorH },
      vertical: { ...this._anchorV },
    } as BiAxis<AnchorAxisLayout> as any as ISerializedLayout;
  }

  public deserialize(value: ISerializedLayout | null): void {

    if (value != null) {
      // backwards compatibility after #19 (better layout system) was implemented
      let asStoredPosition = value as any;
      if (asStoredPosition.left != null) {
        value = fromStoredPositionInfo(asStoredPosition);
      }

      assume<BiAxis<AnchorAxisLayout>>(value);
      this.updateLayout(value.horizontal, value.vertical);
    }
  }
}
