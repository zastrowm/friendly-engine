import { ControlCollectionViewModel } from "./ControlCollectionViewModel";
import { buttonDescriptor } from "../controls/~Button";
import { UniqueId } from "../util/UniqueId";

let viewModel: ControlCollectionViewModel;

beforeEach(() => {
  viewModel = new ControlCollectionViewModel();
})

function addControl(id: any) {
  let descriptor = buttonDescriptor;
  return viewModel.addControl(descriptor, {
    id: id as UniqueId,
    position: { left: 100, right: 50, top: 10, bottom: 20},
    properties: {},
    typeId: descriptor.id,
  });
}

test('adding control works', () => {
  addControl("aNewControl");

  expect(viewModel.controls.length).toBe(1);
  expect(viewModel.controls[0].isAttached).toBe(false);
});

test('removing a control works', () => {
  let id = "aNewControl" as any as UniqueId;
  addControl(id);

  expect(viewModel.controls.length).toBe(1);
  viewModel.removeControlById(id);
  expect(viewModel.controls.length).toBe(0);
});

test('adding a control makes that control selected', () => {
  let control = addControl("control");
  expect(viewModel.primarySelected).toBe(control);
});

test('removing a selected control removes selection', () => {
  let control = addControl("control");
  expect(viewModel.primarySelected).toBe(control);

  viewModel.removeControlById(control.id);
  expect(viewModel.primarySelected).toBe(null);
});

test('removing a selected control removes selection', () => {
  addControl("control1");
  addControl("control2");
  let lastAdded = addControl("control3");
  expect(viewModel.primarySelected).toBe(lastAdded);

  viewModel.removeControlById(lastAdded.id);
  expect(viewModel.primarySelected).toBe(null);
});

test('setting control selection marks it as selected', () => {
  let ctrl1 = addControl("control1");
  let ctrl2 = addControl("control2");
  let ctrl3 = addControl("control3");

  ctrl1.isSelected = true;
  expect(viewModel.primarySelected).toBe(ctrl1);

  ctrl2.isSelected = true;
  expect(viewModel.primarySelected).toBe(ctrl2);

  ctrl3.isSelected = true;
  expect(viewModel.primarySelected).toBe(ctrl3);
})


test('deselecting a control null out selection', () => {
  let ctrl1 = addControl("control1");
  let ctrl2 = addControl("control2");
  let ctrl3 = addControl("control3");
  ctrl2.isSelected = true;
  expect(viewModel.primarySelected).toBe(ctrl2);

  ctrl2.isSelected = false;
  expect(viewModel.primarySelected).toBe(null);
})
