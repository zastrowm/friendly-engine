import { IControlDescriptor } from 'src/framework/controlsRegistry';
import { IStoredPositionInfo } from 'src/framework/layout';
import { UniqueId } from 'src/framework/util';

export * from './controlProperties';

/**
 * A Designer environment for a control. It is assumed
 */
export interface IControlDesigner {
  notifyLayoutChanged(control: Control): void;
}

export interface ISerializedPropertyBag {
  [key: string]: any;
}

/** The serialized representation of a control */
export interface IControlSerializedData {
  id: UniqueId;
  position: IStoredPositionInfo;
  properties: ISerializedPropertyBag;
  typeId: string;
}

/** Base class for all controls that can be created */
export abstract class Control {
  private _layout: IStoredPositionInfo = null;
  private _designer: IControlDesigner = null;
  private _rootElement: HTMLElement;

  constructor() {
    this._rootElement = this.initialize();
  }

  /** The id of the control */
  public id: UniqueId = null;

  public get layout(): IStoredPositionInfo {
    return this._layout ?? { left: 0, top: 0, width: 100, height: 20 };
  }

  public set layout(value: IStoredPositionInfo) {
    this._layout = value;
    this._designer?.notifyLayoutChanged(this);
  }

  /**
   * Creates the DOM elements for this control.
   */
  public createElement(): HTMLElement {
    return this._rootElement;
  }

  /** Initializes the DOM elements for this control and returns it. */
  protected abstract initialize(): HTMLElement;

  /** The control descriptor for this control. */
  public abstract get descriptor(): IControlDescriptor<Control>;

  /**
   * Serializes the properties of the control into a data-collection
   * @returns an object containing key-value pairs of the properties to persist
   */
  public serialize(): IControlSerializedData {
    let propertyBag = {};

    for (let prop of this.descriptor.getProperties()) {
      if (!prop.hasDefaultValue(this)) {
        propertyBag[prop.id] = prop.getValue(this);
      }
    }

    return {
      id: this.id,
      typeId: this.descriptor.id,
      properties: propertyBag,
      position: this.layout,
    };
  }

  /**
   * Deserializes (previously-serialized) properties from the given data collection into the given control
   * @param data the data source from which property values are retrieved
   */
  public deserialize(data: IControlSerializedData) {
    let descriptor = this.descriptor;

    if (data.typeId != descriptor.id) {
      throw new Error(
        `Control's descriptor ${descriptor.id} does not match the type id being deserialized ${data.typeId}`,
      );
    }

    // loop through the serialized properties and restore them
    for (let key in data.properties) {
      let property = descriptor.getProperty(key);
      if (property != null) {
        let value = data.properties[key];
        property.setValue(this, value);
      }
    }

    this.layout = data.position;
    this.id = data.id;
  }
}

/** Gets the container element that hosts the control */
export function setControlDesigner(control: Control, owner: IControlDesigner) {
  (control as any)._designer = owner;
}

/** Sets the container element that hosts the control */
export function getControlDesigner(control: Control): IControlDesigner {
  return (control as any)._designer;
}
