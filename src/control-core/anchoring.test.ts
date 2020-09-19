import { adjustAnchoredLayout, AdjustmentMode, AnchorData } from "./anchoring";


describe("adjustAnchoredLayout works as expected", () => {
  let original: AnchorData = {
    size: 15,
    start: 20,
    end: 30,
    parentSize: 100,
  };

  function adjustAndTest(adjustment: {adjustmentMode: AdjustmentMode, diff: number, expected: AnchorData}) {
    let newValue = adjustAnchoredLayout(original, adjustment.adjustmentMode, adjustment.diff, 1);
    expect(newValue).toEqual(adjustment.expected);
  }

  [-9, 3, 0, 3, 9].forEach(diff => {

    test(`Both ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AdjustmentMode.both,
        diff: diff,
        expected: {
          size: original.size,
          start: original.start + diff,
          end: original.end - diff,
          parentSize: original.parentSize
        } as AnchorData
      })
    });

    test(`Start ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AdjustmentMode.start,
        diff: diff,
        expected: {
          size: original.size - diff,
          start: original.start + diff,
          end: original.end,
          parentSize: original.parentSize
        } as AnchorData
      })
    });

    test(`End ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AdjustmentMode.end,
        diff: diff,
        expected: {
          size: original.size + diff,
          start: original.start,
          end: original.end - diff,
          parentSize: original.parentSize
        } as AnchorData
      })
    });

    test(`None ${diff}`, () => {
      adjustAndTest({
        adjustmentMode: AdjustmentMode.none,
        diff: diff,
        expected: original
      })
    });
  })
})



