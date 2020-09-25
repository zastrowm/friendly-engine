import { Control } from "./Control";
import { IProperty, PropertyType } from "./controlProperties";
import { BiAxisAnchorLayout } from "./anchoring";

export const PositionProperty: IProperty<Control, BiAxisAnchorLayout> = {
  id: 'layout',
  displayName: 'Position',
  propertyType: PropertyType.unknown,

  getValue(owner: Control): BiAxisAnchorLayout {
    return {
      horizontal: owner.position.hAxis,
      vertical: owner.position.vAxis,
    }
  },

  setValue(owner: Control, value: BiAxisAnchorLayout) {
    // todo make sure the control supports the given position
    owner.position.updateLayout(value.horizontal, value.vertical);
  },

  serializeValue(data: Control) {
    /** cannot be serialized **/
    return undefined;
  },
};
