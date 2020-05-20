import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import { TextFormattingProperty } from './editors/TextFormattingProperty';
import { FontSizeProperty } from "./editors/FontSizeProperty";
import { IControlWithText } from "./^TextControl";
import { createControlDefinition } from "./defineControl";


interface ILabel extends IControlWithText {
}

export const Label = createControlDefinition<ILabel>({
  id: 'label',
  displayName: 'Label',
})
  .withFactory(() => {
    let text = document.createElement('div');
    return {
      root: text,
    };
  })
  .defineProperties((meta) => ({
    text: meta.compose(TextContentProperty, 'root'),
    fontSize: meta.compose(FontSizeProperty, 'root'),
    textFormatting: meta.compose(TextFormattingProperty, 'root'),
    textAlignment: meta.compose(TextAlignmentProperty, 'root'),
  }));
