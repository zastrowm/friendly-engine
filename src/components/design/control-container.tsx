import { determineEditStyle } from '../../framework/positioner';
import { IStoredPositionInfo } from '../../framework/layout';
import { DesignSurfaceElement } from './design-surface';
import { CustomHtmlElement } from '../../../lib/friendlee/CustomHtmlElement';
import { IControlDescriptor, IControlSerializedData } from '../../framework/controlsRegistry';

type UniqueId = string;

export class ControlContainer extends CustomHtmlElement {
  constructor() {
    super();
  }

  public descriptor: IControlDescriptor;

  public get uniqueId(): UniqueId {
    return this._uniqueId;
  }

  public set uniqueId(value: UniqueId) {
    this._uniqueId = value;
    this.setAttribute('unique-id', value);
  }

  private _uniqueId: UniqueId;

  /**
   * Populate the container with the data provided.
   */
  public deserialize(descriptor: IControlDescriptor, data: IControlSerializedData) {
    this.descriptor = descriptor;
    this.positionInfo = data.position;
    this.uniqueId = data.id;

    let nestedControl = this.descriptor.createInstance();
    nestedControl.textContent = 'This is a ' + this.descriptor.id;

    // since we're deserializing, make sure we don't have existing content
    this.firstChild?.remove();

    this.appendChild(nestedControl);
  }

  /**
   * Get the data from the control so that it can be serialized.
   */
  public serialize(): IControlSerializedData {
    return {
      id: this.uniqueId,
      position: this.positionInfo,
      properties: {},
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

    this.addEventListener('mousedown', e => this.onMouseDown(e));
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

window.customElements.define('control-container', ControlContainer);
