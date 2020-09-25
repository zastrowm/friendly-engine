import { IControlSerializedData, ISerializedPropertyBag } from "./propertyBag";
import { UniqueId } from "../util/UniqueId";
import { AnchorAxisLayout, AnchorAxisLayoutMode, BiAxis, serializeBiAxisLayout } from "./anchoring";

export const currentVersion = "0-1";

interface IUpgrader {
  upgrade(layout: ISerializedPanelLayout): ISerializedPanelLayout;
}

const upgradesToApply: IUpgrader[] = [];

export interface ISerializedPanelLayout {
  version: string;
  root: {
    properties: ISerializedPropertyBag;
  };
  controls: IControlSerializedData[];
  selected: UniqueId | null;
}

/**
 * Updates the properties on layout if it is from an older version of the layout specification
 * @param layout the layout to possibly update
 * @returns the updated layout than can be deserialized using the latest version of the engine
 */
export function upgradeLayout(layout: ISerializedPanelLayout): ISerializedPanelLayout {
  if (layout.version === currentVersion) {
    return layout;
  }

  for (let updater of upgradesToApply) {
    layout = updater.upgrade(layout);
  }

  return layout;
}

/**
 * Helper function to avoid “Object literal may only specify known properties” error
 */
function defineUpgrade<T extends IUpgrader>(upgrader: T) {
  upgradesToApply.push(upgrader);
}

/**
 * Way back before Alpha 1, we simply had an array of serialized controls
 */
defineUpgrade({
  upgrade(layout: ISerializedPanelLayout) {
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
  }
})

/**
 * After we implemented #19 "Allow elements to be anchored to the sides", we updated how position information
 * is stored in memory and serialized
 */
defineUpgrade({

  positionUpgradeVersion: "0-1",

  upgrade(layout: ISerializedPanelLayout): ISerializedPanelLayout {
    if (layout.version != null) {
      return layout;
    }

    for (let control of layout.controls) {
      if (control.position != null) {
        let positionAsOldPosition = control.position as any as IObsoleteStoredPositionInfo;
        if (positionAsOldPosition.left !== null) {
          let transformed = this.fromStoredPositionInfo(positionAsOldPosition);
          control.position = serializeBiAxisLayout(transformed);
        }
      }
    }

    layout.version = this.positionUpgradeVersion;

    return layout;
  },

  fromStoredPositionInfo(position: IObsoleteStoredPositionInfo): BiAxis<AnchorAxisLayout> {

    let horizontal: AnchorAxisLayout;
    let vertical: AnchorAxisLayout;

    if (position.width != null) {
      horizontal = {
        mode: AnchorAxisLayoutMode.start,
        start: position.left!,
        size: position.width
      };
    } else {
      horizontal = {
        mode: AnchorAxisLayoutMode.stretch,
        start: position.left!,
        end: position.right!
      }
    }

    if (position.height != null) {
      vertical = {
        mode: AnchorAxisLayoutMode.start,
        start: position.top!,
        size: position.height
      };
    } else {
      vertical = {
        mode: AnchorAxisLayoutMode.stretch,
        start: position.top!,
        end: position.bottom!
      }
    }

    return {
      horizontal,
      vertical
    };
  }
});

interface IObsoleteStoredPositionInfo {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width?: number;
  height?: number;
}
