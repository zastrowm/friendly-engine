import { Control, controlProperty, IControlSerializedData } from './Control';
import { IControlDescriptor, ReflectionBasedDescriptor } from '../framework/controlRegistry';
import { BackgroundProperty } from './editors/Background';
import { UniqueId } from '../framework/util';

export class RootControl extends Control {
  private containerElement: HTMLDivElement;

  public static rootId: UniqueId = '~root' as any;

  constructor() {
    super();

    this.id = RootControl.rootId;
  }

  @controlProperty(new BackgroundProperty((c: RootControl) => c.containerElement))
  public backgroundColor: string;

  protected initialize(): HTMLElement {
    this.containerElement = document.createElement('div');
    return this.containerElement;
  }

  /* override */
  public deserialize(data: IControlSerializedData) {
    this.deserializeProperties(data.properties);
  }

  public get descriptor(): IControlDescriptor<RootControl> {
    return rootControlDescriptor;
  }
}

export let rootControlDescriptor = new ReflectionBasedDescriptor('rootControl', RootControl);
