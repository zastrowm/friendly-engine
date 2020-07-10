import {
  Control,
  IControlDescriptor,
  IControlSerializedData,
  implementProperty,
  ReflectionBasedDescriptor,
} from '@/control';
import { UniqueId } from '@/framework/util';
import { BackgroundColorProperty } from '@/control/standardProperties';

export class RootControl extends Control {
  private containerElement: HTMLDivElement;

  public static rootId: UniqueId = '~root' as any;

  constructor() {
    super();

    this.id = RootControl.rootId;
  }

  @implementProperty(BackgroundColorProperty, (c: RootControl) => c.containerElement)
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

export let rootControlDescriptor = new ReflectionBasedDescriptor('rootControl', '~', RootControl);
