import { ControlInformationViewModel, IControlInformationViewModelOwner } from './ControlInformationViewModel';
import { ISerializedPropertyBag } from '../control-core/propertyBag';
import { rootControlDescriptor } from '../controls/~RootControl';
import { AnchorAxisLayoutMode } from "../control-core/anchoring";

export class RootControlInformationViewModel extends ControlInformationViewModel {
  constructor(owner: IControlInformationViewModelOwner, properties?: ISerializedPropertyBag) {
    super(owner, rootControlDescriptor);

    this.control.position.updateLayout(
      {
        mode: AnchorAxisLayoutMode.stretch,
        start: 0,
        end: 0
      },
      {
        mode: AnchorAxisLayoutMode.stretch,
        start: 0,
        end: 0
      }
    )

    if (properties != null) {
      this.control.deserializeProperties(properties);
    }
  }
}
