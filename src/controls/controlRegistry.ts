import { Control, getControlPropertiesFor, IControlProperty, IProperty, PropertyType } from 'src/controls/Control';
import { layoutProperty } from './properties/@commonProperties';

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
  getProperties(): IControlProperty[];

  /** Gets a property with the given name */
  getProperty<T>(id: string): IControlProperty<T>;
}

/**
 * Collection of controls that can be active on a given canvas.
 */
export class ControlRegistry {
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
    var descriptor = this.descriptors.get(type);
    if (descriptor == null) {
      throw new Error(`No descriptor found with id=${type}`);
    }
    return descriptor;
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

/** Options that configure how ReflectionBasedDescriptor operates */
interface ReflectionBasedOptions {
  supportsMovement?: boolean;
}

/** The default options for ReflectionBasedDescriptor */
let defaultOptions: Required<ReflectionBasedOptions> = {
  supportsMovement: true,
};

/**
 * Returns the descriptors that have been registered to a Control via @implementProperty
 */
export class ReflectionBasedDescriptor<T extends Control> implements IControlDescriptor<T> {
  private readonly _properties: IProperty<Control, any>[];

  constructor(
    public readonly id: string,
    private readonly typeDef: new () => T,
    options: ReflectionBasedOptions = defaultOptions,
  ) {
    this._properties = getControlPropertiesFor(this.typeDef.prototype) ?? [];

    if (options.supportsMovement) {
      this._properties.splice(0, 0, layoutProperty);
    }
  }

  getProperties(): IControlProperty[] {
    return this._properties;
  }

  public createInstance(): T {
    return new this.typeDef();
  }

  public getProperty<T>(id: string): IControlProperty<T> {
    for (let prop of this.getProperties()) {
      if (prop.id == id) {
        return prop;
      }
    }

    return null;
  }
}
