import React, { useCallback, useEffect } from 'react';
import './App.css';
import { DesignCanvas } from './DesignCanvas';
import { observer } from 'mobx-react';
import { EditorAppViewModel, IApplicationHost, ICopyPasteContents } from '../viewmodels/EditorAppViewModel';
import { PropertiesPanel } from './PropertiesPanel';
import hotkeys from 'hotkeys-js';


let browserHost = new (class implements IApplicationHost {

  private mimeTypeEngine = "engine/paste+data";
  private mimeTypePlain = "text/plain";

  public get shouldAutoLoad() {
    return true;
  }

  public copyToClipboard(contents: ICopyPasteContents): void {
    // https://gist.github.com/lgarron/d1dee380f4ed9d825ca7
    let listener = (e: ClipboardEvent) => {
      e.clipboardData!.setData(this.mimeTypePlain, contents.text);

      if (contents.data != null) {
        e.clipboardData!.setData(this.mimeTypeEngine, contents.data);
      }

      e.preventDefault();
    };

    try {
      document.addEventListener("copy", listener);
      document.execCommand("copy");
    } finally {
      document.removeEventListener("copy", listener);
    }
  }

  public retrieveData(e: ClipboardEvent): ICopyPasteContents | null {
    if (e.clipboardData == null) {
      return null;
    }

    let text = e.clipboardData.getData(this.mimeTypePlain);
    let data: string | null = e.clipboardData.getData(this.mimeTypeEngine);

    if (data === "") {
      return {
        text
      };
    } else {
      return {
        text,
        data
      };
    }
  }
})();


let editorVm = new EditorAppViewModel(browserHost);

let EditorApp = observer(function EditorApp() {

  let pasteCallback = useCallback((event: ClipboardEvent) => {
    let data = browserHost.retrieveData(event);
    if (data != null) {
      editorVm.paste(data);
    }
  }, []);

  useEffect(() => {
    const scopeName = 'app';

    const add = function (shortcut: string, callback: () => void) {
      hotkeys(shortcut, scopeName, (evt) => {
        callback();
        evt.preventDefault();
      });
    };

    add('ctrl+z', () => editorVm.undo());
    add('ctrl+y', () => editorVm.redo());
    add('ctrl+c', () => editorVm.copySelected());
    add('delete', () => editorVm.removeSelected());
    add('ctrl+n', () => editorVm.clearLayout());

    hotkeys.setScope(scopeName);

    (window as any).addEventListener("paste", pasteCallback);

    window.addEventListener("unload", () => {
      editorVm.shutdown();
    });

    return () => {
      hotkeys.deleteScope(scopeName);
      (window as any).removeEventListener("paste", pasteCallback);
    };
  }, [pasteCallback]);

  return (
    <div className="design-app">
      <header>
        <h1>Web App Builder</h1>
        {/* Render each control as a button that inserts it */}
        {editorVm.controls.descriptors.map((d) => (
          <button key={d.id} onClick={() => editorVm.addControl(d)}>
            Add {d.displayName}
          </button>
        ))}
        <button onClick={() => editorVm.removeSelected()}>Delete</button>
        <button onClick={() => editorVm.copySelected()}>Copy</button>
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
});

export default EditorApp;
