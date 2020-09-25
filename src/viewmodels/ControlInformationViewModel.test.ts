import { buttonDescriptor } from "../controls/~Button";
import { ControlInformationViewModel, IControlInformationViewModelOwner } from "./ControlInformationViewModel";
import { registerCommonControls } from "../controls/@standardControls";
import { ControlRegistry } from "../control-core/controlRegistry";
import { AnchorAxisLayoutMode } from "../control-core/anchoring";

let selectionState = new Map<ControlInformationViewModel, boolean>();

let owner: IControlInformationViewModelOwner = {
  markSelected(controlVm: ControlInformationViewModel, isSelected: boolean) {
    selectionState.set(controlVm, isSelected);
  }
}

beforeEach(() => {
  selectionState.clear();
})

let registry = new ControlRegistry()
registerCommonControls(registry);

test.each(registry.getDescriptors().map(d => d.id))('Creating a control (%s) works', (did) => {
  let descriptor = registry.getDescriptor(did);

  let controlVm = new ControlInformationViewModel(owner, descriptor);
  let control = controlVm.control;

  expect(controlVm.id).not.toBeNull();
  expect(controlVm.position).not.toBeNull();
  expect(controlVm.position.serialize()).not.toBeNull();
  expect(controlVm.isAttached).toBe(false);

  expect(control.id).not.toBeNull();
  expect(control.descriptor).toBe(descriptor);
  expect(control.htmlRoot).not.toBeNull();
})

test("setting a control as selected notifies parent", () => {
  let vm = new ControlInformationViewModel(owner, buttonDescriptor);
  expect(selectionState.get(vm)).toBe(undefined);

  vm.isSelected = true;
  expect(selectionState.get(vm)).toBe(true);
  expect(vm.isSelected).toBe(true);

  vm.isSelected = false;
  expect(vm.isSelected).toBe(false);
  expect(selectionState.get(vm)).toBe(false);
})

test("Changing VM position changes control position", () => {
  let vm = new ControlInformationViewModel(owner, buttonDescriptor);
  vm.position.updateLayout({
    mode: AnchorAxisLayoutMode.start,
    start: 103,
    size: 100,
  }, {
    mode: AnchorAxisLayoutMode.end,
    end: 108,
    size: 109,
  });

  expect(vm.control.position.serialize()).toStrictEqual({
    horizontal: {
      mode: AnchorAxisLayoutMode.start,
      start: 103,
      size: 100,
    },
    vertical: {
      mode: AnchorAxisLayoutMode.end,
      end: 108,
      size: 109,
    }
  });
})

test("Serialization works", () => {
  let vm = new ControlInformationViewModel(owner, buttonDescriptor);

  let serialization = vm.serialize();
  expect(serialization.id).toBe(vm.id);
  expect(serialization.typeId).toBe(buttonDescriptor.id);
  expect(serialization.properties).toStrictEqual({});
})
