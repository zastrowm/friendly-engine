import React from 'react';
import './App.css';
import { DesignCanvas } from "./views/DesignCanvas";
import { observer } from "mobx-react"
import { LayoutViewModel } from "./viewmodels/LayoutViewModel";

let layout = new LayoutViewModel();

let App = observer(function App() {
  return (
    <div className="design-app">
      <header>
        <h1>Web App Builder</h1>
        {/* Render each control as a button that inserts it */}
        { layout.descriptors.map(d =>
          <button key={d.id} onClick={() => layout.addControl(d)}>Add {d.displayName}</button>
        ) }
        <button>Delete</button>
        <button>Undo</button>
        <button>Redo</button>
        <button onClick={() => layout.saveLayout('manual')}>Save Layout</button>
        <button onClick={() => layout.loadLayout('manual')}>Load Layout</button>
        <button onClick={() => layout.clearLayout()}>Reset Canvas</button>
      </header>
      <main>
        <div>
          <DesignCanvas layout={layout} />
        </div>
      </main>
      <aside>
        <div>Panel</div>
      </aside>
    </div>
  );
})

export default App;
