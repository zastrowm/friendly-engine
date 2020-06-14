import { IStoredPositionInfo } from '../framework/layout';
import { Control, IControlDesigner } from './Control';

/**
 * Encapsulates the position of a control and methods to manipulate the position of it.
 */
export class ControlPositioning {
  private readonly _control: Control;
  private _designer: IControlDesigner = null;
  private _layout: IStoredPositionInfo = null;

  constructor(control: Control) {
    this._control = control;
  }

  public get layout(): IStoredPositionInfo {
    return this._layout ?? { left: 0, top: 0, width: 100, height: 20 };
  }

  public update(positionInfo: IStoredPositionInfo) {
    this._layout = positionInfo;
    this._designer?.notifyLayoutChanged(this._control);
  }
}
