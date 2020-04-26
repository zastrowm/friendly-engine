import { IStoredPositionInfo } from './layout';
import { ControlContainer } from '../components/design/control-container.e';
import { UniqueId } from './util';
import { render, ComponentChild } from 'preact';
import { setPropertyUndoRedo } from 'src/controls/editors/_shared';

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

export interface IPropertyEditor {
  elementToMount: HTMLElement;
}

interface JsxEditorRefreshArguments<T> {
  old: T;
  new: T;
  canMerge?: boolean;
}

/**
 * Base class for a property descriptor
 */
export abstract class ControlProperty<T> {
  abstract id: string;
  abstract displayName: string;

  callback: (element: any) => HTMLElement;

  constructor(callback: (element: any) => HTMLElement) {
    this.callback = callback;
  }

  public getValue(control: Control): T {
    return this.getValueRaw(this.callback(control));
  }

  public setValue(control: Control, value: T) {
    this.setValueRaw(this.callback(control), value);
  }

  protected abstract getValueRaw(e: HTMLElement): T;
  protected abstract setValueRaw(e: HTMLElement, value: T): void;

  /* inheritdoc */
  abstract getEditor(instance: ControlContainer): IPropertyEditor;

  /**
   * Creates an editor that uses JSX to provide the contents.
   * @param instance the instance for which the editor is valid
   * @param callback a callback that can be used to re-render the editor
   * @returns an IPropertyEditor that edits the given property
   */
  protected createJsxEditor(
    instance: ControlContainer,
    callback: (refreshCallback: (arg?: JsxEditorRefreshArguments<T>) => void) => ComponentChild,
  ): IPropertyEditor {
    let element = document.createElement('span');

    // callback that can be used to force JSX to re-render
    let invalidateCallback = (data?: JsxEditorRefreshArguments<T>) => {
      // if they passed in options, that means we should trigger an undo event
      if (data != null) {
        this.setValue(instance.control, data.new);

        setPropertyUndoRedo.trigger(element, {
          id: instance.uniqueId,
          property: this,
          originalValue: data.old,
          newValue: data.new,
          canMerge: data?.canMerge ?? false,
        });
      }

      // actually re-render
      let jsx = callback(invalidateCallback);
      render(jsx, element);
    };

    // first time rendering
    invalidateCallback();

    return {
      elementToMount: element,
    };
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

export abstract class Control {
  public uniqueId: UniqueId;

  public createElement(): HTMLElement {
    return this.initialize();
  }

  protected abstract initialize(): HTMLElement;
  protected target: HTMLElement | null;

  public abstract get descriptor(): IControlDescriptor<Control>;
}

let data = new Map<any, ControlProperty<any>[]>();

export function controlProperty(property: ControlProperty<any>) {
  return function (target: any, key: string) {
    let existing = data.get(target);
    if (existing == null) {
      existing = [];
      data.set(target, existing);
    }

    existing.push(property);
    // TODO define property on the class itself

    console.log('Adding property', target, key);
  };
}

export class ReflectionBasedDescriptor<T extends Control> implements IControlDescriptor<T> {
  constructor(public readonly id: string, private readonly typeDef: new () => T) {}
  getProperties(): ControlProperty<any>[] {
    return data.get(this.typeDef.prototype) ?? [];
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
