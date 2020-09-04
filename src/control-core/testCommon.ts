import { IControlProperty, IEnumProperty, IProperty } from "./controlProperties";
import { IControlDescriptor } from "./controlRegistry";
import { Control } from "./Control";

/**
 * Test that getting & setting values works, and that the default value serializes to undefined.
 */
export function createPropertyTests<T>(
  htmlProperty: IProperty<HTMLElement, T>,
  descriptor: IControlDescriptor,
  testValues: T[]) {

  let element: Control;
  let property: IControlProperty;

  beforeEach(() => {
    element = descriptor.createInstance();
    property = descriptor.getProperty(htmlProperty.id);
  })

  for (let testValue of testValues) {
    test(`Getting & setting value works: \`${testValue}\``, () => {
      property.setValue(element, testValue);
      let value = property.getValue(element);

      expect(value).toBe(testValue);
    })
  }

  test("Default value serializes to undefined", () => {
    let value = property.serializeValue!(element);
    expect(value).toBeUndefined();
  })
}

/**
 * Verifies that every enum value is gettable + settable; verifies that resetting to the default value resets
 * continues to serialize as undefined.
 */
export function createEnumTests(
  enumProperty: IEnumProperty<any>,
  descriptor: IControlDescriptor) {

  let element: Control;
  let property: IControlProperty;

  beforeEach(() => {
    element = descriptor.createInstance();
    property = descriptor.getProperty(enumProperty.id);
  })

  enumProperty.enumOptions.values.map(enumValue => {

    test(`Enum option is settable:' ${enumValue.value}' => '${enumValue.display}'`, () => {
      property.setValue(element, enumValue.value);
      let newValue = property.getValue(element);
      expect(newValue).toBe(enumValue.value);
    });

    test(`Enum option is serializable: '${enumValue.value}' => '${enumValue.display}'`, () => {
      let defaultValue = property.getValue(element);
      property.setValue(element, enumValue.value);


      if (enumValue.value === defaultValue) {
        return;
      }

      let serializedValue = property.serializeValue!(element);
      expect(serializedValue).toBe(enumValue.value);
    });
  })

  test(`Resetting font serializes to undefined`, () => {
    let defaultValue = property.getValue(element);
    let firstNonDefault = enumProperty.enumOptions.values.filter(v => v != defaultValue)[0];

    property.setValue(element, firstNonDefault);
    let serialized = property.serializeValue!(element);
    expect(serialized).not.toBeUndefined();

    property.setValue(element, defaultValue);
    let defaultSerialized = property.serializeValue!(element);
    expect(defaultSerialized).toBeUndefined();
  });
}
