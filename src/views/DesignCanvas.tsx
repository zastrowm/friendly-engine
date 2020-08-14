import React, { useLayoutEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import { EditorAppViewModel } from '../viewmodels/EditorAppViewModel';
import { EditableControl } from './EditableControl';

import './DesignCanvas.css';
import { applyLayoutInfo, ControlMovementManager } from './DesignCanvasMovementManager';
import { autorun } from 'mobx';

export const DesignCanvas = observer(function DesignCanvas(props: { app: EditorAppViewModel }) {
  const canvasControl = useRef<HTMLDivElement>(null);
  const rootContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    function () {
      let movementManager = new ControlMovementManager(props.app, canvasControl.current!);

      // when the root changes, remove the existing root and re-add the other one
      const disposable = autorun(() => {
        let root = props.app.controls.root;
        let rootDiv = rootContainer.current!;
        rootDiv!.innerHTML = '';
        rootDiv!.appendChild(root.control.htmlRoot);

        applyLayoutInfo(root);
        root.isAttached = true;
      });

      return () => {
        movementManager.removeEventListeners();
        props.app.controls.root.isAttached = false;
        disposable();
      };
    },
    [props.app, canvasControl],
  );

  return (
    <div className="design-canvas" ref={canvasControl}>
      <div className="editable-control ~root" ref={rootContainer} />
      {props.app.controls.controls.map((it) => (
        <EditableControl key={(it.id as any) as string} controlVm={it} />
      ))}
    </div>
  );
});
