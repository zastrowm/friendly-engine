import { IContainerProperty, IPropertyEditor, IPropertyInfo } from '../controlProperties';
import { ComponentChild, render } from '@friendly/elements/jsxElements';
import { setPropertyUndoRedo } from './_shared';

export interface IPropEditor<T> {
  canProcess(property: IPropertyInfo): boolean;
  createEditorFor(wrapped: IContainerProperty<T>): HTMLElement;
}

/**
 * Contains a collection of editors that can be applied to various properties.
 */
export class PropertyEditorRegistry {
  private editors: IPropEditor<any>[] = [];

  public insert(editor: IPropEditor<any>) {
    this.editors.splice(0, 0, editor);
  }

  public add(editor: IPropEditor<any>) {
    this.editors.push(editor);
  }

  public findEditorFor(property: IPropertyInfo) {
    for (let editor of this.editors) {
      if (editor.canProcess(property)) {
        return editor;
      }
    }

    throw new Error(`No editor found for property '${property.id}' (${property.displayName})`);
  }
}

interface JsxEditorRefreshArguments<T> {
  old: T;
  new: T;
  canMerge?: boolean;
}

/**
 * Creates an editor that uses JSX to provide the contents.
 * @param wrapped the instance for which the editor is valid
 * @param callback a callback that can be used to re-render the editor
 * @returns an IPropertyEditor that edits the given property
 */
export function createJsxEditor<T>(
  wrapped: IContainerProperty<T>,
  callback: (refreshCallback: (arg?: JsxEditorRefreshArguments<T>) => void) => ComponentChild,
): HTMLElement {
  let element = document.createElement('span');

  // callback that can be used to force JSX to re-render
  let invalidateCallback = (data?: JsxEditorRefreshArguments<T>) => {
    // if they passed in options, that means we should trigger an undo event
    if (data != null) {
      wrapped.setValue(data.new);

      setPropertyUndoRedo.trigger(element, {
        id: wrapped.id,
        property: this,
        originalValue: data.old,
        newValue: data.new,
        canMerge: data?.canMerge ?? false,
      });
    }

    // actually re-render
    let jsx = callback(invalidateCallback);
    render(jsx, element);
  };

  // first time rendering
  invalidateCallback();

  return element;
}
