import { IStoredPositionInfo } from './layout';
import { ControlContainer } from '../components/design/control-container.e';
import { UniqueId } from './util';
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

/**
 * Serializes the properties of the given descriptor for the control
 * @param descriptor the descriptor that determines which properties are serialized
 * @param control the control whose properties are serialized
 * @returns an object containing key-value pairs of the properties to persist
 */
export function serializeProperties(
  descriptor: IControlDescriptor,
  container: ControlContainer,
): { [key: string]: any } {
  let data = {};

  for (let prop of descriptor.getProperties()) {
    data[prop.id] = prop.getValue(container.control);
  }

  return data;
}

/**
 * Deserializes (previously-serialized) properties from the given data collection into the given control
 * @param descriptor the descriptor that determines which properties are deserialized
 * @param control the control whose properties are deserialized
 * @param data the data source from which property values are retrieved
 */
export function deserializeProperties(
  descriptor: IControlDescriptor,
  container: ControlContainer,
  data: { [key: string]: any },
) {
  if (data == null) {
    return;
  }

  for (let prop of descriptor.getProperties()) {
    let value = data[prop.id];
    console.log(prop.id, value, prop);
    if (value !== undefined) {
      prop.setValue(container.control, value);
    }
  }
}

export interface IControlSerializedProperties {}

export interface IControlSerializedData {
  id: UniqueId;
  position: IStoredPositionInfo;
  properties: { [name: string]: any };
  typeId: string;
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
