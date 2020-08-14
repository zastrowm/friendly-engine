import { IPropertyEditor, IReactPropertyEditorArgs } from './propertyEditor';
import { PropertyType } from '../../control-core/controlProperties';
import React, { useRef, useState } from 'react';
import { ModalDialog } from "../DialogPortal";

import './~ScriptPropertyEditor.css'
import { CodeEditor } from "../Monaco";

export const ScriptPropertyEditor: IPropertyEditor<string> = {
  canProcess(property) {
    return property.propertyType === PropertyType.script;
  },

  factory: function TextPropertyEditor(props: IReactPropertyEditorArgs<string>) {

    let [isEditing, setIsEditing] = useState(false);

    let onEdit = function() {
      setIsEditing(true);
    }

    let onSave = function() {
      if (codeGetter.current != null)
      {
        props.property.value = codeGetter.current();
      }

      setIsEditing(false);
    };

    let onCancel = function() {
      setIsEditing(false);
    }

    let codeGetter = useRef<() => string>(null);

    return <>
      <button onClick={onEdit}>Edit Click Script</button>
      {isEditing &&
      (<ModalDialog style={{ width: "600px", height: "500px" }}>
        <h1>{props.property.property.id}</h1>
        <CodeEditor code={props.property.value} codeGetter={codeGetter}  />
        <div className="actions">
          <button name="btnSave" onClick={onSave}>Save</button>
          <button name="btnCancel" onClick={onCancel}>Cancel</button>
        </div>
      </ModalDialog>)}
    </>
  },
};
