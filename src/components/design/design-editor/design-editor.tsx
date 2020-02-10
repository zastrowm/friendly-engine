import { Component, h, Host, Method, Prop } from '@stencil/core';
import { Element } from '@stencil/core';
import { IStoredPositionInfo } from '../../../api/layout';

@Component({
  tag: 'design-editor',
  styleUrl: 'design-editor.css',
})
export class DesignEditor {
  @Element()
  private host: HTMLElement;

  @Prop()
  public helpers: {
    activeEditor: HTMLControlEditorElement;
  };

  constructor() {
    // TODO handle failures

    this.helpers = {
      activeEditor: document.createElement('control-editor'),
    };

    (async () => {
      try {
        await this.addControl('button', {
          left: 20,
          top: 70,
          width: 100,
          height: 100,
        });
        await this.addControl('button', {
          right: 20,
          top: 100,
          width: 100,
          height: 100,
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }

  async addButton() {
    await this.addControl('button', {
      left: 20,
      top: 20,
      width: 40,
      height: 60,
    });
  }

  @Method()
  public async addControl(name: string, layoutInfo: IStoredPositionInfo) {
    await customElements.whenDefined('control-container');

    let controlContainer = document.createElement('control-container');
    controlContainer.positionInfo = layoutInfo;

    let nestedControl = document.createElement(name);
    nestedControl.textContent = 'This is a ' + name;
    controlContainer.appendChild(nestedControl);

    this.host.appendChild(controlContainer);
  }

  public render() {
    return (
      <Host>
        <button onClick={() => this.addButton()}>Click to add</button>
      </Host>
    );
  }
}
