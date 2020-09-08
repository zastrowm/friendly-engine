import { Control } from "./Control";
import { IProperty, PropertyType } from "./controlProperties";
import { IStoredPositionInfo } from "./layout";

export const PositionProperty: IProperty<Control, IStoredPositionInfo> = {
  id: 'layout',
  displayName: 'Position',
  propertyType: PropertyType.unknown,

  getValue(owner: Control): any {
    return owner.position.layout;
  },

  setValue(owner: Control, value: IStoredPositionInfo) {
    // todo make sure the control supports the given position
    owner.position.update(value);
  },

  serializeValue(data: Control) {
    /** cannot be serialized **/
    return undefined;
  },
};
