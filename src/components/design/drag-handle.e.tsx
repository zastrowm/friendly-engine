import { Anchor } from '../../framework/layout';
import { CustomHtmlElement, customElement } from '@friendly/elements/CustomHtmlElement';

@customElement(DragHandle.tagName)
export class DragHandle extends CustomHtmlElement {
  public static readonly tagName = 'drag-handle';

  constructor() {
    super();

    this.anchorMode = Anchor.none;
  }

  /** What anchor this handle represents. */
  public anchorMode: Anchor;

  /** Override */
  public onConnected() {
    this.classList.add('drag-handle-' + Anchor[this.anchorMode]);
  }

  /** Override */
  public onRender() {
    this.appendInlineStyle();
  }

  /** Override */
  protected getInlineStyle() {
    return /*css*/ `
    drag-handle {
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10010;
      position: absolute;
    
      --handle-offset: -3px;
      --handle-size: 6px;
    }
    
    .drag-handle-nw,
    .drag-handle-ne,
    .drag-handle-se,
    .drag-handle-sw {
      width: var(--handle-size);
      height: var(--handle-size);
    }
    
    .drag-handle-nw {
      left: var(--handle-offset);
      top: var(--handle-offset);
    
      cursor: nw-resize;
    }
    
    .drag-handle-ne {
      right: var(--handle-offset);
      top: var(--handle-offset);
    
      cursor: ne-resize;
    }
    
    .drag-handle-se {
      right: var(--handle-offset);
      bottom: var(--handle-offset);
    
      cursor: se-resize;
    }
    
    .drag-handle-sw {
      left: var(--handle-offset);
      bottom: var(--handle-offset);
    
      cursor: sw-resize;
    }
    
    .drag-handle-east,
    .drag-handle-west,
    .drag-handle-north,
    .drag-handle-south {
      background: rgba(0, 0, 0, 0);
    }
    
    .drag-handle-north {
      right: var(--handle-offset);
      top: var(--handle-offset);
      left: var(--handle-offset);
      height: var(--handle-size);
    
      cursor: n-resize;
    }
    
    .drag-handle-east {
      right: var(--handle-offset);
      top: var(--handle-offset);
      bottom: var(--handle-offset);
      width: var(--handle-size);
    
      cursor: e-resize;
    }
    
    .drag-handle-west {
      left: var(--handle-offset);
      top: var(--handle-offset);
      bottom: var(--handle-offset);
      width: var(--handle-size);
    
      cursor: w-resize;
    }
    
    .drag-handle-south {
      right: var(--handle-offset);
      bottom: var(--handle-offset);
      left: var(--handle-offset);
      height: var(--handle-size);
    
      cursor: s-resize;
    }
    `;
  }
}
