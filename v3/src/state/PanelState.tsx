import { action, observable } from "mobx";
import { generateUniqueId, UniqueId } from "../util/UniqueId";
import {
  Control,
  IControlDescriptor,
  IControlSerializedData,
  IDefaultControlValues,
  ISerializedPropertyBag,
  IStoredPositionInfo,
  snapLayout
} from "../controls/@control";
import { buttonDescriptor } from "../controls/~Button";

export class LayoutViewModel {

  @observable
  public controls: ControlInformationViewModel[];

  /** Determines the grid-snap for the controls */
  public readonly gridSnap = 8;

  constructor() {
    this.controls = [];
  }

  @action("load layout")
  public load(layout: ISavedLayoutInfo) {
    // this.controls.splice(0, this.controls.length);
    //
    // for (let item of layout.controls) {
    //   this.controls.push(new ControlInformationViewModel(buttonDescriptor, item))
    // }
  }

  @action("add control")
  public addControl(defaultValues?: IDefaultControlValues) {

    let descriptor = buttonDescriptor;

    let normalizedDefaults = LayoutViewModel.createInitialValues(descriptor, defaultValues);

    // TODO copy the data
    let data: IControlSerializedData = {
      id: generateUniqueId(),
      typeId: descriptor.id,
      position: normalizedDefaults.position,
      properties: normalizedDefaults.properties,
    };

    snapLayout(data.position, this.gridSnap);

    let control = descriptor.createInstance();
    control.deserialize(data);
    //
    // addControlsUndoHandler.trigger(this, {
    //   entries: [
    //     {
    //       descriptor: descriptor,
    //       data,
    //     },
    //   ],
    // });

    this.controls.push(new ControlInformationViewModel(descriptor, data));
  }

  /**
   * Creates the initial values to use when creating a control.
   */
  private static createInitialValues(
    descriptor: IControlDescriptor,
    providedDefaults?: IDefaultControlValues,
  ): Required<IDefaultControlValues> {
    let descriptorProvidedDefaults = descriptor.getDefaultValues();

    // we prefer caller provided defaults over descriptor provided defaults
    let position = providedDefaults?.position ?? descriptorProvidedDefaults.position;
    let properties = providedDefaults?.properties ?? descriptorProvidedDefaults.properties ?? {};

    // make sure we have some default position info for controls
    position = Object.assign(
      {
        left: 20,
        top: 20,
        width: 40,
        height: 60,
      },
      position,
    );

    return {
      position,
      properties,
    };
  }

}

export class ControlInformationViewModel {

  public readonly typeId: string;
  public readonly control: Control;

  constructor(descriptor: IControlDescriptor, item: IControlSerializedData) {
    this.typeId = item.typeId;

    this.control = descriptor.createInstance();
    this.control.deserialize(item);
  }

  public get positionInfo(): IStoredPositionInfo {
    return this.control.layout;
  }

  public get id(): UniqueId {
    return this.control.id!;
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
