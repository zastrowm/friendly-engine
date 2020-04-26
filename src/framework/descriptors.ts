export abstract class Control {
  protected abstract initialize(): HTMLElement;
  protected target: HTMLElement | null;

  public abstract get descriptor(): Descriptor<Control>;
}

export abstract class ControlProperty<TValue> {
  id: string;
  displayName: string;

  callback: (element: any) => HTMLElement;

  constructor(callback: (element: any) => HTMLElement) {
    this.callback = callback;
  }

  abstract getValue(element: HTMLElement): TValue;
  abstract setValue(element: HTMLElement, value: TValue);
}

export function controlProperty(property: ControlProperty<any>);
export function controlProperty(displayName: string, id: string);
export function controlProperty(displayName: string, id: string, callback: (element: any) => any);

export function controlProperty(first: ControlProperty<any> | string, second?: string) {
  return function (target: any, key: string) {
    console.log(first, second, target, key);
  };
}

export abstract class Descriptor<T extends Control> {
  public abstract create(): T;
}

export class ReflectionBasedDescriptor<T extends Control> extends Descriptor<T> {
  constructor(private readonly typeDef: new () => T) {
    super();
  }

  public create(): T {
    return new this.typeDef();
  }
}
