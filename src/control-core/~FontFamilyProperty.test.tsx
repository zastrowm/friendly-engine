import { FontFamilyProperty } from "./~FontFamilyProperty";
import { buttonDescriptor } from "../controls/~Button";
import { createEnumTests, createPropertyTests } from "./testCommon";

describe("Standard property & enum tests", () => {
  const TimesNewRoman = 'Times New Roman';

  createPropertyTests(FontFamilyProperty, buttonDescriptor, [TimesNewRoman]);
  createEnumTests(FontFamilyProperty, buttonDescriptor);
});
