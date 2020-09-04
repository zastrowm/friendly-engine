import {  createPropertyTests } from "./testCommon";
import { buttonDescriptor } from "../controls/~Button";
import { FontSizeProperty } from "./~FontSizeProperty";

describe("Standard property tests", () => {
  createPropertyTests(FontSizeProperty, buttonDescriptor, [12, 18, 99, 12]);
});
