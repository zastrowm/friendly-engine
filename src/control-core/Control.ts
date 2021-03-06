import { IControlDescriptor } from './controlRegistry';
import { IStoredPositionInfo } from './layout';
import { addValue, IControlSerializedData, ISerializedPropertyBag } from './propertyBag';
import { UniqueId } from '../util/UniqueId';

/**
 * A Designer environment for a control. It is assumed
 */
export interface IControlDesigner {
  notifyLayoutChanged(control: Control): void;
}

/** Base class for all controls that can be created */
export abstract class Control {
  private _layout: IStoredPositionInfo | null = null;
  private _designer: IControlDesigner | null = null;
  private _rootElement!: HTMLElement;

  /** The id of the control */
  public id: UniqueId | null = null;

  protected setRoot(root: HTMLElement) {
    if (this._rootElement != null) {
      throw new Error('Root element has already been set');
    }

    this._rootElement = root;
    this._rootElement.setAttribute('fe-role', (this as any).descriptor.id);
  }

  protected get root(): HTMLElement {
    return this._rootElement;
  }

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
  public get htmlRoot(): HTMLElement {
    return this._rootElement;
  }

  /** The control descriptor for this control. */
  public abstract get descriptor(): IControlDescriptor<Control>;

  /**
   * Serializes the properties of the control into a data-collection
   * @returns an object containing key-value pairs of the properties to persist
   */
  public serialize(): IControlSerializedData {
    if (this.id == null) throw new Error('null id');

    return {
      id: this.id,
      typeId: this.descriptor.id,
      properties: this.serializeProperties(),
      position: this.layout,
    };
  }

  /**
   * Serializes the properties of this control into a data-collection
   * @returns an object containing key-value pairs of the properties to persist
   */
  public serializeProperties(): ISerializedPropertyBag {
    let propertyBag = {};

    for (let prop of this.descriptor.getProperties()) {
      // TODO why do we need the bang operator
      let value = prop.serializeValue!(this);
      if (value !== undefined) {
        addValue(propertyBag, prop, value);
      }
    }

    return propertyBag;
  }

  /**
   * Deserializes (previously-serialized) properties from the given data collection into the given control
   * @param data the data source from which property values are retrieved
   */
  public deserialize(data: IControlSerializedData) {
    let descriptor = this.descriptor;

    if (data.typeId !== descriptor.id) {
      throw new Error(
        `Control's descriptor ${descriptor.id} does not match the type id being deserialized ${data.typeId}`,
      );
    }

    this.deserializeProperties(data.properties);

    this.layout = data.position;
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
