import React from 'react';
import './App.css';
import { DesignCanvas } from "./views/DesignCanvas";
import { observer } from "mobx-react"
import { ControlCollectionViewModel } from "./viewmodels/ControlCollectionViewModel";

let controlCollection = new ControlCollectionViewModel();

let App = observer(function App() {
  return (
    <div className="design-app">
      <header>
        <h1>Web App Builder</h1>
        {/* Render each control as a button that inserts it */}
        { controlCollection.descriptors.map(d =>
          <button key={d.id} onClick={() => controlCollection.addControl(d)}>Add {d.displayName}</button>
        ) }
        <button onClick={() => controlCollection.removeSelected()}>Delete</button>
        <button>Undo</button>
        <button>Redo</button>
        <button onClick={() => controlCollection.saveLayout('manual')}>Save Layout</button>
        <button onClick={() => controlCollection.loadLayout('manual')}>Load Layout</button>
        <button onClick={() => controlCollection.clearLayout()}>Reset Canvas</button>
      </header>
      <main>
        <div>
          <DesignCanvas layout={controlCollection} />
        </div>
      </main>
      <aside>
        <div>Panel</div>
      </aside>
    </div>
  );
})

export default App;
