import { h, Fragment, ComponentChild, render, VNode, Component } from 'preact';

export { h, Fragment, ComponentChild, VNode, Component, render };

export function renderToFragment(tree: ComponentChild): DocumentFragment {
  let fragment = document.createDocumentFragment();
  render(tree, fragment);
  return fragment;
}

export function renderToElement(elementName: string, tree: ComponentChild): HTMLElement {
  let element = document.createElement(elementName);
  render(tree, element);
  return element;
}
