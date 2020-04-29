import { ControlContainer } from 'src/components/design/control-container.e';
import { setPropertyUndoRedo } from './editors/_shared';
import { ComponentChild, render } from '@friendly/elements/jsxElements';

declare class Control {}

interface JsxEditorRefreshArguments<T> {
  old: T;
  new: T;
  canMerge?: boolean;
}

export interface IPropertyEditor {
  elementToMount: HTMLElement;
}

let data = new Map<any, ControlProperty<any>[]>();

export function controlProperty(property: ControlProperty<any>) {
  return function (target: any, propertyKey: string) {
    let existing = data.get(target);
    if (existing == null) {
      existing = [];
      data.set(target, existing);
    }

    existing.push(property);

    Object.defineProperty(target, propertyKey, {
      get: function () {
        return property.getValue(this);
      },

      set: function (value) {
        property.setValue(this, value);
      },
    });
  };
}

export function getControlPropertiesFor(controlConstructor: any) {
  return data.get(controlConstructor);
}

/**
 * Base class for a property descriptor
 */
export abstract class ControlProperty<T> {
  /* The callback which retrieves the actual element where the property value can be set and retrieved */
  protected _callback: (element: any) => HTMLElement;

  constructor(callback: (element: any) => HTMLElement) {
    this._callback = callback;
  }

  /* The id of the property */
  public abstract id: string;

  /* This human-readable name of the property */
  public abstract displayName: string;

  /* Gets the value from the control */
  public getValue(control: Control): T {
    return this.getValueRaw(this._callback(control));
  }

  /* Sets the value for control */
  public setValue(control: Control, value: T) {
    this.setValueRaw(this._callback(control), value);
  }

  protected abstract getValueRaw(e: HTMLElement): T;
  protected abstract setValueRaw(e: HTMLElement, value: T): void;
  protected abstract hasDefaultValueRaw(e: HTMLElement): boolean;

  /* inheritdoc */
  abstract getEditor(instance: ControlContainer): IPropertyEditor;

  /** True if the value for this property is the default */
  public hasDefaultValue(control: Control): boolean {
    return this.hasDefaultValueRaw(this._callback(control));
  }

  /**
   * Creates an editor that uses JSX to provide the contents.
   * @param instance the instance for which the editor is valid
   * @param callback a callback that can be used to re-render the editor
   * @returns an IPropertyEditor that edits the given property
   */
  protected createJsxEditor(
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
}
