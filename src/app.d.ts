import { IContext } from './framework/undoRedo';
import { DesignSurfaceElement } from './components/design/design-surface.e';

/* The app-specific version of undo redo has an editor component */
declare module './framework/undoRedo' {
  interface IContext {
    editor: DesignSurfaceElement;
  }
}
