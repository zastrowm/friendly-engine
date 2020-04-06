import { IStoredPositionInfo } from './layout';
import { ControlContainer } from '../components/design/control-container.e';
import { UniqueId } from './util';
import { RoutedEventDescriptor } from './routedEvents';

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
  setValue(element: ControlContainer, property: IPropertyDescriptor, value: any, source?: any);

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
  public setValue(element: ControlContainer, property: IPropertyDescriptor, value: any, source?: any) {
    if (property instanceof GettableSettableProperty) {
      let ret = property.setValue(element, value, source);
      controlValueChanged.trigger(element, {
        instance: element,
        property: property,
        value: value,
        source: source,
      });
      return ret;
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

  abstract setValue(instance: ControlContainer, value: T, source?: any);
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

export interface IControlValueChangedArguments {
  instance: ControlContainer;
  value: any;
  property: IPropertyDescriptor;
  source?: any;
}

/** Updated when a control's value changes through an instance of IPropertyDescriptor */
export let controlValueChanged = new RoutedEventDescriptor<IControlValueChangedArguments>({
  id: 'controlValueChanged',
  mustBeHandled: false,
});
