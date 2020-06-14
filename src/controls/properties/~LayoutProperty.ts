import { IProperty, PropertyType } from '../controlProperties';
import { Control } from '../Control';
import { IStoredPositionInfo } from '../../framework/layout';

export let layoutProperty: IProperty<Control, IStoredPositionInfo> = {
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

  serializeValue(data: Control): IStoredPositionInfo {
    /** cannot be serialized **/
    return undefined;
  },
};
