import { IControlProperty } from '../control-core/controlProperties';
import { ControlInformationViewModel } from './ControlInformationViewModel';
import { createAtom, IAtom, computed, action } from 'mobx';
import { registerUndoHandler, UndoRedoQueueViewModel } from './UndoRedoQueueViewModel';
import { UniqueId } from '../util/UniqueId';
import { ControlCollectionViewModel } from './ControlCollectionViewModel';

export class SelectedControlInformation {
  constructor(private _controls: ControlCollectionViewModel, private _undoRedoQueue: UndoRedoQueueViewModel) {}

  @computed
  public get selectedControl(): ControlInformationViewModel {
    for (let control of this._controls.selectedControls) {
      return control;
    }

    return this._controls.root;
  }

  @computed
  public get properties(): EditablePropertyViewModel<any>[] {
    let properties: EditablePropertyViewModel<any>[] = [];

    let selected = this.selectedControl;

    // we check *isAttached* so that this auto refreshes once the selected control attaches. See the comment on
    // isAttached for why this is important
    if (selected.isAttached) {
      for (let property of selected.control.descriptor.getProperties()) {
        properties.push(new EditablePropertyViewModel<any>(this, property));
      }
    }

    return properties;
  }

  public getValue(property: EditablePropertyViewModel<any>) {
    property.valueAtom.reportObserved();
    return property.property.getValue(this.selectedControl.control);
  }

  @action
  public setValue(property: EditablePropertyViewModel<any>, value: any, options?: IPropertySetOptions) {
    let oldValue = this.getValue(property);
    if (oldValue === value) {
      return;
    }

    property.property.setValue(this.selectedControl.control, value);
    property.valueAtom.reportChanged();

    this._undoRedoQueue.add(setPropertyUndoRedo, {
      controls: this._controls,
      id: this.selectedControl.id,
      newValue: value,
      originalValue: oldValue,
      property: property.property,
      options: options,
    });
  }
}

interface IEditablePropertyViewModel<T> {
  value: T;
  updateValue(value: T): void;
}

export class EditablePropertyViewModel<T> implements IEditablePropertyViewModel<T> {
  public valueAtom: IAtom;

  constructor(public readonly owner: SelectedControlInformation, public readonly property: IControlProperty) {
    this.valueAtom = createAtom('property value');
  }

  @computed
  public get value(): T {
    this.valueAtom.reportObserved();
    return this.owner.getValue(this);
  }

  public set value(value: T) {
    this.updateValue(value);
  }

  public updateValue(value: T, options: IPropertySetOptions | null = null) {
    this.owner.setValue(this, value, options ?? {});
    this.valueAtom.reportChanged();
  }
}

interface ISetPropertyUndoArgs {
  controls: ControlCollectionViewModel;
  id: UniqueId;
  property: IControlProperty;
  originalValue: any;
  newValue: any;
  /*focusCount?: FocusCount;*/
  options: IPropertySetOptions;
}

export interface IPropertySetOptions {
  canMerge?: boolean;
}

export let setPropertyUndoRedo = registerUndoHandler<ISetPropertyUndoArgs>('setProperty', () => ({
  // initialize() {
  //   if (this.focusCount == null) {
  //     this.focusCount = getFocusCount();
  //   }
  // },

  undo() {
    let control = this.controls.findControlById(this.id);
    this.property.setValue(control.control, this.originalValue);
    control.isSelected = true;
  },

  redo() {
    let control = this.controls.findControlById(this.id);
    this.property.setValue(control.control, this.newValue);
    control.isSelected = true;
  },

  tryMerge(rhs: ISetPropertyUndoArgs) {
    if (this.options.canMerge !== true) {
      return false;
    }

    let shouldMerge =
      /*this.focusCount == rhs.focusCount &&*/
      this.property === rhs.property &&
      this.dateInfo.isLastModifiedWithinMs(3000) &&
      this.dateInfo.isOriginalCreationWithinMs(5000);

    if (!shouldMerge) {
      return false;
    }

    this.newValue = rhs.newValue;
    return true;
  },
}));
