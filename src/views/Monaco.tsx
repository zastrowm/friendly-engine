/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />

import React, { useEffect, useState } from "react";
import { asWritable } from "../util/util";

// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
declare class ResizeObserver {
  constructor(callback: any);
  observe(element: HTMLElement): any;
  unobserve(element: HTMLElement): any;
  disconnect(): any;
}

/** hack require so that we can use it to load monaco */
let require = window["require"] as any

let monacoLibs = new (class {
  private _promise: Promise<null> | null = null;

  public isMonacoLoaded = false;

  public getOrStartPromise(): Promise<null> {
    if (this._promise == null) {
      this._promise = new Promise<null>((resolve) => {
        require(["vs/editor/editor.main"], () => {
          this.isMonacoLoaded = true;
          resolve(null);
        });
      });
    }

    return this._promise;
  }
})();

/** The properties to CodeEditor */
interface ICodeEditorProps {
  code: string;
  codeGetter: React.RefObject<() => string>;
}

/**
 * Monaco based code editor
 */
export function CodeEditor(props: ICodeEditorProps) {
  let [isLoaded, setIsLoaded] = useState<boolean>(monacoLibs.isMonacoLoaded);

  useEffect(() => {
    if (isLoaded)
      return;

    let isValid = true;

    (async function() {
      await monacoLibs.getOrStartPromise();

      if (isValid) {
        setIsLoaded(true);
      }
    })();

    return () => { isValid = false; };
    // we only want trigger isLoaded if it wasn't already loaded, so we don't care that it's used inside of the effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoaded) {
    return <div>Loading Editor...</div>
  }

  return <CodeEditorImplementation code={props.code} codeGetter={props.codeGetter} />
}

const codeEditorSizing = {
  width: "100%",
  height: "100%",
};

/**
 * If we have this as part of the element above, the componentDidMount is sometimes called before its mounted in the
 * editor and thus sizing fails.
 */
class CodeEditorImplementation extends React.PureComponent<ICodeEditorProps> {
  private _editorRef: React.RefObject<HTMLDivElement> = React.createRef();
  private _resizeObserver: ResizeObserver | null;
  private _editor: monaco.editor.IStandaloneCodeEditor | null;

  constructor(props: ICodeEditorProps) {
    super(props);

    this._editor = null;
    this._resizeObserver = new ResizeObserver(() => this.onResize());
  }

  private onResize() {
    this._editor?.layout();
  }

  /** override */
  public render() {
    return <div className="editor"><div ref={this._editorRef} style={codeEditorSizing} /></div>
  }

  /** override */
  public componentDidMount() {
    let editorDiv = this._editorRef.current!;

    this._resizeObserver?.disconnect();
    this._resizeObserver?.observe(editorDiv);

    this._editor = monaco.editor.create(editorDiv, {
      value: this.props.code,
      /*theme: 'vs-dark'*/
      scrollbar: {
        vertical: 'visible',
      },
      minimap: {
        enabled: false,
      },
      scrollBeyondLastLine: false,
      language: 'javascript',
    });

    asWritable(this.props.codeGetter).current = () => this._editor?.getValue() ?? "";
  }

  /** override */
  public componentWillUnmount() {
    this._resizeObserver?.disconnect();
    asWritable(this.props.codeGetter).current = null;
  }
}
