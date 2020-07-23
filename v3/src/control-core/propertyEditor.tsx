import { UniqueId } from '../util/UniqueId';
import { IPropertyInfo, PropertyType, IControlProperty } from './controlProperties';
import { ReactNode } from "react";

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
  setValue(value: T): void;

  /** The property that is being edited **/
  property: IControlProperty;
}

/** basic priorities to apply to IPropertyEditors */
export let editorPriorities = {
  high: 100,
  medium: 50,
  normal: 0,
  low: -50,
  fallback: -100,
};

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
  createEditorFor(wrapped: IInstancedProperty<T>): ReactNode;

  /**
   * The priority of the given editor, relative to other editors.  If not present,
   * editorPriorities.normal is assumed
   */
  priority?: number;
}

/**
 * Contains a collection of editors that can be applied to various properties.
 */
export class PropertyEditorRegistry {
  private _editors: IPropertyEditor<any>[] = [];
  private _needsSorting: boolean = false;

  public insert(editor: IPropertyEditor<any>) {
    this._needsSorting = true;
    this._editors.splice(0, 0, editor);
  }

  public add(editor: IPropertyEditor<any>) {
    this._needsSorting = true;
    this._editors.push(editor);
  }

  public findEditorFor(property: IPropertyInfo) {
    if (this._needsSorting) {
      // sort the editors so that higher numbered editors are at the top of the list
      this._editors.sort(function (a, b) {
        let aPriority = a.priority ?? editorPriorities.normal;
        let bPriority = b.priority ?? editorPriorities.normal;

        return bPriority - aPriority;
      });

      this._needsSorting = false;
    }

    for (let editor of this._editors) {
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

// /**
//  * Creates an editor that uses JSX to provide the contents.
//  * @param wrapped the instance for which the editor is valid
//  * @param callback a callback that can be used to re-render the editor
//  * @returns an IPropertyEditor that edits the given property
//  */
// export function createJsxEditor<T>(
//   wrapped: IInstancedProperty<T>,
//   callback: (refreshCallback: (arg?: JsxEditorRefreshArguments<T>) => void) => ReactNode,
// ): HTMLElement {
//   let element = document.createElement('span');
//
//   // callback that can be used to force JSX to re-render
//   let invalidateCallback = (data?: JsxEditorRefreshArguments<T>) => {
//     // if they passed in options, that means we should trigger an undo event
//     if (data != null) {
//       wrapped.setValue(data.new);
//
//       // setPropertyUndoRedo.trigger(element, {
//       //   id: wrapped.id,
//       //   property: wrapped.property,
//       //   originalValue: data.old,
//       //   newValue: data.new,
//       //   canMerge: data?.canMerge ?? false,
//       // });
//     }
//
//     // actually re-render
//     let jsx = callback(invalidateCallback);
//     render(jsx, element);
//   };
//
//   // first time rendering
//   invalidateCallback();
//
//   return element;
// }

/**
 * Check to make sure that the element is still in the document.
 */
export function isAttached(element: HTMLElement): boolean {
  // it's possible through rapid undo/redo that we'll get input events to this item while it's unattached,
  // - if that occurs bail out so that we don't generate a useless undo event
  return document.contains(element);
}
