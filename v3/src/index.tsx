import React from 'react';
import ReactDOM from 'react-dom';

import 'mobx-react-lite/batchingForReactDom'
import './index.css';
import EditorApp from './views/EditorApp';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <EditorApp />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
