import { action, observable } from "mobx";
import { UniqueId } from "../util/UniqueId";
import {
  ControlRegistry,
  IControlDescriptor,
  IControlSerializedData,
  IDefaultControlValues,
  ISerializedPropertyBag,
  snapLayout
} from "../controls/@control";
import { ControlInformationViewModel, IControlInformationViewModelOwner } from "./ControlInformationViewModel";
import { registerCommonControls, rootControlDescriptor } from "../controls/@standardControls";

/**
 * Responsible for the business logic of the canvas that allows adding/removing controls and managing layouts
 * of the controls
 */
export class ControlCollectionViewModel implements IControlInformationViewModelOwner {

  @observable
  public controls: ControlInformationViewModel[];

  @observable
  public selectedControls: Set<ControlInformationViewModel>;

  @observable
  public root: ControlInformationViewModel;

  /** Determines the grid-snap for the controls */
  public readonly gridSnap = 8;

  private readonly _controlRegistry: ControlRegistry;

  constructor() {
    this.controls = [];
    this.selectedControls = new Set();

    this._controlRegistry = new ControlRegistry();
    registerCommonControls(this._controlRegistry);

    this.root = new ControlInformationViewModel(this, rootControlDescriptor);
  }

  public get descriptors(): IControlDescriptor[]  {
    return this._controlRegistry.getDescriptors();
  }

  public findDescriptor(typeId: string) {
    return this._controlRegistry.getDescriptor(typeId);
  }

  @action
  public clearLayout() {
    this.controls.splice(0, this.controls.length);
    this.selectedControls.clear();
    this.root = new ControlInformationViewModel(this, rootControlDescriptor);
  }

  @action
  public serializeLayout(): ISavedLayoutInfo {
    return {
      controls: this.controls.map((it) => it.control.serialize()),
      root: {
        properties: this.root.control.serializeProperties(),
      },
    };
  }

  @action
  public deserializeLayout(layoutInfo: ISavedLayoutInfo) {
    this.selectedControls.clear();

    if (Array.isArray(layoutInfo)) {
      layoutInfo = {
        controls: layoutInfo as IControlSerializedData[],
        root: {
          properties: { },
        },
      };
    }

    this.controls.splice(0, this.controls.length);

    let lastControl: ControlInformationViewModel | null = null;

    for (let serialized of layoutInfo.controls) {
      let descriptor = this._controlRegistry.getDescriptor(serialized.typeId);
      lastControl = new ControlInformationViewModel(this, descriptor, serialized);
      this.controls.push(lastControl);
    }

    if (lastControl != null) {
      this.markSelected(lastControl, true);
    }

    this.root = new ControlInformationViewModel(this, rootControlDescriptor);
    let rootProperties = layoutInfo.root?.properties
    if (rootProperties != null) {
      this.root.control.deserializeProperties(rootProperties);
    }
  }

  @action
  public addControl(descriptor: IControlDescriptor, data: IControlSerializedData): ControlInformationViewModel {
    let newControl = new ControlInformationViewModel(this, descriptor, data);
    newControl.isSelected = true;
    this.controls.push(newControl);

    return newControl;
  }

  /**
   * Serializes the currently selected controls for easy deletion or copy/paste
   */
  public serializeSelected(): IControlSerializedData[] {
    return Array.from(this.selectedControls.values()).map(c => c.control.serialize());
  }

  @action
  public removeControlById(id: UniqueId) {
    let index = this.controls.findIndex(c => c.id == id);
    this.removeControlByIndex(index);
  }

  private removeControlByIndex(index: number) {
    if (index === -1) {
      return;
    }

    let control = this.controls[index];
    this.markSelected(control, false);
    this.controls.splice(index, 1);
  }

  public findControlById(id: UniqueId): ControlInformationViewModel {
    let control = this.controls.find(c => c.id === id);
    if (control == null) {
      throw new Error(`No control found with id ${id}`);
    }

    return control;
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
