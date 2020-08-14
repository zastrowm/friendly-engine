import { ControlInformationViewModel, IControlInformationViewModelOwner } from './ControlInformationViewModel';
import { ISerializedPropertyBag } from '../control-core/propertyBag';
import { rootControlDescriptor } from '../controls/~RootControl';

export class RootControlInformationViewModel extends ControlInformationViewModel {
  constructor(owner: IControlInformationViewModelOwner, properties?: ISerializedPropertyBag) {
    super(owner, rootControlDescriptor);

    this.control.layout = {
      bottom: 0,
      top: 0,
      left: 0,
      right: 0,
    };

    if (properties != null) {
      this.control.deserializeProperties(properties);
    }
  }
}
