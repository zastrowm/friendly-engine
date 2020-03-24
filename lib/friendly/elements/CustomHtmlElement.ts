let knownCustomElements = new Map<string, Function>();

/**
 * Decorator to automatically register a custom element with the custom elements
 * @param tagName the html tag name to register the element with
 */
export function customElement(tagName: string) {
  return function<T extends { new (...args: any[]): any }>(constructor: T) {
    knownCustomElements.set(tagName, constructor);
    window.customElements.define(tagName, constructor);
    return constructor;
  };
}

/**
 * Retrieves all of the names for known elements
 */
export function getCustomElementNames() {
  return knownCustomElements.keys();
}

/**
 * Base class for a custom HTML element
 */
export abstract class CustomHtmlElement extends HTMLElement {
  private __hasBeenConnectedOnce: boolean;

  /**
   * Invoked when the element is added to the DOM.
   */
  public onConnected() {}

  /**
   * Invoked when the element is added to the DOM for the first time.
   */
  public onFirstConnected() {}

  /**
   * Invoked when the element is removed from the DOM.
   */
  public onDisconnected() {}

  /**
   * Invoked by the DOM/HTMLElement when the element is added to the DOM.
   */
  public connectedCallback() {
    if (!this.isConnected) {
      return;
    }

    if (!this.__hasBeenConnectedOnce) {
      this.__hasBeenConnectedOnce = true;
      this?.onFirstConnected();
      this.invalidate();
    }

    this.onConnected();
  }

  /**
   * Invoked by the DOM/HTMLElement when the element is removed from the DOM.
   */
  public disconnectedCallback() {
    if (this.isConnected) {
      return;
    }

    this.onDisconnected();
  }

  /**
   * When called, the custom element should render itself by appending any html as necessary.
   */
  public onRender() {}

  /**
   * Force the object to immediately re-render if all criteria are met.
   **/
  public invalidate() {
    if (this.isConnected) {
      this.onRender();
    }
  }

  /**
   * Appends the inline style defined by this.getInlineStyle() to the current element.
   **/
  protected appendInlineStyle() {
    let style = this.getInlineStyle();
    if (style != null) {
      let styleElement = document.createElement('style');
      styleElement.innerHTML = style;
      this.appendChild(styleElement);
    }
  }

  /**
   * Any inline-styling defined by the component should be added here.
   */
  protected getInlineStyle() {
    return null;
  }
}
