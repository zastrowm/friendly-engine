import { Control } from "./Control";
import { IProperty, PropertyType } from "./controlProperties";
import { ISerializedLayout } from "./propertyBag";

export const PositionProperty: IProperty<Control, ISerializedLayout> = {
  id: 'layout',
  displayName: 'Position',
  propertyType: PropertyType.unknown,

  getValue(owner: Control): ISerializedLayout {
    return owner.position.serialize();
  },

  setValue(owner: Control, value: ISerializedLayout) {
    // todo make sure the control supports the given position
    owner.position.deserialize(value);
  },

  serializeValue(data: Control) {
    /** cannot be serialized **/
    return undefined;
  },
};
