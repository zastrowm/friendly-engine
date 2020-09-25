import { LocalizedString } from '../util/localization';
import { Control } from './Control';
import { getControlPropertiesFor, IControlProperty, IProperty, TextContentId } from './controlProperties';
import { addValue, ISerializedPropertyBag, tryGetValue } from './propertyBag';
import { action, observable } from 'mobx';
import { PositionProperty } from "./~PositionProperty";

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

  /** The human readable name of the control **/
  displayName: LocalizedString;

  /** Creates an instance of the type of control. */
  createInstance(): T;

  /** Gets the editable properties for the given element. */
  getProperties(): IControlProperty[];

  /** Gets a property with the given name, throwing an exception if it does not exist. */
  getProperty<T>(id: string): IControlProperty<T>;

  /** Gets a property with the given name, returning null if it does not exist */
  getPropertyOrNull<T>(id: string): IControlProperty<T> | null;

  /** Gets the default control properties if none are provided */
  getDefaultValues(): IDefaultControlValues;
}

/** The default values to use when constructing a new control */
export interface IDefaultControlValues {
  /** The position of the control */
  position?: { width: number, height: number };
  /** The properties for the control */
  properties?: ISerializedPropertyBag;
}

/**
 * Collection of controls that can be active on a given canvas.
 */
export class ControlRegistry {
  @observable
  private descriptors: Map<string, IControlDescriptor> = new Map();

  @action
  public add(descriptor: IControlDescriptor) {
    if (this.descriptors.has(descriptor.id)) {
      throw new Error(`Descriptor with id ${descriptor.id} already exists.`);
    }

    this.descriptors.set(descriptor.id, descriptor);
  }

  public getDescriptors(): IControlDescriptor[] {
    return Array.from(this.descriptors.values());
  }

  public getDescriptor(type: string) {
    var descriptor = this.descriptors.get(type);
    if (descriptor == null) {
      throw new Error(`No descriptor found with id=${type}`);
    }
    return descriptor;
  }
}

/** Options that configure how ReflectionBasedDescriptor operates */
interface ReflectionBasedOptions {
  supportsMovement?: boolean;
}

/** The default options for ReflectionBasedDescriptor */
let defaultOptions: Required<ReflectionBasedOptions> = {
  supportsMovement: true,
};

/**
 * Creates an instance of IControlDescriptor based on information provided by the @implementProperty decorator
 * on a control
 */
export class ReflectionBasedDescriptor<T extends Control> implements IControlDescriptor<T> {
  private readonly _properties: IProperty<Control, any>[];

  constructor(
    public readonly id: string,
    public readonly displayName: LocalizedString,
    private readonly typeDef: new () => T,
    private readonly defaultValuesCreator?: () => IDefaultControlValues,
    private options: ReflectionBasedOptions = defaultOptions,
  ) {
    this._properties = getControlPropertiesFor(this.typeDef.prototype) ?? [];

    if (options.supportsMovement) {
      this._properties.splice(0, 0, PositionProperty);
    }
  }

  public getProperties(): IControlProperty[] {
    return this._properties;
  }

  public createInstance(): T {
    return new this.typeDef();
  }

  public getDefaultValues(): IDefaultControlValues {
    let defaultValues = this.defaultValuesCreator?.() ?? {};

    let properties = defaultValues?.properties ?? {};
    let position = defaultValues?.position;

    let textId = TextContentId;
    let textProperty = this.getProperty<string>(textId);
    if (textProperty != null && tryGetValue(properties, textProperty) === undefined) {
      addValue(properties, textProperty, `${this.displayName}`);
    }

    return {
      properties,
      position,
    };
  }

  public getProperty<T>(id: string): IControlProperty<T> {
    let property = this.getPropertyOrNull<T>(id);
    if (property != null) {
      return property;
    }

    throw new Error(`Property with id ${id} does not exist`);
  }

  public getPropertyOrNull<T>(id: string): IControlProperty<T> | null {
    for (let prop of this.getProperties()) {
      if (prop.id === id) {
        return prop;
      }
    }

    return null;
  }
}
