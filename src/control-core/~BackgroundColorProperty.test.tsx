import {  createPropertyTests } from "./testCommon";
import { BackgroundColorProperty } from "./~BackgroundColorProperty";
import { rootControlDescriptor } from "../controls/~RootControl";

describe("Standard property tests", () => {
  createPropertyTests(BackgroundColorProperty, rootControlDescriptor, ["rgb(255, 128, 100)" , ""]);
});
