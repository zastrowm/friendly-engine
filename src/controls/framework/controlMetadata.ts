/**
 * Holds information about the controls that can be edited via the design surface.  It is
 * intended that this can be used as a factory so that a control merely needs to query
 * what properties are available and editable for a specific control.
 */

import { Control } from '../Control';

/**
 * A property that represents a value that can be get/set on a control.
 */
export interface IControlProperty<T> {
  /* The id of the property */
  id: string;

  /* This human-readable name of the property */
  displayName: string;

  /* Gets the value from the control */
  getValue(control: Control): T;

  /* Sets the value for control */
  setValue(control: Control, value: T);
}

/**
 * Defines the properties that are attached to a control + modified via the design surface
 **/
export interface IControlDescriptor<T extends Control = Control> {
  /** The unique id of the type of control described. */
  id: string;

  /** Creates an instance of the type of control. */
  createInstance(): T;

  /** Gets the editable properties for the given element. */
  getProperties(): IControlProperty<any>[];

  /** Gets a property with the given name */
  getProperty<T>(id: string): IControlProperty<T>;
}

/**
 * Holds one or more instances of IControlDescriptor and provides lookup methods
 */
export class ControlDescriptorCollection {
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
