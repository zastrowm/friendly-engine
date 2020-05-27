import { IPropertyInfo, PropertyType } from '../controlProperties';
import { ComponentChild, render } from '@friendly/elements/jsxElements';
import { setPropertyUndoRedo } from './_shared';
import { UniqueId } from '../../framework/util';

/**
 * A wrapper around an IProperty and a given source, allowing editors to focus merely on the value
 * and the property rather than where the property value is coming from.
 */
export interface IInstancedProperty<T> {
  /** The id of the thing being edited */
  readonly id: UniqueId;

  /** Gets the current value for the thing being edited */
  getValue(): T;

  /** Sets the current value for the thing being edited */
  setValue(value: T);

  /** The property that is being edited **/
  property: IPropertyInfo;
}

/**
 * Represents an editor for a given property
 */
export interface IPropertyEditor<T> {
  /**
   * Returns true if the given property can be edited by this editor.
   */
  canProcess(property: IPropertyInfo): boolean;

  /**
   * Creates an editor for the given property + instance
   */
  createEditorFor(wrapped: IInstancedProperty<T>): HTMLElement;
}

/**
 * Contains a collection of editors that can be applied to various properties.
 */
export class PropertyEditorRegistry {
  private editors: IPropertyEditor<any>[] = [];

  public insert(editor: IPropertyEditor<any>) {
    this.editors.splice(0, 0, editor);
  }

  public add(editor: IPropertyEditor<any>) {
    this.editors.push(editor);
  }

  public findEditorFor(property: IPropertyInfo) {
    for (let editor of this.editors) {
      if (editor.canProcess(property)) {
        return editor;
      }
    }

    throw new Error(
      `No editor found for property` +
        `\r\n\t id          : ${property.id}` +
        `\r\n\t propertyType: ${PropertyType[property.propertyType]} (${property.propertyType})` +
        `\r\n\t displayName : ${property.displayName}`,
    );
  }
}

/**
 * The arguments to provide when a JSX wants to re-render.
 */
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
  wrapped: IInstancedProperty<T>,
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

/**
 * Check to make sure that the element is still in the document.
 */
export function isAttached(element: HTMLElement): boolean {
  // it's possible through rapid undo/redo that we'll get input events to this item while it's unattached,
  // - if that occurs bail out so that we don't generate a useless undo event
  return document.contains(element);
}
