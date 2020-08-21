import { action, computed, observable } from 'mobx';
import { UniqueId } from '../util/UniqueId';
import {
  ControlRegistry,
  IControlDescriptor,
  IControlSerializedData,
  ISerializedPropertyBag,
} from '../controls/@control';
import { ControlInformationViewModel, IControlInformationViewModelOwner } from './ControlInformationViewModel';
import { registerCommonControls, RootControl } from '../controls/@standardControls';
import { RootControlInformationViewModel } from './RootControlInformationViewModel';

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

    this.root = new RootControlInformationViewModel(this);
  }

  public get descriptors(): IControlDescriptor[] {
    return this._controlRegistry.getDescriptors();
  }

  public findDescriptor(typeId: string) {
    return this._controlRegistry.getDescriptor(typeId);
  }

  @computed
  public get primarySelected(): ControlInformationViewModel | null {
    // noinspection LoopStatementThatDoesntLoopJS
    for (let control of this.selectedControls) {
      return control;
    }

    return null;
  }

  @action
  public clearLayout() {
    this.controls.splice(0, this.controls.length);
    this.selectedControls.clear();
    this.root = new RootControlInformationViewModel(this);
  }

  @action
  public serializeLayout(): ISavedLayoutInfo {

    return {
      controls: this.controls.map((it) => it.serialize()),
      root: {
        properties: this.root.control.serializeProperties(),
      },
      selected: this.primarySelected?.id ?? null,
    };
  }

  @action
  public deserializeLayout(layoutInfo: ISavedLayoutInfo) {
    this.selectedControls.clear();

    if (Array.isArray(layoutInfo)) {
      layoutInfo = {
        controls: layoutInfo as IControlSerializedData[],
        root: {
          properties: {},
        },
        selected: null,
      };
    }

    this.controls.splice(0, this.controls.length);

    let lastControl: ControlInformationViewModel | null = null;

    for (let serialized of layoutInfo.controls) {
      let descriptor = this._controlRegistry.getDescriptor(serialized.typeId);
      lastControl = new ControlInformationViewModel(this, descriptor, serialized);
      this.controls.push(lastControl);
    }

    if (layoutInfo.selected != null) {
      this.markSelected(this.findControlById(layoutInfo.selected), true);
    } else if (lastControl != null) {
      this.markSelected(lastControl, true);
    }

    this.root = new RootControlInformationViewModel(this, layoutInfo.root?.properties);
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
    return Array.from(this.selectedControls.values()).map((c) => c.serialize());
  }

  @action
  public removeControlById(id: UniqueId) {
    let index = this.controls.findIndex((c) => c.id === id);
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
    if (id === RootControl.rootId) {
      return this.root;
    }

    let control = this.controls.find((c) => c.id === id);
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
    if (control === this.root) {
      return;
    }

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

  @action
  public clearSelection() {
    for (let c of this.selectedControls) {
      c.isSelected = false;
      this.selectedControls.delete(c);
    }
  }
}

export interface ISavedLayoutInfo {
  root: {
    properties: ISerializedPropertyBag;
  };
  controls: IControlSerializedData[];
  selected: UniqueId | null;
}
