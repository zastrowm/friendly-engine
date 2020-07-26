import { action, observable } from "mobx";
import { generateUniqueId } from "../util/UniqueId";
import {
  IControlDescriptor,
  IControlSerializedData,
  IDefaultControlValues,
  ISerializedPropertyBag,
  snapLayout
} from "../controls/@control";
import { buttonDescriptor } from "../controls/~Button";
import { ControlInformationViewModel, IControlInformationViewModelOwner } from "./ControlInformationViewModel";

export class LayoutViewModel implements IControlInformationViewModelOwner {

  @observable
  public controls: ControlInformationViewModel[];

  @observable
  public selectedControls: Set<ControlInformationViewModel>;

  /** Determines the grid-snap for the controls */
  public readonly gridSnap = 8;

  constructor() {
    this.controls = [];
    this.selectedControls = new Set();
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

    this.controls.push(new ControlInformationViewModel(this, descriptor, data));
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

  /**
   * Select or unselect the given control.  Tightly coupled to `ControlInformationViewModel.isSelected`
   * @param control the control to select or unselect
   * @param isSelected whether the control should be selected or unselected
   */
  @action
  public markSelected(control: ControlInformationViewModel, isSelected: boolean) {
    control.isSelected = isSelected;

    if (isSelected) {
      for (let c of this.selectedControls) {
        if (c !== control) {
          c.isSelected = false;
          this.selectedControls.delete(c);
        }
      }

      this.selectedControls.add(control);
    } else {
      this.selectedControls.delete(control);
    }
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
