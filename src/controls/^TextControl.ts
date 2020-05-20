import { Formatting } from "./editors/TextFormattingProperty";

/**
 * A control that has editable text that can be configured.
 */
export interface IControlWithText {
  /** The size of the font **/
  fontSize: number;
  /** The text of the button */
  text: string;
  /** The formatting to apply to the text **/
  textFormatting: Formatting;
  /** The alignment of the text **/
  textAlignment: string;
}
