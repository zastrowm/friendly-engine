import React, { useLayoutEffect, useRef } from 'react';

import { observer } from 'mobx-react';

import './EditableControl.css';
import { Anchor } from '../control-core/layout';
import { ControlInformationViewModel } from '../viewmodels/ControlInformationViewModel';
import { applyLayoutInfo, determineEditStyle } from './DesignCanvasMovementManager';
import { autorun } from 'mobx';

interface IProps {
  controlVm: ControlInformationViewModel;
}

/**
 * React element that wraps an existing control to handle edit controls and resizing
 */
export const EditableControl = observer(function EditableControl(props: IProps) {
  let controlVm = props.controlVm;
  let className = `editable-control ${controlVm.typeId}`;

  if (controlVm.isSelected) {
    className += ' selected';
  }

  const parentContainer = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    /** Append the control as the first step */
    let div = parentContainer.current!;
    let controlHtmlRoot = controlVm.control.htmlRoot;
    controlHtmlRoot.tabIndex = -1;
    div.appendChild(controlHtmlRoot);

    controlVm.isAttached = true;

    /** whenever the control position changes on the view-model, re-position the editor/control */
    let autoRunDisposer = autorun(() => {
      applyLayoutInfo(controlVm);
    });

    return function () {
      controlVm.isAttached = false;
      autoRunDisposer();
    };
  }, [parentContainer, controlVm]);

  let child: React.ReactNode = null;

  if (controlVm.isSelected) {
    child = <ControlEditor />;
  }

  // the data-id is important for DesignCanvasMovementManager
  return (
    <div className={className} ref={parentContainer} data-id={controlVm.id}>
      {child}
    </div>
  );
});

/**
 * The edit controls/drag-handles of a selected control
 */
export function ControlEditor() {
  // noinspection HtmlUnknownAttribute
  return (
    <div className="control-editor">
      <div className="drag-handle drag-handle-west" data-drag={Anchor.west} />
      <div className="drag-handle drag-handle-north" data-drag={Anchor.north} />
      <div className="drag-handle drag-handle-east" data-drag={Anchor.east} />
      <div className="drag-handle drag-handle-south" data-drag={Anchor.south} />
      <div className="drag-handle drag-handle-nw" data-drag={Anchor.nw} />
      <div className="drag-handle drag-handle-ne" data-drag={Anchor.ne} />
      <div className="drag-handle drag-handle-se" data-drag={Anchor.se} />
      <div className="drag-handle drag-handle-sw" data-drag={Anchor.sw} />
    </div>
  );
}
