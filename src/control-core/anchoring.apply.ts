import { AnchorBoth, AnchorHV, AnchorModeBoth } from "./anchoring";

export function applyAnchor(element: HTMLElement, anchor: AnchorHV) {
  applyAnchorBothH(element, anchor.horizontal);
  applyAnchorBothV(element, anchor.vertical);
}

export function applyAnchorBothH(element: HTMLElement, anchor: AnchorBoth) {
  switch (anchor.mode) {
    case AnchorModeBoth.none:
      // TODO
      break;
    case AnchorModeBoth.start:
      element.style.left = anchor.start + 'px';
      element.style.right = '';
      element.style.width = anchor.size + 'px';
      break;
    case AnchorModeBoth.end:
      element.style.left = '';
      element.style.right = anchor.end + 'px';
      element.style.width = anchor.size + 'px';
      break;
    case AnchorModeBoth.stretch:
      element.style.left = anchor.start + 'px';
      element.style.right = anchor.end + 'px';
      element.style.width = '';
      break;
  }
}

export function applyAnchorBothV(element: HTMLElement, anchor: AnchorBoth) {
  switch (anchor.mode) {
    case AnchorModeBoth.none:
      // TODO
      break;
    case AnchorModeBoth.start:
      element.style.top = anchor.start + 'px';
      element.style.bottom = '';
      element.style.height = anchor.size + 'px';
      break;
    case AnchorModeBoth.end:
      element.style.top = '';
      element.style.bottom = anchor.end + 'px';
      element.style.height = anchor.size + 'px';
      break;
    case AnchorModeBoth.stretch:
      element.style.top = anchor.start + 'px';
      element.style.bottom = anchor.end + 'px';
      element.style.height = '';
      break;
  }
}
