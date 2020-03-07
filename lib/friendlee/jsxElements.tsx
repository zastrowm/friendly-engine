import { h, Fragment, ComponentChild, render } from 'preact';

export { h, Fragment, ComponentChild };

export function renderToFragment(tree: ComponentChild): DocumentFragment {
  let fragment = document.createDocumentFragment();
  render(tree, fragment);
  return fragment;
}
