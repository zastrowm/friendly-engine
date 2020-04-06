import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { TextContentProperty } from './editors/TextContentProperty';
import { BaseControlDescriptor } from 'src/framework/controlsRegistry';

class ButtonDescriptor extends BaseControlDescriptor {
  public id = 'button';

  private static properties = [new TextContentProperty(), new TextAlignmentProperty()];

  public createInstance(): HTMLElement {
    return document.createElement('button');
  }

  public getProperties() {
    return ButtonDescriptor.properties;
  }
}

export let buttonDescriptor = new ButtonDescriptor();
