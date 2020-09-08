/**
 * Encapsulates the position of a control and methods to manipulate the position of it.
 */
import { Control } from "../control-core/Control";
import { IStoredPositionInfo } from "../control-core/layout";
import { observable } from "mobx";

export class ControlPositioning {
  private readonly _control: Control;
  @observable
  private _layout: IStoredPositionInfo | null = null;

  constructor(control: Control) {
    this._control = control;
  }

  public get layout(): IStoredPositionInfo {
    return this._layout ?? { left: 0, top: 0, width: 100, height: 20 };
  }

  public update(positionInfo: IStoredPositionInfo) {
    this._layout = positionInfo;
  }
}
