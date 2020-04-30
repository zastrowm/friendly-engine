import { getCustomElementNames } from '@friendly/elements/CustomHtmlElement';
import {config} from "./runtime";

declare var require: any;

if (config.isProduction()) {
  console.log("Running Production");
} else if (config.isDevelopment()) {
  console.log("Running Development");
}

async function waitForCustomElements() {
  /*
   * Import all "*.e.tsx" element files automatically, preventing the application from starting until all custom elements
   * have loaded
   */
  // function from https://webpack.js.org/guides/dependency-management/#context-module-api
  let importAll = (r) => r.keys().forEach(r);
  importAll(require.context('./components/', /*includeSubdirs*/ true, /\.e\.tsx$/, /*mode*/ 'eager'));

  let customElementNames = Array.from(getCustomElementNames());

  await Promise.all(customElementNames.map((name) => customElements.whenDefined(name)));
}

window.addEventListener('load', async () => {
  await waitForCustomElements();

  document.body.append(document.createElement('design-app'));
});
