/**
 * A wrapper around an IProperty and a given source, allowing editors to focus merely on the value
 * and the property rather than where the property value is coming from.
 */
import React from "react";

import { UniqueId } from "../../util/UniqueId";
import { IControlProperty, IPropertyInfo, PropertyType } from "../../control-core/controlProperties";
import { UndoRedoQueueViewModel } from "../../viewmodels/UndoRedoQueueViewModel";
import { EditablePropertyViewModel } from "../../viewmodels/EditableControlPropertiesViewModel";

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

export interface IReactPropertyEditorArgs<T> {
  property: EditablePropertyViewModel<T>;
  undoRedoQueue: UndoRedoQueueViewModel;
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
  factory: React.FunctionComponent<IReactPropertyEditorArgs<T>>;

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
