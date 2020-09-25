import { IControlSerializedData, ISerializedPropertyBag } from "./propertyBag";
import { UniqueId } from "../util/UniqueId";
import { IStoredPositionInfo } from "./layout";
import { fromStoredPositionInfo, serializeBiAxisLayout } from "./anchoring";

export const currentVersion = "0-1";

const upgradesToApply: ((layout: ISerializedPanelLayout) => ISerializedPanelLayout)[] = [];

export interface ISerializedPanelLayout {
  version: string;
  root: {
    properties: ISerializedPropertyBag;
  };
  controls: IControlSerializedData[];
  selected: UniqueId | null;
}

export function upgradeLayout(layout: ISerializedPanelLayout): ISerializedPanelLayout {
  if (layout.version === currentVersion) {
    return layout;
  }

  for (let func of upgradesToApply) {
    layout = func(layout);
  }

  return layout;
}

/**
 * Way back before Alpha 1, we simply had an array of serialized controls
 */
upgradesToApply.push(function upgradeFromPreAlpha1(layout: ISerializedPanelLayout) {
  if (layout.version != null) {
    return layout;
  }

  if (!Array.isArray(layout)) {
    return layout;
  }

  return {
    controls: layout as IControlSerializedData[],
    root: {
      properties: {},
    },
    selected: null,
  } as any as ISerializedPanelLayout;
})

/**
 * After we implemented #19 "Allow elements to be anchored to the sides", we updated how position information
 * is stored in memory and serialized
 */
const positionUpgradeVersion = "0-1";
upgradesToApply.push(function upgradePositionInformation(layout: ISerializedPanelLayout) {
  if (layout.version != null) {
    return layout;
  }

  for (let control of layout.controls) {
    if (control.position != null) {
      if ((control.position as IStoredPositionInfo).left !== null) {
        let transformed = fromStoredPositionInfo((control.position as IStoredPositionInfo));
        control.position = serializeBiAxisLayout(transformed);
      }
    }
  }

  layout.version = positionUpgradeVersion;

  return layout;
});
