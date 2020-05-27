import type { Control } from './Control';

let data = new Map<any, IProperty<Control, any>[]>();

type LocalizedString = string;

/**
 * Defines the raw type of properties that are allowed to be configured
 */
export enum PropertyType {
  unknown,
  string = 1 << 1,
  number = 1 << 2,
  enum = 1 << 3,
  boolean = 1 << 4,
  color = 1 << 5,
  script = 1 << 6,
}

/**
 * Typescript Decorator which allows specifying a property to be defined in such a way that the html-element
 * retrieved via `callback` is passed into `property` for all operations
 * @param property the html-based property that should be delegated to
 * @param callback a callback which retrieves an HtmlElement from the control
 */
export function implementProperty<TOwner extends Control, TPropertyType>(
  property: IProperty<HTMLElement, TPropertyType>,
  callback: (element: TOwner) => HTMLElement,
) {
  return function (target: any, propertyKey: string) {
    let existing = data.get(target);
    if (existing == null) {
      existing = [];
      data.set(target, existing);
    }

    existing.push(new DelegatedControlProperty(property, callback));

    Object.defineProperty(target, propertyKey, {
      get: function () {
        return property.getValue(this);
      },

      set: function (value) {
        property.setValue(this, value);
      },
    });
  };
}

export function getControlPropertiesFor(controlConstructor: any) {
  return data.get(controlConstructor);
}

/**
 * Non-generic information about a property.  If typed, `IProperty` is more useful
 */
export interface IPropertyInfo {
  /** An id of the property that must be unique across the class that contains the property. */
  id: string;
  /** A human readable description of the property */
  displayName: LocalizedString;
  /** The type of the property*/
  propertyType: PropertyType;
}

/**
 * A property whose value can be gotten and set on a given instance of a given class.
 */
export interface IProperty<TOwner, TPropertyType> extends IPropertyInfo {
  /** Gets the value from the instance */
  getValue(owner: TOwner): TPropertyType;
  /** Sets the value on the instance */
  setValue(owner: TOwner, value: TPropertyType);
  /** Serializes the value from the instance - may returned undefined */
  serializeValue?: (data: TOwner) => TPropertyType;
}

/**
 * Simple Type alias for IProperty<Control, T>
 */
export interface IControlProperty<T = any> extends IProperty<Control, T> {}

/**
 * Implementation of IProperty<Control, T> which takes in an IProperty<HtmlElement, T> and uses a callback to
 * get the corresponding callback
 */
class DelegatedControlProperty<T> implements Required<IProperty<Control, T>> {
  constructor(private property: IProperty<HTMLElement, T>, private callback: (element: Control) => HTMLElement) {}

  public get id() {
    return this.property.id;
  }

  public get displayName() {
    return this.property.displayName;
  }

  public getValue(control: Control): T {
    let htmlElement = this.callback(control);
    return this.property.getValue(htmlElement);
  }

  public setValue(control: Control, value: T) {
    let htmlElement = this.callback(control);
    this.property.setValue(htmlElement, value);
  }

  public get propertyType(): PropertyType {
    return this.property.propertyType;
  }

  public serializeValue(control: Control): T {
    let htmlElement = this.callback(control);

    if (this.property.serializeValue != null) {
      return this.property.serializeValue(htmlElement);
    } else {
      return this.getValue(control);
    }
  }
}
