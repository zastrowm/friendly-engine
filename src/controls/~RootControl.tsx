import {
  Control,
  implementProperty,
  IControlDescriptor,
  ReflectionBasedDescriptor, IControlSerializedData,
} from './@control';
import { BackgroundColorProperty } from './@properties';
import { UniqueId } from "../util/UniqueId";

export class RootControl extends Control {
  private readonly containerElement: HTMLDivElement;

  public static rootId: UniqueId = '~root' as any;

  constructor() {
    super();

    this.id = RootControl.rootId;
    this.containerElement = document.createElement('div');
    this.setRoot(this.containerElement);
  }

  @implementProperty(BackgroundColorProperty, (c: RootControl) => c.containerElement)
  public backgroundColor!: string;

  /* override */
  public deserialize(data: IControlSerializedData) {
    this.deserializeProperties(data.properties);
  }

  public get descriptor(): IControlDescriptor<RootControl> {
    return rootControlDescriptor;
  }
}

export let rootControlDescriptor = new ReflectionBasedDescriptor('rootControl', '~', RootControl, undefined, {
  supportsMovement: false
});
