import { DefaultFontValue, FontFamilyProperty } from "./~FontFamilyProperty";
import { buttonDescriptor } from "../controls/~Button";
import { Control } from "./Control";

let property = buttonDescriptor.getProperty(FontFamilyProperty.id);
let element: Control;

beforeEach(() => {
  element = buttonDescriptor.createInstance();
})

const TimesNewRoman = 'Times New Roman';

test("Setting value works", () => {
  property.setValue(element, TimesNewRoman);
})

test("Getting value works", () => {
  property.setValue(element, TimesNewRoman);
  let value = property.getValue(element);

  expect(value).toBe(TimesNewRoman);
})

test.each(FontFamilyProperty.enumOptions.values)("Enum option is settable and serializes - %# %o ", enumValue => {
  property.setValue(element, enumValue.value);
  let newValue = property.getValue(element);

  expect(newValue).toBe(enumValue.value);

  let serializedValue = property.serializeValue!(element);
  if (enumValue.value !== DefaultFontValue) {
    expect(serializedValue).toBe(enumValue.value);
  }
})

test("Default font serializes to undefined", () => {
  let value = property.serializeValue!(element);
  expect(value).toBeUndefined();
})
