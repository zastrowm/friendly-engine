import { IControlDescriptor } from './controlMetadata';
import { Control } from '../Control';

type LocalizedString = string;

export enum PropertyType {
  unknown,
  string = 1 << 1,
  number = 1 << 2,
  enum = 1 << 3,
  boolean = 1 << 4,
}

interface IPropertyInfo {
  id: string;
  displayName: LocalizedString;
  propertyType: PropertyType;
}

interface IGetSetProperty<TOrigin, T> {
  getValue(state: TOrigin): T;
  setValue(state: TOrigin, value: T);
}

export interface IOwnedProperty<TState, T> extends IPropertyInfo, IGetSetProperty<TState, T> {
  getEditor?: (instance: ControlContainer) => IPropertyEditor;
}

type Transformer<TFrom, TTo> = (state: TFrom) => TTo;

/**
 * Creates a property of the form IOwnedProperty<TState, TTo> by wrapping an existing property that operates on TFrom
 * to TTo by using a callback to transform TState into TFrom.
 */
class WrappedProperty<TState, TFrom, TTo> implements IOwnedProperty<TState, TTo> {
  constructor(private getter: Transformer<TState, TFrom>, private property: IOwnedProperty<TFrom, TTo>) {}

  get displayName(): LocalizedString {
    return this.property.displayName;
  }

  get id(): string {
    return this.property.id;
  }

  get propertyType(): PropertyType {
    return this.property.propertyType;
  }

  getValue(state: TState): TTo {
    return this.property.getValue(this.getter(state));
  }

  setValue(state: TState, value: TTo) {
    return this.property.setValue(this.getter(state), value);
  }
}

export function createControlDefinition<TControl extends IControl, TState>(data: {
  id: string;
  displayName: LocalizedString;
  factory: () => TState;
}): IStateCreator<TControl, TState> {
  return new NewControlDescriptor(data.id, data.displayName, data.factory);
}

class NewControlDescriptor implements IStateCreator<any, any> {
  // @ts-ignore
  private readonly _stateFactory: () => any;

  // @ts-ignore
  private readonly _id: string;
  // @ts-ignore
  private readonly _displayName: LocalizedString;
  // @ts-ignore
  private _generatedClass;

  private _properties: IOwnedProperty<any, any>[];

  constructor(id: string, displayName: LocalizedString, stateFactory: () => any) {
    this._id = id;
    this._displayName = displayName;
    this._stateFactory = stateFactory;
  }

  defineProperties(callback: (stateDef: IStateDefinition<any>) => Propertyfied<any, any>): { new (): any } {
    if (this._properties != null) {
      throw new Error('Attempted to define properties when properties have already been defined');
    }

    this._properties = [];

    let factory = this._stateFactory;

    let theClass = class {
      // @ts-ignore
      private __state: any;

      constructor() {
        this.__state = factory();
      }
    };

    let propertyBag = callback(this);
    for (let key in propertyBag) {
      let property: IOwnedProperty<any, any> = propertyBag[key];

      Object.defineProperty(theClass.prototype, key, {
        get(): any {
          return property.getValue(this.__state);
        },
        set(value: any) {
          property.setValue(this.__state, value);
        },
      });
    }

    this._generatedClass = theClass;
    return theClass;
  }

  compose<TFrom, TTo>(property: IOwnedProperty<TFrom, TTo>, getter: (test: any) => TFrom): IOwnedProperty<any, TTo>;
  compose<TTo, TKey extends keyof any>(property: IOwnedProperty<any, TTo>, key: TKey): IOwnedProperty<any, TTo>;
  compose(property, getter): IOwnedProperty<any, any> {
    if (typeof getter == 'string') {
      let key = getter;
      getter = function (state) {
        return state[key];
      };
    }

    return new WrappedProperty(getter, property);
  }
}

type Propertyfied<TState, T> = {
  [P in keyof T]: IOwnedProperty<TState, T[P]>;
};

export interface IStateDefinition<TState> {
  compose<TFrom, TTo>(
    property: IOwnedProperty<TFrom, TTo>,
    getter: (test: TState) => TFrom,
  ): IOwnedProperty<TState, TTo>;
  compose<TTo, TKey extends keyof TState>(
    property: IOwnedProperty<TState[TKey], TTo>,
    key: TKey,
  ): IOwnedProperty<TState, TTo>;
}

interface IStateCreator<TControlType extends Control, TState> extends IStateDefinition<TState> {
  defineProperties(
    callback: (stateDef: IStateDefinition<TState>) => Propertyfied<TState, TControlType>,
  ): IControlConstructor<TControlType>;
}

type IControlConstructor<TControlType extends Control> = (new () => TControlType) & {
  descriptor: IControlDescriptor<TControlType>;
};
