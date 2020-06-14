import { IControlDescriptor } from './controlRegistry';
import { IStoredPositionInfo } from 'src/framework/layout';
import { UniqueId } from 'src/framework/util';
import { ControlPositioning } from './ControlPositioning';

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
  private readonly _rootElement: HTMLElement;
  private readonly _positioning: ControlPositioning;

  constructor() {
    this._positioning = new ControlPositioning(this);

    this._rootElement = this.initialize();
    this._rootElement.setAttribute('fe-role', (this as any).descriptor.id);
  }

  /** The id of the control */
  public id: UniqueId = null;

  public get position(): ControlPositioning {
    return this._positioning;
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
    return {
      id: this.id,
      typeId: this.descriptor.id,
      properties: this.serializeProperties(),
      position: this.position.layout,
    };
  }

  /**
   * Serializes the properties of this control into a data-collection
   * @returns an object containing key-value pairs of the properties to persist
   */
  public serializeProperties(): ISerializedPropertyBag {
    let propertyBag = {};

    for (let prop of this.descriptor.getProperties()) {
      propertyBag[prop.id] = prop.serializeValue(this);
    }

    return propertyBag;
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

    this.deserializeProperties(data.properties);

    this.position.update(data.position);
    this.id = data.id;
  }

  /**
   * Deserializes the given properties
   */
  public deserializeProperties(properties: ISerializedPropertyBag) {
    if (properties == null) {
      return;
    }

    for (let key in properties) {
      // noinspection JSUnfilteredForInLoop
      let property = this.descriptor.getProperty(key);
      if (property != null) {
        // noinspection JSUnfilteredForInLoop
        let value = properties[key];
        property.setValue(this, value);
      }
    }
  }
}

/** Gets the container element that hosts the control */
export function setControlDesigner(control: Control, owner: IControlDesigner) {
  control.position['_designer'] = owner;
}

/** Sets the container element that hosts the control */
export function getControlDesigner(control: Control): IControlDesigner {
  return control.position['_designer'];
}
