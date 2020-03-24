import { IStoredPositionInfo } from './layout';
import { ControlContainer } from '../components/design/control-container.e';
import { UniqueId } from './util';

/**
 * Holds information about the controls that can be edited via the design surface.  It is
 * intended that this can be used as a factory so that a control merely needs to query
 * what properties are available and editable for a specific control.
 */

/**
 * Defines the controls that are available to be placed + modified via the design surface
 **/
export interface IControlDescriptor {
  /** The unique id of the type of control described. */
  id: string;

  /** Creates an instance of the type of control. */
  createInstance(): HTMLElement;

  /** Gets the editable properties for the given element. */
  getProperties(): IPropertyDescriptor[];

  setValue(element: ControlContainer, property: IPropertyDescriptor, value: any);

  getValue(element: ControlContainer, property: IPropertyDescriptor): any;
}

export interface IControlSerializedProperties {}

export interface IControlSerializedData {
  id: UniqueId;
  position: IStoredPositionInfo;
  properties: { [name: string]: any };
  typeId: string;
}

export enum PropertyType {
  string,
  number,
}

interface IPropertyEditor {
  elementToMount: HTMLElement;
}

export interface IPropertyDescriptor {
  name: string;
  displayName: string;
  type: PropertyType;

  getEditor(instance: ControlContainer): IPropertyEditor;
}

export abstract class GettableSettableProperty<T> implements IPropertyDescriptor {
  constructor(public name: string, public displayName, public type: PropertyType) {}

  abstract setValue(instance: ControlContainer, value: T);
  abstract getValue(instance: ControlContainer): T;

  abstract getEditor(instance: ControlContainer): IPropertyEditor;
}

class ControlDescriptors {
  private descriptors: Map<string, IControlDescriptor> = new Map();
  private callbacks: { (): void }[] = [];

  public add(descriptor: IControlDescriptor) {
    if (this.descriptors.has(descriptor.id)) {
      throw new Error(`Descriptor with id ${descriptor.id} already exists.`);
    }

    this.descriptors.set(descriptor.id, descriptor);
    this.fireChangeListeners();
  }

  public getDescriptors(): IterableIterator<IControlDescriptor> {
    return this.descriptors.values();
  }

  public getDescriptor(type: string) {
    return this.descriptors.get(type);
  }

  public addChangeListener(callback: () => void) {
    this.callbacks.push(callback);
  }

  private fireChangeListeners() {
    for (let callback of this.callbacks) {
      callback();
    }
  }
}

export let controlDescriptors = new ControlDescriptors();
