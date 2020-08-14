import { LocalizedString } from './localization';

export const Enums = {
  /**
   * True if the given enum value has the given flag
   * @param value the value of the bitwise enum
   * @param flag the value of the bitwise flag to check
   * @returns true if value has the given flag set, false otherwise
   */
  hasFlag: function (value: number, flag: number): boolean {
    return (value & flag) > 0;
  },

  /**
   * Toggles the bitwise flag for the given enum value
   * @param value the current value of the enum
   * @param flag the bitwise flag to toggle
   */
  toggleFlag(value: number, flag: number) {
    value ^= flag;
    return value;
  },
};

/**
 * An enumerable value that can be displayed to the user.
 */
export interface IEnumValue<T> {
  /** The underlying value of the enum **/
  value: T;
  /** The human-readable version of the value **/
  display: LocalizedString;
}
