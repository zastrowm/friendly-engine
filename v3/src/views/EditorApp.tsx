import React from 'react';
import './App.css';
import { DesignCanvas } from "./DesignCanvas";
import { observer } from "mobx-react"
import { EditorAppViewModel } from "../viewmodels/EditorAppViewModel";
import { PropertiesPanel } from "./PropertiesPanel";

let editorVm = new EditorAppViewModel();

let EditorApp = observer(function EditorApp() {
  return (
    <div className="design-app">
      <header>
        <h1>Web App Builder</h1>
        {/* Render each control as a button that inserts it */}
        { editorVm.controls.descriptors.map(d =>
          <button key={d.id} onClick={() => editorVm.addControl(d)}>Add {d.displayName}</button>
        ) }
        <button onClick={() => editorVm.removeSelected()}>Delete</button>
        <button onClick={() => editorVm.undo()}>Undo</button>
        <button onClick={() => editorVm.redo()}>Redo</button>
        <button onClick={() => editorVm.saveLayout('manual')}>Save Layout</button>
        <button onClick={() => editorVm.loadLayout('manual')}>Load Layout</button>
        <button onClick={() => editorVm.clearLayout()}>Reset Canvas</button>
      </header>
      <main>
        <div>
          <DesignCanvas app={editorVm} />
        </div>
      </main>
      <aside>
        <PropertiesPanel app={editorVm} />
      </aside>
    </div>
  );
})

export default EditorApp;
