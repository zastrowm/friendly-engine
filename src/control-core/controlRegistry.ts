import { IStoredPositionInfo } from './layout';
import { LocalizedString } from '../util/localization';
import { Control } from './Control';
import { getControlPropertiesFor, IControlProperty, TextContentId } from './controlProperties';
import { addValue, ISerializedPropertyBag, tryGetValue } from './propertyBag';
import { action, observable } from 'mobx';

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

  /** Gets a property with the given name */
  getProperty<T>(id: string): IControlProperty<T>;

  /** Gets the default control properties if none are provided */
  getDefaultValues(): IDefaultControlValues;
}

/** The default values to use when constructing a new control */
export interface IDefaultControlValues {
  /** The position of the control */
  position?: IStoredPositionInfo;
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

/**
 * Creates an instance of IControlDescriptor based on information provided by the @implementProperty decorator
 * on a control
 */
export class ReflectionBasedDescriptor<T extends Control> implements IControlDescriptor<T> {
  constructor(
    public readonly id: string,
    public readonly displayName: LocalizedString,
    private readonly typeDef: new () => T,
    private readonly defaultValuesCreator?: () => IDefaultControlValues,
  ) {}

  public getProperties(): IControlProperty[] {
    return getControlPropertiesFor(this.typeDef.prototype) ?? [];
  }

  public createInstance(): T {
    return new this.typeDef();
  }

  public getDefaultValues(): Required<IDefaultControlValues> {
    let defaultValues = this.defaultValuesCreator?.() ?? {};

    let properties = defaultValues?.properties ?? {};
    let position = defaultValues?.position ?? {};

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
    for (let prop of this.getProperties()) {
      if (prop.id === id) {
        return prop;
      }
    }

    throw new Error(`Property with id ${id} does not exist`);
  }
}
