import { Control } from '../control-core/Control';
import { IControlDescriptor } from '../control-core/controlRegistry';
import { IControlSerializedData } from '../control-core/propertyBag';
import { createAtom, observable } from 'mobx';
import { IStoredPositionInfo } from '../control-core/layout';
import { UniqueId } from '../util/UniqueId';
import { Atom } from 'mobx/lib/core/atom';

/**
 * Interface for an object that owns a control and needs to be notified when the control is
 * edited.
 */
export interface IControlInformationViewModelOwner {
  markSelected(controlVm: ControlInformationViewModel, isSelected: boolean): void;
}

/**
 * ViewModel for an editable control.
 */
export class ControlInformationViewModel {
  @observable
  private _isSelected: boolean;
  private _owner: IControlInformationViewModelOwner;

  private _positionAtom: Atom;

  public readonly typeId: string;
  public readonly control: Control;

  /**
   *  Whether or not the element is currently attached to the design-canvas.  This affects whether or not
   *  the control's properties are valid - for instance, when the control is not yet in the DOM, then the font-size
   *  will return 0 initially.
   */
  @observable
  public isAttached: boolean;

  constructor(owner: IControlInformationViewModelOwner, descriptor: IControlDescriptor, item?: IControlSerializedData) {
    this._owner = owner;

    this.typeId = descriptor.id;

    this._isSelected = false;
    this.isAttached = false;
    this.control = descriptor.createInstance();
    this._positionAtom = createAtom('position');

    if (item != null) {
      this.control.deserialize(item);
    }
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    if (this._isSelected === value) {
      return;
    }

    this._isSelected = value;
    this._owner.markSelected(this, value);
  }

  public get positionInfo(): IStoredPositionInfo {
    this._positionAtom.reportObserved();
    return this.control.layout;
  }

  public set positionInfo(value: IStoredPositionInfo) {
    this.control.layout = value;
    this._positionAtom.reportChanged();
  }

  public get id(): UniqueId {
    return this.control.id!;
  }
}
