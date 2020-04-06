import { render, ComponentChild, h } from 'preact';
import { CustomHtmlElement, customElement } from './CustomHtmlElement';

export { h, customElement };

export class CustomHtmlJsxElement extends CustomHtmlElement {
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

  /**
   * Redefinition of render to allow return JSX
   */
  public render(): ComponentChild | void {}

  /**
   * Force the object to immediately re-render if all criteria are met.
   **/
  public invalidate() {
    if (this.isConnected) {
      let retValue = this.onRender();
      if (retValue != null) {
        this.renderJsx((retValue as any) as ComponentChild);
      }
    }
  }
}
