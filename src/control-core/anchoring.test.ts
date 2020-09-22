import { adjustAnchoredLayout, AnchorAxisLayoutAdjustmentMode, AnchorLayoutSnapshot } from "./anchoring";


describe("adjustAnchoredLayout works as expected", () => {
  let original: AnchorLayoutSnapshot = {
    size: 15,
    start: 20,
    end: 30,
    parentSize: 100,
  };

  function adjustAndTest(adjustment: {adjustmentMode: AnchorAxisLayoutAdjustmentMode, diff: number, expected: AnchorLayoutSnapshot}) {
    let newValue = adjustAnchoredLayout(original, adjustment.adjustmentMode, adjustment.diff, 1);
    expect(newValue).toEqual(adjustment.expected);
  }

  [-9, 3, 0, 3, 9].forEach(diff => {

    test(`Both ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AnchorAxisLayoutAdjustmentMode.both,
        diff: diff,
        expected: {
          size: original.size,
          start: original.start + diff,
          end: original.end - diff,
          parentSize: original.parentSize
        } as AnchorLayoutSnapshot
      })
    });

    test(`Start ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AnchorAxisLayoutAdjustmentMode.start,
        diff: diff,
        expected: {
          size: original.size - diff,
          start: original.start + diff,
          end: original.end,
          parentSize: original.parentSize
        } as AnchorLayoutSnapshot
      })
    });

    test(`End ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AnchorAxisLayoutAdjustmentMode.end,
        diff: diff,
        expected: {
          size: original.size + diff,
          start: original.start,
          end: original.end - diff,
          parentSize: original.parentSize
        } as AnchorLayoutSnapshot
      })
    });

    test(`None ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AnchorAxisLayoutAdjustmentMode.none,
        diff: diff,
        expected: original
      })
    });
  })
})



