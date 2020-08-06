import { EditorAppViewModel } from '../viewmodels/EditorAppViewModel';
import React from 'react';
import { observer } from 'mobx-react';
import { PropertyEditorRegistry } from './propertyEditors/propertyEditor';
import { addCommonPropertyEditors } from './propertyEditors/@standardEditors';
import { IControlProperty } from '../controls/@properties';

export const PropertiesPanel = observer(function PropertiesPanel(props: { app: EditorAppViewModel }) {
  let selectedInfo = props.app.selectedInformation;

  return (
    <>
      <small>{selectedInfo.selectedControl.id}</small>
      {selectedInfo?.properties.map((p) => (
        <div key={p.property.id}>
          {React.createElement(observer(getFactory(p.property)), { property: p } as any)}
          <br />
        </div>
      ))}
    </>
  );
});

let editors = new PropertyEditorRegistry();
addCommonPropertyEditors(editors);

function getFactory(property: IControlProperty): React.FunctionComponent<any> {
  return editors.findEditorFor(property).factory;
}
