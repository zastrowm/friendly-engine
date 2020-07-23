import { action, observable } from "mobx";
import { generateUniqueId, UniqueId } from "../util/UniqueId";
import {
  Control,
  IControlDescriptor,
  IControlSerializedData,
  ISerializedPropertyBag,
  IStoredPositionInfo
} from "../controls/@control";
import { buttonDescriptor } from "../controls/~Button";

export class LayoutViewModel {

  @observable
  public controls: ControlInformationViewModel[];

  constructor() {
    this.controls = [];
  }

  @action("load layout")
  public load(layout: ISavedLayoutInfo) {
    this.controls.splice(0, this.controls.length);

    for (let item of layout.controls) {
      this.controls.push(new ControlInformationViewModel(item, buttonDescriptor))
    }
  }

  @action("add control")
  public addControl() {

    let defaultValues = buttonDescriptor.getDefaultValues();

    this.controls.push(new ControlInformationViewModel({
      position: defaultValues.position ?? {
        width: 400,
        height: 200,
        left: 10,
        right: 10
      },
      properties: defaultValues.properties ?? {
        "text.text": "Test Button",
      },
      id: generateUniqueId(),
      typeId: "button"
    },
      buttonDescriptor))
  }
}

export class ControlInformationViewModel {
  public readonly id: UniqueId;
  public readonly typeId: string;

  @observable
  public properties: PropertyViewModel[];

  @observable
  public positionInfo: IStoredPositionInfo;

  public readonly control: Control;

  constructor(item: IControlSerializedData, descriptor: IControlDescriptor) {
    this.id = item.id;
    this.typeId = item.typeId;

    this.properties = [];
    this.positionInfo = item.position;

    for (let key in item.properties) {
      let value = item.properties[key];
      this.properties.push(new PropertyViewModel(key, value))
    }

    this.control = descriptor.createInstance();
  }
}

export class PropertyViewModel {
  constructor(public readonly key: string, public readonly value: any) {

  }
}

export interface ISavedLayoutInfo {
  root: {
    properties: ISerializedPropertyBag;
  };
  controls: IControlSerializedData[];
}
