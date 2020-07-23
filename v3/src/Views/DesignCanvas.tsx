import React from 'react';

import { LayoutViewModel } from "../state/PanelState";
import { observer } from "mobx-react";
import { EditableControl } from "./EditableControl";

import "./DesignCanvas.css";

export const DesignCanvas = observer(function DesignCanvas(props: {layout: LayoutViewModel}) {
  return (
    <div className="design-canvas">
      {props.layout.controls.map(it => (
        <EditableControl controlVm={it} />
      ))}
    </div>
  );
});
