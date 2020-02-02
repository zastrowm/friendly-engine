import { Anchor, IStoredPositionInfo, AnchoredBoundary } from './layout';

function determineEditStyle(storedInfo: IStoredPositionInfo, parent: HTMLElement) {
  let leftRightData = getAbsoluteOffsets(
    storedInfo.left,
    storedInfo.right,
    storedInfo.width,
    parent.clientWidth,
    storedInfo,
    'horizontal',
    Anchor.west,
  );

  let topRightData = getAbsoluteOffsets(
    storedInfo.top,
    storedInfo.bottom,
    storedInfo.height,
    parent.clientHeight,
    storedInfo,
    'vertical',
    Anchor.north,
  );

  return {
    anchor: leftRightData.anchor | topRightData.anchor,
    boundaries: new AnchoredBoundary(
      leftRightData.offsetA,
      topRightData.offsetA,
      leftRightData.offsetB,
      topRightData.offsetB,
    ),
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
  let offsetA = 0;
  let offsetB = 0;
  let anchor = Anchor.none;

  if (a == null && b == null) {
    console.error(`No ${mode} offsets stored`, data);
    offsetA = 0;
    offsetB = parentSize - 100;
    return { offsetA, offsetB };
  }

  if (a != null && b != null) {
    offsetA = a;
    offsetB = b;
    anchor = aFlag | (anchor << 1);
    return { offsetA, offsetB, anchor };
  }

  if (size == null) {
    console.error(`No ${mode} size stored`, data);
    size = 100;
  }

  if (a != null /* && b == null*/) {
    offsetA = a;
    offsetB = parentSize - (a + size);
    anchor = aFlag;
    return { offsetA, offsetB, anchor };
  } /* if (b != null) */ else {
    offsetB = a;
    offsetA = parentSize - b - size;
    anchor = aFlag << 1;
    return { offsetA, offsetB, anchor };
  }
}

export { determineEditStyle };
