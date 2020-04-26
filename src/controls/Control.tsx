import { IControlDescriptor } from 'src/framework/controlsRegistry';
import { ControlContainer } from 'src/components/design/control-container.e';
import { setPropertyUndoRedo } from './editors/_shared';
import { ComponentChild, render } from '@friendly/elements/jsxElements';

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
  return function (target: any, key: string) {
    let existing = data.get(target);
    if (existing == null) {
      existing = [];
      data.set(target, existing);
    }

    existing.push(property);
    // TODO define property on the class itself

    console.log('Adding property', target, key);
  };
}

export function getControlPropertiesFor(controlConstructor: any) {
  return data.get(controlConstructor);
}

/**
 * Base class for a property descriptor
 */
export abstract class ControlProperty<T> {
  abstract id: string;

  abstract displayName: string;

  callback: (element: any) => HTMLElement;

  constructor(callback: (element: any) => HTMLElement) {
    this.callback = callback;
  }

  public getValue(control: Control): T {
    return this.getValueRaw(this.callback(control));
  }

  public setValue(control: Control, value: T) {
    this.setValueRaw(this.callback(control), value);
  }

  protected abstract getValueRaw(e: HTMLElement): T;
  protected abstract setValueRaw(e: HTMLElement, value: T): void;

  /* inheritdoc */
  abstract getEditor(instance: ControlContainer): IPropertyEditor;

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
          id: instance.uniqueId,
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

/** Base class for all controls that can be created */
export abstract class Control {
  public createElement(): HTMLElement {
    return this.initialize();
  }

  protected abstract initialize(): HTMLElement;
  protected target: HTMLElement | null;

  public abstract get descriptor(): IControlDescriptor<Control>;
}
