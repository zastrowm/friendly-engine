import { Component, h } from '@stencil/core';


@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot {

  render() {
    return (
      <div>
        <header>
          <h1>Web HMI Builder</h1>
        </header>

        <main>
          <div>
            <design-editor />
          </div>
        </main>
      </div>
    );
  }
}
