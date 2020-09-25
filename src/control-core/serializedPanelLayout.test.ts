import { upgradeLayout } from "./serializedPanelLayout";
import { IControlSerializedData } from "./propertyBag";
import { generateUniqueId } from "../util/UniqueId";
import { buttonDescriptor } from "../controls/~Button";
import { AnchorAxisLayoutMode } from "./anchoring";

test("Upgrades from pre-alpha", () => {

  let controls: IControlSerializedData[] = [
    {
      typeId: buttonDescriptor.id,
      id: generateUniqueId(),
      properties: {},
      position: {},
    },
    {
      typeId: buttonDescriptor.id,
      id: generateUniqueId(),
      properties: {},
      position: {},
    }
  ];

  let layout = upgradeLayout(controls as any);

  expect(layout.controls).toBe(controls);
})

test("Upgrades from position changes", () => {

  let preLayoutChanges: IControlSerializedData[] = [
    {
      typeId: buttonDescriptor.id,
      id: generateUniqueId(),
      properties: {},
      position: {
        left: 5,
        right: 15,
        top: 30,
        bottom: 40,
      },
    },
    {
      typeId: buttonDescriptor.id,
      id: generateUniqueId(),
      properties: {},
      position: {
        left: 55,
        right: 65,
        top: 50,
        bottom: 60,
      },
    }
  ];

  let layout = upgradeLayout(preLayoutChanges as any);
  expect(layout.controls[1].position).toEqual([AnchorAxisLayoutMode.stretch, 55, 65, AnchorAxisLayoutMode.stretch, 50, 60]);
})
