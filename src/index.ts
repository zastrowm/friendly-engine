import { DesignApp } from './components/design/design-app';
import { DesignSurfaceElement } from './components/design/design-surface';
import { DragHandle } from './components/design/drag-handle';
import { ControlContainer } from './components/design/control-container';
import { ControlEditor } from './components/design/control-editor';
import { PropertyPanelElement } from './components/design/property-panel';
import { getCustomElementNames } from '../lib/friendlee/CustomHtmlElement';

// @ts-ignore
function keys<T>(): string[] {
  return [];
}

interface Props {
  id: string;
  name: string;
  age: number;
}
const keysOfProps = keys<Props>();

console.log(keysOfProps); // ['id', 'name', 'age']

let global: { tagCount: number } = window as any;

(async () => {
  let arr = [DesignApp, DesignSurfaceElement, DragHandle, ControlContainer, ControlEditor];
  console.log(arr.length);

  if (global.tagCount == arr.length) {
    return;
  }

  global.tagCount = arr.length;

  let customElementNames = Array.from(getCustomElementNames());

  await Promise.all(customElementNames.map(name => customElements.whenDefined(name)));
  await customElements.whenDefined(PropertyPanelElement.tagName);

  document.body.append(document.createElement('design-app'));
})();

declare var module: any;

if (module.hot) {
  module.hot.accept(function() {
    console.log('index');
  });
}
