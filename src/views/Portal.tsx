import React from "react";
import { createPortal } from "react-dom";

let mountElement: HTMLElement | null = null;

/**
 * Stores the portal element for all usages of Portal
 * @param element
 */
export function setPortalElement(element: HTMLElement) {
  mountElement = element;
}

/**
 * General purpose portal to allow showing elements in a different area
 */
export class Portal extends React.Component<{ }, { isMounted: boolean }> {

  private readonly el: HTMLDivElement;

  constructor(props: any) {
    super(props);

    if (mountElement == null)
      throw new Error("Mount element not set for DialogPortal");

    this.el = document.createElement('div');

    this.state = {
      isMounted: false
    };
  }

  componentDidMount() {
    mountElement?.appendChild(this.el);
    this.setState({ isMounted: true });
  }

  componentWillUnmount() {
    mountElement?.removeChild(this.el);
  }

  render() {
    return this.state.isMounted && createPortal(
      this.props.children,
      this.el,
    );
  }
}
