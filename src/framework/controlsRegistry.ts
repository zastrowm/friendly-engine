import { IStoredPositionInfo } from "./layout";

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

  setValue(element: HTMLElement, property: IPropertyDescriptor, value: any);

  getValue(element: HTMLElement, property: IPropertyDescriptor): any;
}

export interface IControlSerializedProperties {}

export interface IControlSerializedData {
  id: string;
  position: IStoredPositionInfo;
  properties: { [name: string]: any };
  typeId: string;
}

enum PropertyType {
  string,
  number
}

interface IPropertyDescriptor {
  name: string;
  type: PropertyType;
}

abstract class GettableSettableProperty<T> implements IPropertyDescriptor {
  constructor(public name: string, public type: PropertyType) {}

  abstract setValue(instance: HTMLElement, value: T);
  abstract getValue(instance: HTMLElement): T;
}

class TextContentProperty extends GettableSettableProperty<string> {
  setValue(instance: HTMLElement, value: string) {
    instance.textContent = value;
  }
  getValue(instance: HTMLElement): string {
    return instance.textContent;
  }
  constructor() {
    super("text", PropertyType.string);
  }
}

class ButtonDescriptor implements IControlDescriptor {
  public id = "button";

  private static properties = [new TextContentProperty()];

  public createInstance(): HTMLElement {
    return document.createElement("button");
  }

  public getProperties() {
    return ButtonDescriptor.properties;
  }

  setValue(element: HTMLElement, property: IPropertyDescriptor, value: any) {
    if (property instanceof GettableSettableProperty) {
      return property.setValue(element, value);
    }

    throw new Error("Property set not supported: " + property.name);
  }

  getValue(element: HTMLElement, property: IPropertyDescriptor) {
    if (property instanceof GettableSettableProperty) {
      return property.getValue(element);
    }

    throw new Error("Property get not supported: " + property.name);
  }
}

class LabelDescriptor implements IControlDescriptor {
  public id = "label";

  private static properties = [new TextContentProperty()];

  public createInstance(): HTMLElement {
    return document.createElement("div");
  }

  public getProperties() {
    return LabelDescriptor.properties;
  }

  setValue(element: HTMLElement, property: IPropertyDescriptor, value: any) {
    if (property instanceof GettableSettableProperty) {
      return property.setValue(element, value);
    }

    throw new Error("Property set not supported: " + property.name);
  }

  getValue(element: HTMLElement, property: IPropertyDescriptor) {
    if (property instanceof GettableSettableProperty) {
      return property.getValue(element);
    }

    throw new Error("Property get not supported: " + property.name);
  }
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
controlDescriptors.add(new ButtonDescriptor());
controlDescriptors.add(new LabelDescriptor());
