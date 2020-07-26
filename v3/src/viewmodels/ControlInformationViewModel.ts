import { Control } from "../control-core/Control";
import { IControlDescriptor } from "../control-core/controlRegistry";
import { IControlSerializedData } from "../control-core/propertyBag";
import { observable } from "mobx";
import { IStoredPositionInfo } from "../control-core/layout";
import { UniqueId } from "../util/UniqueId";

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

  public readonly typeId: string;
  public readonly control: Control;

  constructor(owner: IControlInformationViewModelOwner, descriptor: IControlDescriptor, item: IControlSerializedData) {
    this._owner = owner;

    this.typeId = item.typeId;

    this._isSelected = false;
    this.control = descriptor.createInstance();
    this.control.deserialize(item);
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
    return this.control.layout;
  }

  public set positionInfo(value: IStoredPositionInfo) {
    this.control.layout = value;
  }

  public get id(): UniqueId {
    return this.control.id!;
  }
}
