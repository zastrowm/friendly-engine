import { ControlCollectionViewModel } from './ControlCollectionViewModel';
import { IControlDescriptor, IDefaultControlValues } from '../control-core/controlRegistry';
import { registerUndoHandler, UndoRedoQueueViewModel } from './UndoRedoQueueViewModel';
import { IControlSerializedData } from '../control-core/propertyBag';
import { ControlInformationViewModel } from './ControlInformationViewModel';
import { generateUniqueId } from '../util/UniqueId';
import { action } from 'mobx';
import { SelectedControlInformation } from './EditableControlPropertiesViewModel';
import { TextContentProperty } from "../control-core/~TextContentProperty";
import type { ISerializedPanelLayout } from "../control-core/serializedPanelLayout";

const AutoSaveLayoutName = '$autosave$';

/**
 * Data exchange format when interacting with the clipboard.
 */
export interface ICopyPasteContents {
  /** The text representation of the data **/
  text: string;
  /** The serialied json representation of the data **/
  data?: string;
}

/**
 * The methods required for any host that wants to run the EditorAppViewModel
 */
export interface IApplicationHost {
  /**
   * Copy the given data into the clipboard
   * @param data the data to copy
   */
  copyToClipboard(data: ICopyPasteContents): void;

  /**
   * True if the app should automatically save & load the layout on startup/shutdown
   */
  shouldAutoLoad: boolean;
}

export class EditorAppViewModel {
  private _host: IApplicationHost;

  public readonly controls: ControlCollectionViewModel;
  public readonly undoRedo: UndoRedoQueueViewModel;
  public readonly selectedInformation: SelectedControlInformation;

  constructor(host: IApplicationHost) {
    this._host = host;

    this.controls = new ControlCollectionViewModel();
    this.undoRedo = new UndoRedoQueueViewModel(this);
    this.selectedInformation = new SelectedControlInformation(this.controls, this.undoRedo);

    if (this._host.shouldAutoLoad) {
      this.loadLayout(AutoSaveLayoutName);
    }
  }

  @action
  public shutdown() {
    if (this._host.shouldAutoLoad) {
      this.saveLayout(AutoSaveLayoutName);
    }
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
      console.log('No layout saved');
      return;
    }

    let layoutInfo = JSON.parse(jsonLayout) as ISerializedPanelLayout;
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
          data: data,
          insertionPosition: null,
        },
      ],
    });
  }

  /**
   * Removes the currently selected controls from the canvas
   */
  @action
  public removeSelected() {
    let removedControlsInfo: IUndoAddRemoveControlInfo[] = [];
    let controlsArr = this.controls.controls;

    for (let i = 0; i < controlsArr.length; i++) {
      let controlVm = controlsArr[i];
      if (!controlVm.isSelected) {
        continue;
      }

      removedControlsInfo.push({
        descriptor: controlVm.control.descriptor,
        data: controlVm.serialize(),
        insertionPosition: i
      });
    }

    // Because we remove the root control if it was present, it's possible to end up with an empty
    // list - in that case, we don't want to add an undo entry
    if (removedControlsInfo.length > 0) {
      this.undoRedo.add(removeControlsUndoHandler, {
        controlsVm: this.controls,
        entries: removedControlsInfo
      });
    }
  }

  /**
   *  Copies teh currently selected control to the clipboard
   */
  public async copySelected() {

    let selected = this.controls.primarySelected;
    if (selected == null) {
      return;
    }

    let serialized = selected.serialize();
    let asJson = JSON.stringify(serialized);

    let descriptionText: string;
    let property = selected.control.descriptor.getPropertyOrNull<string>(TextContentProperty.id);
    if (property != null) {
      let text = property.getValue(selected.control);
      descriptionText = `${selected.control.descriptor.id}: ${text}`;
    } else {
      descriptionText = `${selected.control.descriptor.id}`;
    }

    this._host.copyToClipboard({
      text: descriptionText,
      data: asJson,
    });
  }

  /**
   *  Pastes the clipboard onto the canvas
   */
  public paste(contents: ICopyPasteContents) {
    if (contents.data == null) {
      return;
    }

    let data = JSON.parse(contents.data) as IControlSerializedData;

    let descriptor = this.controls.findDescriptor(data.typeId);
    data.id = generateUniqueId();

    this.undoRedo.add(addControlsUndoHandler, {
      controlsVm: this.controls,
      entries: [
        {
          descriptor: descriptor,
          data: data,
          insertionPosition: null,
        },
      ],
    });
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

interface IUndoAddRemoveControlInfo {
  insertionPosition: number | null;
  descriptor: IControlDescriptor;
  data: IControlSerializedData;
}

interface IUndoRemoveControlsArgs {
  controlsVm: ControlCollectionViewModel;
  entries: IUndoAddRemoveControlInfo[];
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
      lastAdded = this.controlsVm.addControl(entry.descriptor, entry.data, entry.insertionPosition);
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
