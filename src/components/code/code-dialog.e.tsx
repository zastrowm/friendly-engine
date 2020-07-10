import { CustomHtmlJsxElement, customElement, h } from '@friendly/elements/CustomHtmlJsxElement';
import * as monaco from 'monaco-editor';

import './code-dialog.css';
import { addEventListenerAsync } from '@/framework/util';

// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
declare class ResizeObserver {
  constructor(callback: any);
  observe(element: HTMLElement);
  unobserve(element: HTMLElement);
  disconnect();
}

@customElement(CodeDialog.tagName)
export class CodeDialog extends CustomHtmlJsxElement {
  private _dialog: HTMLDialogElement;
  private _title: HTMLElement;
  private _editor: monaco.editor.IStandaloneCodeEditor;
  private _resizeObserver: ResizeObserver;
  private _didSave: boolean;
  private _didRender: boolean;

  constructor() {
    super();

    this._resizeObserver = new ResizeObserver(() => this.onResize());
    this._didRender = false;
  }

  public static readonly tagName = 'code-dialog';

  /** Creates an instance of the dialog with type safety. */
  public static createInstance(): CodeDialog {
    return document.createElement(CodeDialog.tagName);
  }

  /* override */
  public onDisconnected() {
    this._resizeObserver.disconnect();
  }

  /**
   * Pops up the dialog to the user allowing the user to edit the script
   * @param title the title to show to the user
   * @param code the code of the script to edit
   */
  public async showDialog(title: string, code: string): Promise<IEditCodeResult> {
    this.doRenderOnce();

    this._title.textContent = title;
    this._editor.setValue(code);
    this._dialog.showModal();

    this._resizeObserver.disconnect();
    this._resizeObserver.observe(this._dialog);

    await addEventListenerAsync(this._dialog, 'close');

    this._resizeObserver.disconnect();

    return {
      didSave: this._didSave,
      code: this._editor.getValue(),
    };
  }

  /** Renders the HTML of the dialog */
  private doRenderOnce() {
    if (this._didRender) {
      return;
    }

    let editorContainer: HTMLDivElement;

    this.renderJsx(
      <dialog ref={(self) => (this._dialog = self)}>
        <h1 ref={(self) => (this._title = self)} />
        <div class="code" ref={(it) => (editorContainer = it)} />
        <div class="actions">
          <button name="btnSave" onClick={() => this.onSave()}>
            Save
          </button>
          <button name="btnCancel" onClick={() => this.onCancel()}>
            Cancel
          </button>
        </div>
      </dialog>,
    );

    this._editor = monaco.editor.create(editorContainer, {
      value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
      theme: 'vs-dark',
      scrollbar: {
        vertical: 'visible',
      },
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      language: 'javascript',
    });

    this._didRender = true;
  }

  /** Called when the user clicks the save button. */
  private onSave(): void {
    this._didSave = true;
    this._dialog?.close();
  }

  /** Called when the user clicks the cancel button. */
  private onCancel(): void {
    this._didSave = false;
    this._dialog?.close();
  }

  /** Called when browser is resized */
  private onResize() {
    this._editor?.layout();
    console.log('resize');
  }
}

interface IEditCodeResult {
  didSave: boolean;
  code?: string;
}
