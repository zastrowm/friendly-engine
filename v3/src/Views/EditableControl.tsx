import React, { useEffect, useRef } from 'react';

import { ControlInformationViewModel } from "../state/PanelState";
import { observer } from "mobx-react";

import "./EditableControl.css"

interface IProps {
  controlVm: ControlInformationViewModel;
}

export const EditableControl = observer(function EditableControl(props: IProps) {

  let styleProps = {
    left: props.controlVm.positionInfo.left,
    top: props.controlVm.positionInfo.top,
    width: props.controlVm.positionInfo.width,
    height: props.controlVm.positionInfo.height,
    bottom: props.controlVm.positionInfo.bottom,
    right: props.controlVm.positionInfo.right,
  };

  let className = "editable-control " + props.controlVm.typeId;

  const parentContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let div = parentContainer.current!;
    div.appendChild(props.controlVm.control.htmlRoot);
  })

  return (
    <div className={className} style={styleProps} ref={parentContainer}>
    </div>
  );
});
