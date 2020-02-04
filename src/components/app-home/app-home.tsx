import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  shadow: false,
})
export class AppHome {
  render() {
    let designerEditorStyle = { position: 'absolute', width: '400px', height: '400px' };

    return (
      <div class="app-home">
        <design-editor style={designerEditorStyle}></design-editor>

        <p>
          Welcome to the Stencil App Starter! You can use this starter to build entire apps all with
          web components using Stencil! Check out our docs on{' '}
          <a href="https://stenciljs.com">stenciljs.com</a> to get started.
        </p>

        <stencil-route-link url="/profile/stencil">
          <button>Profile page</button>
        </stencil-route-link>
      </div>
    );
  }
}
