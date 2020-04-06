import { TextAlignmentProperty } from './editors/TextAlignmentProperty';
import { BaseControlDescriptor } from '../framework/controlsRegistry';
import { TextContentProperty } from './editors/TextContentProperty';

class LabelDescriptor extends BaseControlDescriptor {
  public id = 'label';

  private static properties = [new TextContentProperty(), new TextAlignmentProperty()];

  public createInstance(): HTMLElement {
    return document.createElement('div');
  }

  public getProperties() {
    return LabelDescriptor.properties;
  }
}

export let labelDescriptor = new LabelDescriptor();
