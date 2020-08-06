/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

import React from 'react';
import ReactDOM from 'react-dom';

import 'mobx-react-lite/batchingForReactDom'
import './index.css';
import EditorApp from './views/EditorApp';
import * as serviceWorker from './serviceWorker';

import '@fortawesome/fontawesome-free/css/all.min.css';
import { setPortalElement } from "./views/Portal";

setPortalElement(document.getElementById("react-root-DialogPortal")!);

ReactDOM.render(
  <React.StrictMode>
    <EditorApp />
  </React.StrictMode>,
  document.getElementById('react-root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
