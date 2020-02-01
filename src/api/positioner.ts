enum Anchor {
  none = 0,
  /* The order here matters because of the assumption that
     functions make in this module */
  left = 1 << 0,
  right = 1 << 1,
  top = 1 << 2,
  bottom = 1 << 3,
}

interface IStoredPositionInfo {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;

  width?: number;
  height?: number;
}

interface IStyleInfo {
  left: string;
  right: string;
  top: string;
  bottom: string;

  anchors: Anchor;
}

function determineEditStyle(storedInfo: IStoredPositionInfo, parent: HTMLElement): IStyleInfo {
  let leftRightData = getAbsoluteOffsets(
    storedInfo.left,
    storedInfo.right,
    storedInfo.width,
    parent.clientWidth,
    storedInfo,
    'horizontal',
    Anchor.left,
  );

  let topRightData = getAbsoluteOffsets(
    storedInfo.top,
    storedInfo.bottom,
    storedInfo.height,
    parent.clientHeight,
    storedInfo,
    'vertical',
    Anchor.top,
  );

  return {
    left: leftRightData.offsetA,
    right: leftRightData.offsetB,
    top: topRightData.offsetA,
    bottom: topRightData.offsetB,
    anchors: leftRightData.anchor | topRightData.anchor,
  };
}

function getAbsoluteOffsets(
  a: number,
  b: number,
  size: number,
  parentSize: number,
  data: any,
  mode: string,
  aFlag: Anchor,
) {
  let offsetA = '0px';
  let offsetB = '0px';
  let anchor = Anchor.none;

  if (a == null && b == null) {
    console.error(`No ${mode} offsets stored`, data);
    offsetA = '0px';
    offsetB = parentSize - 100 + 'px';
    return { offsetA, offsetB };
  }

  if (a != null && b != null) {
    offsetA = a + 'px';
    offsetB = b + 'px';
    anchor = aFlag | (anchor << 1);
    return { offsetA, offsetB, anchor };
  }

  if (size == null) {
    console.error(`No ${mode} size stored`, data);
    size = 100;
  }

  if (a != null /* && b == null*/) {
    offsetA = a + 'px';
    offsetB = parentSize - (a + size) + 'px';
    anchor = aFlag;
    return { offsetA, offsetB, anchor };
  } /* if (b != null) */ else {
    offsetB = a + 'px';
    offsetA = parentSize - b - size + 'px';
    anchor = aFlag << 1;
    return { offsetA, offsetB, anchor };
  }
}

export { determineEditStyle };
