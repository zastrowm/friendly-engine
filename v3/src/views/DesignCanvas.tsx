import React from 'react';

import { ControlCollectionViewModel } from "../viewmodels/ControlCollectionViewModel";
import { observer } from "mobx-react";
import { EditableControl } from "./EditableControl";

import "./DesignCanvas.css";

export const DesignCanvas = observer(function DesignCanvas(props: {layout: ControlCollectionViewModel}) {
  return (
    <div className="design-canvas">
      {props.layout.controls.map(it => (
        <EditableControl key={it.id as any as string} controlVm={it} />
      ))}
    </div>
  );
});
