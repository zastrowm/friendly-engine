import { ControlContainer } from 'src/components/design/control-container.e';
import { setPropertyUndoRedo } from './editors/_shared';
import { ComponentChild, render } from '@friendly/elements/jsxElements';
import { RequireAllProperties, UniqueId } from '../framework/util';

declare class Control {}

// TODO remove
interface JsxEditorRefreshArguments<T> {
  old: T;
  new: T;
  canMerge?: boolean;
}

// TODO remove
export interface IPropertyEditor {
  elementToMount: HTMLElement;
}

let data = new Map<any, ControlProperty<any>[]>();

// TODO remove
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

type LocalizedString = string;

/**
 * Defines the raw type of properties that are allowed to be configured
 */
export enum PropertyType {
  unknown,
  string = 1 << 1,
  number = 1 << 2,
  enum = 1 << 3,
  boolean = 1 << 4,
}

/**
 * Typescript Decorator which allows specifying a property to be defined in such a way that the html-element
 * retrieved via `callback` is passed into `property` for all operations
 * @param property the html-based property that should be delegated to
 * @param callback a callback which retrieves an HtmlElement from the control
 */
export function implementProperty<TOwner, TPropertyType>(
  property: IProperty<HTMLElement, TPropertyType>,
  callback: (element: TOwner) => HTMLElement,
) {
  return function (target: any, propertyKey: string) {
    let existing = data.get(target);
    if (existing == null) {
      existing = [];
      data.set(target, existing);
    }

    // TODO remove ControlProperty in its entirety
    existing.push(new DelegatedControlProperty(property, callback));

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
 * Non-generic information about a property.  If typed, `IProperty` is more useful
 */
export interface IPropertyInfo {
  /** An id of the property that must be unique across the class that contains the property. */
  id: string;
  /** A human readable description of the property */
  displayName: LocalizedString;
  /** The type of the property*/
  // TODO make non-optional
  propertyType?: PropertyType;
}

/**
 * A property whose value can be gotten and set on a given instance of a given class.
 */
export interface IProperty<TOwner, TPropertyType> extends IPropertyInfo {
  /** Gets the value from the instance */
  getValue(owner: TOwner): TPropertyType;
  /** Sets the value on the instance */
  setValue(owner: TOwner, value: TPropertyType);
  /** Serializes the value from the instance - may returned undefined */
  // TODO make non-optional
  serializeValue?: (data: TOwner) => TPropertyType;
}

// TODO remove
export interface IContainerProperty<T> {
  id: UniqueId;
  getValue(): T;
  setValue(value: T);
  property: IPropertyInfo;
}

/**
 * Base class for a property descriptor
 */
export abstract class ControlProperty<T> implements IProperty<Control, T> {
  /* The callback which retrieves the actual element where the property value can be set and retrieved */
  protected _callback: (element: any) => HTMLElement;

  constructor(callback: (element: any) => HTMLElement) {
    this._callback = callback;
  }

  /* The id of the property */
  public abstract readonly id: string;

  /* This human-readable name of the property */
  public abstract readonly displayName: string;

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

// TODO remove
class DelegatedControlProperty<T> extends ControlProperty<T>
  implements RequireAllProperties<IProperty<HTMLElement, T>> {
  constructor(private property: IProperty<HTMLElement, T>, private callback: (element: Control) => HTMLElement) {
    super(callback);
  }

  get id() {
    return this.property.id;
  }

  get displayName() {
    return this.property.displayName;
  }

  protected hasDefaultValueRaw(e: HTMLElement): boolean {
    return false;
  }

  protected getValueRaw(e: HTMLElement): T {
    return this.property.getValue(e);
  }

  protected setValueRaw(e: HTMLElement, value: T) {
    this.property.setValue(e, value);
  }

  getEditor(instance: ControlContainer): IPropertyEditor {
    return null;
  }

  get propertyType(): PropertyType {
    return this.property.propertyType;
  }

  serializeValue(data: HTMLElement): T {
    return this.property.serializeValue(data);
  }
}
