import type { Control } from './Control';
import { LocalizedString } from '@/framework/localization';
import { IEnumValue } from '@/framework/Enums';

let data = new Map<any, IProperty<Control, any>[]>();

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
  return function <T extends Control>(target: T, propertyKey: string) {
    let existing = data.get(target);
    if (existing == null) {
      existing = [];
      data.set(target, existing);
    }

    existing.push(createProxyFor(property, callback) as any);

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

// Create a proxy that takes the property that goes from  HtmlElement -> Value and expose an interface
// that is a property that goes from Owner -> value and delegates back to the original for everything except
// setValue/getValue.
// This maintains "this" semantics in the original property yet allows us to provide the wrapped set/get methods.
function createProxyFor<TOwner extends Control, TPropertyType>(
  property: IProperty<HTMLElement, TPropertyType>,
  callback: (element: TOwner) => HTMLElement,
) {
  let proxyData = {
    __callback: callback,
    __property: property,
    getValue: function (target: TOwner) {
      let element = this.__callback(target);
      return this.__property.getValue(element);
    },
    setValue: function (target: TOwner, value: TPropertyType) {
      let element = this.__callback(target);
      return this.__property.setValue(element, value);
    },
    serializeValue: function (target: TOwner) {
      if (this.__property.serializeValue == null) {
        return this.getValue(target);
      } else {
        let element = this.__callback(target);
        return this.__property.serializeValue(element);
      }
    },
  };

  let proxied = new Proxy(proxyData, {
    get(target, p: PropertyKey, receiver: any): any {
      if (p in target) {
        return target[p];
      } else if (target.__property) {
        return target.__property[p];
      }

      return undefined;
    },
  });

  return proxied;
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
 * A property which has one or more values to choose from.
 */
export interface IEnumProperty<T> extends IPropertyInfo {
  /**
   * The options that determine the behavior of an enum property
   */
  enumOptions: {
    /** the available values for the property **/
    values: IEnumValue<T>[];
    /** True if only the values provided via `values` are allowed **/
    preexistingOnly: boolean;
  };
}

/* One of the major default ids; shared here for simplicity */
export const TextContentId = 'text.text';

/**
 * Simple Type alias for IProperty<Control, T>
 */
export interface IControlProperty<T = any> extends IProperty<Control, T> {}
