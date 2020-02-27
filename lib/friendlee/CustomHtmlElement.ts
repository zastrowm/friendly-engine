import { render, ComponentChild, h } from 'preact';

export { h };

/**
 * Base class for a custom HTML element
 */
export abstract class CustomHtmlElement extends HTMLElement {
  private __hasBeenConnectedOnce: boolean;

  public onConnected() {}

  public onFirstConnected() {}

  public onDisconnected() {}

  public connectedCallback() {
    if (!this.__hasBeenConnectedOnce) {
      this.__hasBeenConnectedOnce = true;
      this?.onFirstConnected();
    }

    this.onConnected();
  }

  // :: Not directly related, but since it was PITA to realize ::
  // If we use this, it's important that the properties definitely exist on the type
  // that we're trying set it on; that is `propName in instance` returns true.
  //
  // This means that for custom elements, you can't just rely on a typescript public
  // property, but you actually have to assign a value to the property.
  // see https://github.com/preactjs/preact/blob/master/src/diff/props.js#L116
  // Eventually we should add decorators or something
  public renderJsx(tree: ComponentChild) {
    render(tree, this);
    this.appendInlineStyle();
  }

  /** Appends the inline style defined by this.getInlineStyle() to the current element */
  protected appendInlineStyle() {
    let style = this.getInlineStyle();
    if (style != null) {
      let styleElement = document.createElement('style');
      styleElement.innerHTML = style;
      this.appendChild(styleElement);
    }
  }

  protected getInlineStyle() {
    return null;
  }
}
