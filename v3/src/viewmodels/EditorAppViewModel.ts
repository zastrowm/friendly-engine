import { ControlCollectionViewModel, ISavedLayoutInfo } from "./ControlCollectionViewModel";
import { IControlDescriptor, IDefaultControlValues } from "../control-core/controlRegistry";
import { registerUndoHandler, UndoRedoQueueViewModel } from "./UndoRedoQueueViewModel";
import { IControlSerializedData } from "../control-core/propertyBag";
import { ControlInformationViewModel } from "./ControlInformationViewModel";
import { generateUniqueId } from "../util/UniqueId";
import { action } from "mobx";


export class EditorAppViewModel {

  public readonly controls: ControlCollectionViewModel;
  public readonly undoRedo: UndoRedoQueueViewModel;

  constructor() {
    this.controls = new ControlCollectionViewModel();
    this.undoRedo = new UndoRedoQueueViewModel(this);
  }

  @action
  public undo() {
    this.undoRedo.undo();
  }

  @action
  public redo() {
    this.undoRedo.redo();
  }

  /** Restores the previously-saved control layout from LocalStorage */
  @action
  public loadLayout(layoutName: string) {
    console.log('loading layout', layoutName);

    let jsonLayout = window.localStorage.getItem(`layout_${layoutName}`);
    if (jsonLayout == null) {
      alert('No layout saved');
      return;
    }

    let layoutInfo = JSON.parse(jsonLayout) as ISavedLayoutInfo;
    this.controls.deserializeLayout(layoutInfo);
    this.undoRedo.clear();
  }

  @action
  public saveLayout(layoutName: string) {
    let data = this.controls.serializeLayout();
    let json = JSON.stringify(data);

    window.localStorage.setItem(`layout_${layoutName}`, json);
  }

  @action
  public clearLayout() {
    this.controls.clearLayout();
  }

  @action
  public addControl(descriptor: IControlDescriptor) {

    let normalizedDefaults = EditorAppViewModel.createInitialValues(descriptor);

    // TODO copy the data
    let data: IControlSerializedData = {
      id: generateUniqueId(),
      typeId: descriptor.id,
      position: normalizedDefaults.position,
      properties: normalizedDefaults.properties,
    };

    this.undoRedo.add(addControlsUndoHandler, {
      controlsVm: this.controls,
      entries: [
        {
          descriptor: descriptor,
          data: data
        }
      ]
    })
  }

  /**
   * Removes the currently selected controls from the canvas
   */
  @action
  public removeSelected() {
    let serializedControlData = this.controls.serializeSelected();

    // Because we remove the root control if it was present, it's possible to end up with an empty list - in that
    // case, we don't want to add an undo entry
    if (serializedControlData.length > 0) {
      this.undoRedo.add(removeControlsUndoHandler, {
        controlsVm: this.controls,
        entries: serializedControlData.map(s => ({
            descriptor: this.controls.findDescriptor(s.typeId),
            data: s
          }))
      });
    }
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

interface IUndoRemoveControlsArgs {
  controlsVm: ControlCollectionViewModel,
  entries: {
    descriptor: IControlDescriptor;
    data: IControlSerializedData;
  }[];
}

let addControlsUndoHandler = registerUndoHandler<IUndoRemoveControlsArgs>('addControls', () => ({
  do() {
    this.redo();
  },

  undo() {
    for (let entry of this.entries) {
      this.controlsVm.removeControlById(entry.data.id);
    }
  },

  redo() {
    let lastAdded: ControlInformationViewModel | null = null;

    for (let entry of this.entries) {
      lastAdded = this.controlsVm.addControl(entry.descriptor, entry.data);
    }

    if (lastAdded != null) {
      lastAdded.isSelected = true;
    }
  },
}));

let removeControlsUndoHandler = registerUndoHandler<IUndoRemoveControlsArgs>('removeControls', () => ({
  do() {
    this.redo();
  },

  undo() {
    let lastAdded: ControlInformationViewModel | null = null;

    for (let entry of this.entries) {
      lastAdded = this.controlsVm.addControl(entry.descriptor, entry.data);
    }

    if (lastAdded != null) {
      lastAdded.isSelected = true;
    }
  },

  redo() {
    for (let entry of this.entries) {
      this.controlsVm.removeControlById(entry.data.id);
    }
  },
}));
