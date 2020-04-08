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

  /**
   * Sets the value of the given property
   * @param element the element on which the property should be set
   * @param property the property that should be set on the instance
   * @param value the value of the property
   * @param source where value originated (undo/redo, user interaction, etc.)
   **/
  setValue(element: ControlContainer, property: IPropertyDescriptor, value: any);

  /**
   * Gets the value of the given property
   * @param element the element from which the value should be retrieved
   * @param property the property describing the value to retrieve
   * @returns the value of the given property for the instance
   **/
  getValue(element: ControlContainer, property: IPropertyDescriptor): any;
}

/**
 * Basic implementation of IControlDescriptor
 */
export abstract class BaseControlDescriptor implements IControlDescriptor {
  /** inheritdoc */
  public abstract id: string;

  /** inheritdoc */
  public abstract getProperties();

  /** inheritdoc */
  public abstract createInstance();

  /** inheritdoc */
  public setValue(element: ControlContainer, property: IPropertyDescriptor, value: any) {
    if (property instanceof GettableSettableProperty) {
      return property.setValue(element, value);
    }

    throw new Error('Property set not supported: ' + property.name);
  }

  /** inheritdoc */
  public getValue(element: ControlContainer, property: IPropertyDescriptor) {
    if (property instanceof GettableSettableProperty) {
      return property.getValue(element);
    }

    throw new Error('Property get not supported: ' + property.name);
  }
}

/**
 * Serializes the properties of the given descriptor for the control
 * @param descriptor the descriptor that determines which properties are serialized
 * @param control the control whose properties are serialized
 * @returns an object containing key-value pairs of the properties to persist
 */
export function serializeProperties(descriptor: IControlDescriptor, control: ControlContainer): { [key: string]: any } {
  let data = {};

  for (let prop of descriptor.getProperties()) {
    data[prop.name] = descriptor.getValue(control, prop);
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
  control: ControlContainer,
  data: { [key: string]: any },
) {
  if (data == null) {
    return;
  }

  for (let prop of descriptor.getProperties()) {
    let value = data[prop.name];
    if (value !== undefined) {
      descriptor.setValue(control, prop, value);
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

export enum PropertyType {
  string,
  number,
  action,
}

export interface IPropertyEditor {
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
