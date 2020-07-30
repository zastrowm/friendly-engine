import { action, computed, observable } from "mobx";
import { generateUniqueId } from "../util/UniqueId";
import {
  Control,
  ControlRegistry,
  IControlDescriptor,
  IControlSerializedData,
  IDefaultControlValues,
  ISerializedPropertyBag,
  snapLayout
} from "../controls/@control";
import { buttonDescriptor } from "../controls/~Button";
import { ControlInformationViewModel, IControlInformationViewModelOwner } from "./ControlInformationViewModel";
import { registerCommonControls, rootControlDescriptor } from "../controls/@standardControls";

/**
 * Responsible for the business logic of the canvas that allows adding/removing controls and managing layouts
 * of the controls
 */
export class LayoutViewModel implements IControlInformationViewModelOwner {

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

  @action("clear layout")
  public clearLayout() {
    this.controls.splice(0, this.controls.length);
    this.selectedControls.clear();
    this.root = new ControlInformationViewModel(this, rootControlDescriptor);
  }

  /** Saves the current control layout to LocalStorage */
  @action("save layout")
  public saveLayout(layoutName: string) {
    let data: ISavedLayoutInfo = {
      controls: this.controls.map((it) => it.control.serialize()),
      root: {
        properties: this.root.control.serializeProperties(),
      },
    };
    let json = JSON.stringify(data);

    window.localStorage.setItem(`layout_${layoutName}`, json);
  }

  /** Restores the previously-saved control layout from LocalStorage */
  @action("load layout")
  public loadLayout(layoutName: string) {
    console.log('loading layout', layoutName);
    this.selectedControls.clear();

    let jsonLayout = window.localStorage.getItem(`layout_${layoutName}`);
    if (jsonLayout == null) {
      alert('No layout saved');
      return;
    }

    let layoutInfo = JSON.parse(jsonLayout) as ISavedLayoutInfo;

    if (Array.isArray(layoutInfo)) {
      layoutInfo = {
        controls: layoutInfo as IControlSerializedData[],
        root: {
          properties: { },
        },
      };
    }

    this.controls.splice(0, this.controls.length);
    //this.undoRedoQueue.clear();

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

  @action("add control")
  public addControl(descriptor: IControlDescriptor, defaultValues?: IDefaultControlValues)
    : ControlInformationViewModel {
    let normalizedDefaults = LayoutViewModel.createInitialValues(descriptor, defaultValues);

    // TODO copy the data
    let data: IControlSerializedData = {
      id: generateUniqueId(),
      typeId: descriptor.id,
      position: normalizedDefaults.position,
      properties: normalizedDefaults.properties,
    };

    snapLayout(data.position, this.gridSnap);

    //
    // addControlsUndoHandler.trigger(this, {
    //   entries: [
    //     {
    //       descriptor: descriptor,
    //       data,
    //     },
    //   ],
    // });

    let newControl = new ControlInformationViewModel(this, descriptor, data);
    newControl.isSelected = true;
    this.controls.push(newControl);

    return newControl;
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
   * Removes the currently selected controls from the canvas
   */
  @action
  public removeSelected() {
    for (let control of this.selectedControls) {
      let index = this.controls.indexOf(control);
      if (index != null) {
        this.controls.splice(index, 1);
      }
    }

    this.selectedControls.clear();
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
