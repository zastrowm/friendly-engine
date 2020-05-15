import { IControlDescriptor } from "./commonControls";

type LocalizedString = string;

export enum PropertyType {
  unknown,
  string = 1 << 1,
  number = 1 << 2,
  enum = 1 << 3,
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
  getEditor?: any;
}

class WrappedProperty<TState, TFrom, TTo> implements IOwnedProperty<TState, TTo> {

  constructor(private getter: (state: TState) => TFrom, private property: IOwnedProperty<TFrom, TTo>) {
  }

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


interface IControlDefinition<TControlType> {
  withFactory<TState>(stateCreator: () => TState): IStateCreator<TControlType, TState>;
}

export function createControlDefinition<T>(data: { id: string; displayName: LocalizedString }): IControlDefinition<T> {
  return new NewControlDescriptor(data.id, data.displayName);
}

class NewControlDescriptor implements IControlDefinition<any>, IStateCreator<any, any> {

  // @ts-ignore
  private _stateFactory: () => any;
  // @ts-ignore
  private _id: string;
  // @ts-ignore
  private _displayName: LocalizedString;
  // @ts-ignore
  private _generatedClass;

  private _properties: IOwnedProperty<any, any>[];

  constructor(id: string, displayName: LocalizedString) {
    this._id = id;
    this._displayName = displayName;

  }

  withFactory<TState>(stateFactory: () => TState): IStateCreator<any, TState> {
    if (this._stateFactory != null) {
      throw new Error("Attempted to set a factory when one has already been set");
    }

    this._stateFactory = stateFactory;

    return this;
  }

  defineProperties(callback: (stateDef: IStateDefinition<any>) => Propertyfied<any, any>): { new(): any } {
    if (this._properties != null) {
      throw new Error("Attempted to define properties when properties have already been defined");
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
        }
      })
    }

    this._generatedClass = theClass;
    return theClass;
  }

  compose<TFrom, TTo>(property: IOwnedProperty<TFrom, TTo>, getter: (test: any) => TFrom): IOwnedProperty<any, TTo>;
  compose<TTo, TKey extends keyof any>(property: IOwnedProperty<any, TTo>, key: TKey): IOwnedProperty<any, TTo>;
  compose(property, getter): IOwnedProperty<any, any> {
    if (typeof getter == "string") {
      let key = getter;
      getter = function(state) { return state[key] };
    }

    return new WrappedProperty(getter, property);
  }
}

type Propertyfied<TState, T> = {
  [P in keyof T]: IOwnedProperty<TState, T[P]>;
};

export interface IStateDefinition<TState> {
  compose<TFrom, TTo>(property: IOwnedProperty<TFrom, TTo>, getter: (test: TState) => TFrom): IOwnedProperty<TState, TTo>;
  compose<TTo, TKey extends keyof TState>(property: IOwnedProperty<TState[TKey], TTo>, key: TKey): IOwnedProperty<TState, TTo>;
}

interface IStateCreator<TControlType, TState> extends IStateDefinition<TState> {
  defineProperties(
    callback: (stateDef: IStateDefinition<TState>) => Propertyfied<TState, TControlType>,
  ): new () => TControlType;
}
