import { h, Fragment, ComponentChild, render, VNode, Component } from 'preact';

export { h, Fragment, ComponentChild, VNode, Component };

export function renderToFragment(tree: ComponentChild): DocumentFragment {
  let fragment = document.createDocumentFragment();
  render(tree, fragment);
  return fragment;
}
