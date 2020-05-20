import { ControlContainer } from "../components/design/control-container.e";
import { ComponentChild, render } from "@friendly/elements/jsxElements";
import { setPropertyUndoRedo } from "../controls/editors/_shared";

interface JsxEditorRefreshArguments<T> {
  old: T;
  new: T;
  canMerge?: boolean;
}

export interface IPropertyEditor {
  elementToMount: HTMLElement;
}

/**
 * Creates an editor that uses JSX to provide the contents.
 * @param instance the instance for which the editor is valid
 * @param callback a callback that can be used to re-render the editor
 * @returns an IPropertyEditor that edits the given property
 */
export function createJsxEditor<T>(
  instance: ControlContainer,
  callback: (refreshCallback: (arg?: JsxEditorRefreshArguments<T>) => void) => ComponentChild,
): IPropertyEditor {
  let element = document.createElement('span');

  // callback that can be used to force JSX to re-render
  let invalidateCallback = (data?: JsxEditorRefreshArguments<T>) => {
    // if they passed in options, that means we should trigger an undo event
    if (data != null) {
      this.setValue(instance.control, data.new);

      setPropertyUndoRedo.trigger(element, {
        id: instance.control.id,
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

  return {
    elementToMount: element,
  };
}
