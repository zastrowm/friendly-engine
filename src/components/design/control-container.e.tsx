import { determineEditStyle } from '../../framework/positioner';
import { IStoredPositionInfo } from '../../framework/layout';
import { DesignSurfaceElement } from './design-surface.e';
import { CustomHtmlElement, customElement, property } from '@friendly/elements/CustomHtmlElement';
import {
  IControlDescriptor,
  IControlSerializedData,
  serializeProperties,
  deserializeProperties,
  Control,
} from '../../framework/controlsRegistry';
import { UniqueId } from '../../framework/util';

@customElement(ControlContainer.tagName)
export class ControlContainer extends CustomHtmlElement {
  public static readonly tagName = 'control-container';

  constructor() {
    super();
  }

  public descriptor: IControlDescriptor;

  @property({ attributeName: 'unique-id' })
  public uniqueId: UniqueId;

  public control: Control;

  public get rawElement(): HTMLElement {
    return this.firstElementChild as HTMLElement;
  }

  /**
   * Populate the container with the data provided.
   */
  public deserialize(descriptor: IControlDescriptor, data: IControlSerializedData) {
    this.descriptor = descriptor;
    this.positionInfo = data.position;
    this.uniqueId = data.id;

    this.control = this.descriptor.createInstance();
    this.appendChild(this.control.createElement());

    deserializeProperties(this.descriptor, this, data.properties);
  }

  /**
   * Get the data from the control so that it can be serialized.
   */
  public serialize(): IControlSerializedData {
    return {
      id: this.uniqueId,
      position: this.positionInfo,
      properties: serializeProperties(this.descriptor, this),
      typeId: this.descriptor.id,
    };
  }

  public get positionInfo(): IStoredPositionInfo {
    return this._positionInfo;
  }

  public set positionInfo(value: IStoredPositionInfo) {
    this._positionInfo = value;

    if (!this.isConnected) {
      return;
    }

    let anchorAndBoundary = determineEditStyle(this.positionInfo, this.parentElement);
    anchorAndBoundary.boundaries.applyTo(this);
  }

  private _positionInfo: IStoredPositionInfo;

  // the designer that we're attached to
  private designCanvas: DesignSurfaceElement;

  public onFirstConnected() {
    this.classList.add('control-container');

    let anchorAndBoundary = determineEditStyle(this.positionInfo, this.parentElement);

    anchorAndBoundary.boundaries.applyTo(this);

    this.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.designCanvas = this.closest(DesignSurfaceElement.tagName);
  }

  /**
   * On mouse down if we're not the active editor, make ourselves the active editor.  Then
   * pass the mouse event down into the editor.
   */
  public async onMouseDown(mouseEvent: MouseEvent) {
    this.designCanvas.selectAndMarkActive(this, mouseEvent);
  }
}
