import { EditorAppViewModel, IApplicationHost, ICopyPasteContents } from "./EditorAppViewModel";
import { buttonDescriptor } from "../controls/~Button";
import { checkboxDescriptor } from "../controls/~Checkbox";
import { labelDescriptor } from "../controls/~Label";

let viewModel: EditorAppViewModel;
let hostMock: IApplicationHost;
let copiedData: ICopyPasteContents | null = null;

beforeEach(() => {
  hostMock = {
    copyToClipboard(data: ICopyPasteContents) {
      copiedData = data;
    },
    shouldAutoLoad: false
  };
  viewModel = new EditorAppViewModel(hostMock);
  copiedData = null;
})

test("Adding a button adds it", () => {
  expect(viewModel.controls.controls.length).toBe(0);

  viewModel.addControl(buttonDescriptor);
  expect(viewModel.controls.controls.length).toBe(1);
})

test("Adding a button selects it", () => {
  viewModel.addControl(buttonDescriptor);
  expect(viewModel.controls.primarySelected).not.toBeNull();
})

test("Adding can be undone", () => {
  viewModel.addControl(buttonDescriptor);
  expect(viewModel.controls.controls.length).toBe(1);
  expect(viewModel.undoRedo.canUndo).toBeTruthy();
  expect(viewModel.undoRedo.canRedo).toBeFalsy();

  viewModel.undo();
  expect(viewModel.controls.controls.length).toBe(0);
  expect(viewModel.undoRedo.canUndo).toBeFalsy();
  expect(viewModel.undoRedo.canRedo).toBeTruthy();
})

test("Adding can be undone & redone", () => {
  viewModel.addControl(buttonDescriptor);
  expect(viewModel.controls.controls.length).toBe(1);

  viewModel.undo();
  expect(viewModel.controls.controls.length).toBe(0);

  viewModel.redo();
  expect(viewModel.controls.controls.length).toBe(1);
  expect(viewModel.undoRedo.canUndo).toBeTruthy();
  expect(viewModel.undoRedo.canRedo).toBeFalsy();
})

test("Copy works", () => {
  viewModel.addControl(buttonDescriptor);
  viewModel.addControl(checkboxDescriptor);
  expect(viewModel.controls.controls.length).toBe(2);
  expect(viewModel.controls.primarySelected?.typeId).toBe(checkboxDescriptor.id);

  viewModel.copySelected();
  expect(copiedData).not.toBe(null);
  expect(copiedData?.text).not.toBeNull();
  expect(copiedData?.text).not.toEqual("");
  expect(copiedData?.data).not.toBeNull();
  expect(copiedData?.data).not.toEqual("");
})

test("Copy does nothing if nothing is selected", () => {
  viewModel.addControl(buttonDescriptor);
  viewModel.addControl(checkboxDescriptor);
  expect(viewModel.controls.controls.length).toBe(2);
  viewModel.controls.primarySelected!.isSelected = false;

  viewModel.copySelected();
  expect(copiedData).toBe(null);
})

test("Copy & paste works", () => {
  viewModel.addControl(buttonDescriptor);
  viewModel.addControl(checkboxDescriptor);
  expect(viewModel.controls.controls.length).toBe(2);
  expect(viewModel.controls.primarySelected?.typeId).toBe(checkboxDescriptor.id);

  let previousIds = new Set(viewModel.controls.controls.map(c => c.id));
  viewModel.copySelected();
  expect(copiedData).not.toBe(null);

  viewModel.paste(copiedData!);
  expect(viewModel.controls.controls.length).toBe(3);
  let newControl = viewModel.controls.primarySelected!;
  expect(previousIds.has(newControl.id)).toBe(false)
})

test("Copy & paste is undoable", verifyUndoRedoEachYield(function*() {
  viewModel.addControl(buttonDescriptor);
  yield;
  viewModel.addControl(checkboxDescriptor);
  yield;

  viewModel.copySelected();
  viewModel.paste(copiedData!);
  yield;
  expect(viewModel.controls.controls.length).toBe(3);

  viewModel.undo();
  expect(viewModel.controls.controls.length).toBe(2);

  viewModel.redo();
  expect(viewModel.controls.controls.length).toBe(3);
}))

test("Extensive undo/redo tests", verifyUndoRedoEachYield(function*() {
  viewModel.addControl(buttonDescriptor);
  yield;
  viewModel.addControl(checkboxDescriptor);
  yield;

  viewModel.addControl(labelDescriptor);
  yield;

  expect(viewModel.controls.controls.length).toBe(3);
  selectControlAt(1);
  viewModel.copySelected();
  viewModel.paste(copiedData!);
  yield;

  viewModel.addControl(checkboxDescriptor);
  yield;

  expect(viewModel.controls.controls.length).toBe(5);
}))

/**
 * Make the control at the specified index the currently selected item.
 */
function selectControlAt(index: number) {
  viewModel.controls.controls[index].isSelected = true;
}

/**
 * Verify that if we undo every undoable item then redo every redoable item, the states end up
 * serializing the same (excluding the currently selected item).
 */
function verifyUndoRedoSerialization() {
  let serializationStack = [];

  while (viewModel.undoRedo.canUndo) {
    let serialized = viewModel.controls.serializeLayout();
    serialized.selected = null;
    serializationStack.push(serialized);
    viewModel.undo();
  }

  for (let i = 0; viewModel.undoRedo.canRedo; i++) {
    viewModel.redo();
    let serialized = viewModel.controls.serializeLayout();
    serialized.selected = null;
    let expected = serializationStack.pop();

    expect(serialized).toEqualWithMessage(expected, `After undoing then redoing operation #${i + 1}`);
  }
}

/**
 * Every time the generator yields, call verifyUndoRedoSerialization
 * @param callback
 */
function verifyUndoRedoEachYield(callback: () => Generator) {
  return function() {
    let generator = callback();

    while (!generator.next().done) {
      verifyUndoRedoSerialization();
    }

    verifyUndoRedoSerialization();
  }
}
