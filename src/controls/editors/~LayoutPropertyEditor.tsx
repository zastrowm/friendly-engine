import { createJsxEditor, editorPriorities, IPropertyEditor, isAttached } from './propertyEditor';
import { setPropertyUndoRedo } from './_shared';
import { ControlPositioning } from '../ControlPositioning';
import { layoutProperty } from '../properties/~LayoutProperty';
import { h } from '@friendly/elements/jsxElements';

export const LayoutPropertyEditor: IPropertyEditor<ControlPositioning> = {
  canProcess(property) {
    return property.id == layoutProperty.id;
  },

  createEditorFor(wrapped) {
    return createJsxEditor(wrapped, (refresh) => {
      let value = wrapped.getValue();

      let vAnchor = value.anchorV;
      let hAnchor = value.anchorH;

      return (
        <div>
          <h3>Vertical</h3>
          {Object.entries(vAnchor).map(([name, value]) => [<span>{name + ':'}</span>, <span>{value}</span>, <br />])}
          <h3>Horizontal</h3>
          {Object.entries(hAnchor).map(([name, value]) => [<span>{name + ':'}</span>, <span>{value}</span>, <br />])}
          <br />
          <button onClick={(_) => refresh()}>Test</button>
        </div>
      );
      return <button onClick={(_) => refresh()}>Test</button>;
    });
  },

  // try-parse is "extra" - ignore the error
  // @ts-ignore
  tryParse(value: string): { success: boolean; value: any } {
    try {
      return {
        value: JSON.parse(value),
        success: true,
      };
    } catch {
      return {
        success: false,
        value: null,
      };
    }
  },
};
