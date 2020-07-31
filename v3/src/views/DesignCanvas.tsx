import React, { useEffect, useRef } from 'react';
import { observer } from "mobx-react";

import { EditorAppViewModel } from "../viewmodels/EditorAppViewModel";
import { EditableControl } from "./EditableControl";

import "./DesignCanvas.css";
import { ControlMovementManager } from "./DesignCanvasMovementManager";

export const DesignCanvas = observer(function DesignCanvas(props: {app: EditorAppViewModel}) {

  const canvasControl = useRef<HTMLDivElement>(null);

  useEffect(function() {
    let movementManager = new ControlMovementManager(props.app, canvasControl.current!);

    return () => {
      movementManager.removeEventListeners();
    }
  }, [props.app, canvasControl]);

  return (
    <div className="design-canvas" ref={canvasControl}>
      {props.app.controls.controls.map(it => (
        <EditableControl key={it.id as any as string} controlVm={it} />
      ))}
    </div>
  );
});
