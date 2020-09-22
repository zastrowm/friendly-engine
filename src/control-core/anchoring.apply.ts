import { AnchorAxisLayout, AnchorAxisLayoutMode } from "./anchoring";

export function applyAnchorH(element: HTMLElement, anchor: AnchorAxisLayout) {
  switch (anchor.mode) {
    case AnchorAxisLayoutMode.none:
      // TODO
      break;
    case AnchorAxisLayoutMode.start:
      element.style.left = anchor.start + 'px';
      element.style.right = '';
      element.style.width = anchor.size + 'px';
      break;
    case AnchorAxisLayoutMode.end:
      element.style.left = '';
      element.style.right = anchor.end + 'px';
      element.style.width = anchor.size + 'px';
      break;
    case AnchorAxisLayoutMode.stretch:
      element.style.left = anchor.start + 'px';
      element.style.right = anchor.end + 'px';
      element.style.width = '';
      break;
  }
}

export function applyAnchorV(element: HTMLElement, anchor: AnchorAxisLayout) {
  switch (anchor.mode) {
    case AnchorAxisLayoutMode.none:
      // TODO
      break;
    case AnchorAxisLayoutMode.start:
      element.style.top = anchor.start + 'px';
      element.style.bottom = '';
      element.style.height = anchor.size + 'px';
      break;
    case AnchorAxisLayoutMode.end:
      element.style.top = '';
      element.style.bottom = anchor.end + 'px';
      element.style.height = anchor.size + 'px';
      break;
    case AnchorAxisLayoutMode.stretch:
      element.style.top = anchor.start + 'px';
      element.style.bottom = anchor.end + 'px';
      element.style.height = '';
      break;
  }
}
