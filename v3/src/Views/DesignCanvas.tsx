import React from 'react';

import { LayoutViewModel } from "../viewmodels/LayoutViewModel";
import { observer } from "mobx-react";
import { EditableControl } from "./EditableControl";

import "./DesignCanvas.css";

export const DesignCanvas = observer(function DesignCanvas(props: {layout: LayoutViewModel}) {
  return (
    <div className="design-canvas">
      {props.layout.controls.map(it => (
        <EditableControl key={it.id as any as string} controlVm={it} />
      ))}
    </div>
  );
});
