import { LocalizedString } from './localization';
import { assume } from './util';

export const Enums = {
  /**
   * Applies the given mask to the enum.
   * @param value the original value
   * @param mask the mask to apply
   */
  mask: function <T>(value: T, mask: T): T {
    assume<number>(value);
    assume<number>(mask);

    return ((value & mask) as any) as T;
  },

  /**
   * True if the given enum value has the given flag
   * @param value the value of the bitwise enum
   * @param flag the value of the bitwise flag to check
   * @returns true if value has the given flag set, false otherwise
   */
  hasFlag: function <T>(value: T, flag: T): boolean {
    assume<number>(value);
    assume<number>(flag);
    return Enums.mask(value, flag) > 0;
  },

  /**
   * Toggles the bitwise flag for the given enum value
   * @param value the current value of the enum
   * @param flag the bitwise flag to toggle
   */
  toggleFlag<T>(value: T, flag: T): T {
    assume<number>(value);
    assume<number>(flag);

    (value as any) ^= flag;

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
