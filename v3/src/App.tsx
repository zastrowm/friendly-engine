import React from 'react';
import './App.css';
import { DesignCanvas } from "./Views/DesignCanvas";

function App() {
  return (
    <div className="design-app">
      <header>
        <h1>Web App Builder</h1>
        {/* Render each control as a button that inserts it */}
        {/*{Array.from(this.descriptors.getDescriptors()).map((d) => (*/}
        {/*  <button onClick={() => this.addControl(d)}>Add {d.displayName}</button>*/}
        {/*))}*/}
        <button>Delete</button>
        <button>Undo</button>
        <button>Redo</button>
        <button>Save Layout</button>
        <button>Load Layout</button>
        <button>Reset Canvas</button>
      </header>
      <main>
        <div>
          <DesignCanvas />
        </div>
      </main>
      <aside>
        <div>Panel</div>
      </aside>
    </div>
  );
}

export default App;
