import { Component, h, Host } from '@stencil/core';
import { Element } from '@stencil/core';

@Component({
  tag: 'design-editor',
  styleUrl: 'design-editor.css',
})
export class DesignEditor {
  @Element()
  host: HTMLElement;

  addButton() {
    let controlContainer = document.createElement("control-container");
    controlContainer.positionInfo = {
      left: 20,
      top: 20,
      width: 40,
      height: 60
    };
    let button = document.createElement("button");
    button.textContent = "Dynamically Added!";
    controlContainer.appendChild(button);

    this.host.appendChild(controlContainer);
  }

  render() {
    let firstButtonPosition = {
      left: 20,
      top: 70,
      width: 100,
      height: 100,
    };

    let secondButtonPosition = {
      right: 20,
      top: 100,
      width: 100,
      height: 100,
    };

    return (
      <Host>
        <button onClick={() => this.addButton()}>Click to add</button>
        <control-container positionInfo={firstButtonPosition}>
          <button>This is a button</button>
        </control-container>

        <control-container positionInfo={secondButtonPosition}>
          <button>This is a button</button>
        </control-container>
      </Host>
    );
  }
}

