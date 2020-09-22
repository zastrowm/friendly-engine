import { UniqueId } from '../util/UniqueId';
import { IControlProperty } from './controlProperties';

export interface ISerializedPropertyBag {
  [key: string]: any;
}

export interface ISerializedLayout {
}

/** The serialized representation of a control */
export interface IControlSerializedData {
  id: UniqueId;
  position: ISerializedLayout | null;
  properties: ISerializedPropertyBag;
  typeId: string;
}

/** Add the given property value to the property bag, overriding the existing value if it exists */
export function addValue<T>(propertyBag: ISerializedPropertyBag, property: IControlProperty<T>, value: T) {
  propertyBag[property.id] = value;
}

/** Retrieves the current property value from the property bag, returning undefined if it doesn't exist */
export function tryGetValue<T>(propertyBag: ISerializedPropertyBag, property: IControlProperty<T>): T | undefined {
  return propertyBag[property.id];
}
