import { DefaultFontValue, FontFamilyProperty } from "./~FontFamilyProperty";
import { buttonDescriptor } from "../controls/~Button";
import { Control } from "./Control";

const property = buttonDescriptor.getProperty(FontFamilyProperty.id);
const TimesNewRoman = 'Times New Roman';

let element: Control;

beforeEach(() => {
  element = buttonDescriptor.createInstance();
})


test("Setting value works", () => {
  property.setValue(element, TimesNewRoman);
})

test("Getting value works", () => {
  property.setValue(element, TimesNewRoman);
  let value = property.getValue(element);

  expect(value).toBe(TimesNewRoman);
})

test.each(FontFamilyProperty.enumOptions.values)("Enum option is settable and serializes - %# %o ", enumValue => {
  let defaultValue = property.getValue(element);
  property.setValue(element, enumValue.value);
  let newValue = property.getValue(element);

  expect(newValue).toBe(enumValue.value);

  let serializedValue = property.serializeValue!(element);
  if (enumValue.value !== defaultValue) {
    expect(serializedValue).toBe(enumValue.value);
  }
})

test("Default font serializes to undefined", () => {
  let value = property.serializeValue!(element);
  expect(value).toBeUndefined();
})

test("Resetting font serializes to undefined", () => {
  let defaultValue = FontFamilyProperty.enumOptions.values[0].value;
  let tempValue = FontFamilyProperty.enumOptions.values[1].value;

  property.setValue(element, tempValue);
  expect(property.serializeValue!(element)).not.toBeUndefined();

  property.setValue(element, defaultValue);
  expect(property.serializeValue!(element)).toBeUndefined();
})
