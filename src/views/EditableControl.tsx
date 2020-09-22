import React, { useLayoutEffect, useRef } from 'react';

import { observer } from 'mobx-react';

import './EditableControl.css';
import { DragAnchor } from '../control-core/layout';
import { ControlInformationViewModel } from '../viewmodels/ControlInformationViewModel';
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
      controlVm.applyLayoutInfo();
    });

    return function () {
      div.removeChild(controlHtmlRoot);
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
      <div className="drag-handle drag-handle-west" data-drag={DragAnchor.west} />
      <div className="drag-handle drag-handle-north" data-drag={DragAnchor.north} />
      <div className="drag-handle drag-handle-east" data-drag={DragAnchor.east} />
      <div className="drag-handle drag-handle-south" data-drag={DragAnchor.south} />
      <div className="drag-handle drag-handle-nw" data-drag={DragAnchor.nw} />
      <div className="drag-handle drag-handle-ne" data-drag={DragAnchor.ne} />
      <div className="drag-handle drag-handle-se" data-drag={DragAnchor.se} />
      <div className="drag-handle drag-handle-sw" data-drag={DragAnchor.sw} />
    </div>
  );
}
