import { createEnumTests, createPropertyTests } from "./testCommon";
import { buttonDescriptor } from "../controls/~Button";
import { FontSizeProperty } from "./~FontSizeProperty";
import { HorizontalAlignmentProperty } from "./~HorizontalAlignmentProperty";

describe("Standard property tests", () => {
  createPropertyTests(HorizontalAlignmentProperty, buttonDescriptor, ["left", "center"]);
  describe.skip("Disabled pending #7", () => {
    createEnumTests(HorizontalAlignmentProperty, buttonDescriptor);
  })
});
