import { Control, ControlProperty, getControlPropertiesFor } from 'src/controls/Control';

/**
 * Holds information about the controls that can be edited via the design surface.  It is
 * intended that this can be used as a factory so that a control merely needs to query
 * what properties are available and editable for a specific control.
 */

/**
 * Defines the controls that are available to be placed + modified via the design surface
 **/
export interface IControlDescriptor<T extends Control = Control> {
  /** The unique id of the type of control described. */
  id: string;

  /** Creates an instance of the type of control. */
  createInstance(): T;

  /** Gets the editable properties for the given element. */
  getProperties(): ControlProperty<any>[];

  /** Gets a property with the given name */
  getProperty<T>(id: string): ControlProperty<T>;
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

export class ReflectionBasedDescriptor<T extends Control> implements IControlDescriptor<T> {
  constructor(public readonly id: string, private readonly typeDef: new () => T) {}
  getProperties(): ControlProperty<any>[] {
    return getControlPropertiesFor(this.typeDef.prototype) ?? [];
  }

  public createInstance(): T {
    return new this.typeDef();
  }

  public getProperty<T>(id: string): ControlProperty<T> {
    for (let prop of this.getProperties()) {
      if (prop.id == id) {
        return prop;
      }
    }

    return null;
  }
}

export let controlDescriptors = new ControlDescriptors();
