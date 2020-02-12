import { Component, h, Host, Method, Prop, Event, Listen, Element } from '@stencil/core';
import { IStoredPositionInfo } from '../../api/layout';
import { IUndoCommand, IContext } from '../../api/undoCommand';
import { EventEmitter } from '@stencil/router/dist/types/stencil.core';

@Component({
  tag: 'design-editor',
  styleUrl: './design-editor.css',
})
export class DesignEditor {
  @Element()
  private host: HTMLElement;

  @Event({ eventName: 'undoEventGenerated' })
  public undoEventGenerated: EventEmitter<IUndoCommand>;

  @Prop()
  public helpers: {
    selectAndMarkActive: (control: HTMLControlContainerElement, mouseEvent?: MouseEvent) => void;
    getControlContainer: (id: string) => HTMLControlContainerElement;
    getActive: () => HTMLControlContainerElement;
  };

  @Prop()
  public api: DesignEditor;

  private activeEditor: HTMLControlEditorElement;

  constructor() {
    // TODO handle failures
    this.api = this;

    this.activeEditor = document.createElement('control-editor');
    this.helpers = {
      selectAndMarkActive: (c, m) => this.selectAndMarkActive(c, m),
      getControlContainer: id => this.getControlContainer(id),
      getActive: () => this.getActiveControlContainer(),
    };
  }

  private getActiveControlContainer(): HTMLControlContainerElement {
    return this.activeEditor.parentElement as HTMLControlContainerElement;
  }

  private getControlContainer(id: string): HTMLControlContainerElement {
    let query = `control-container[unique-id='${id}']`;
    let container = this.host.querySelector(query) as HTMLControlContainerElement;
    if (container == null) {
      console.log('using slow search');
      let containers = this.host.querySelectorAll('control-container');
      for (let container of Array.from(containers)) {
        if (container.uniqueId == id) {
          return container;
        }
      }
    }

    return container;
  }

  private async selectAndMarkActive(control: HTMLControlContainerElement, mouseEvent?: MouseEvent) {
    if (control == null) {
      throw new Error('Control cannot be null');
    }

    let activeEditor = this.activeEditor;
    if (activeEditor.parentElement == control) {
      return false;
    }

    console.log(`Transfering focus to: ${control.uniqueId}`);
    control.appendChild(this.activeEditor);

    if (mouseEvent != null) {
      mouseEvent.preventDefault();
      await activeEditor.transferMouseDown(mouseEvent);
    }
  }

  @Method()
  public async addControl(type: string, id: string, layoutInfo: IStoredPositionInfo) {
    await this.addControlNoUndo(type, id, layoutInfo);
    this.undoEventGenerated.emit(new UndoAddCommand(type, id, layoutInfo));
  }

  @Method()
  public async addControlNoUndo(type: string, id: string, layoutInfo: IStoredPositionInfo) {
    let controlContainer = document.createElement('control-container');
    controlContainer.uniqueId = id;
    controlContainer.positionInfo = layoutInfo;
    controlContainer.controlType = type;

    console.log(controlContainer);
    console.log(controlContainer.getAttribute('unique-id'));

    let nestedControl = document.createElement(type);
    nestedControl.textContent = 'This is a ' + type;
    controlContainer.appendChild(nestedControl);

    this.host.appendChild(controlContainer);
  }

  @Method()
  public async removeControl(id: string) {
    let container = this.getControlContainer(id);

    let type = container.controlType;
    let layoutInfo = container.positionInfo;

    console.log(container);

    await this.removeControlNoUndo(id);

    this.undoEventGenerated.emit(new UndoRemoveCommand(type, id, layoutInfo));
  }

  @Method()
  public removeControlNoUndo(id: string) {
    let container = this.getControlContainer(id);
    this.host.removeChild(container);
  }

  public render() {
    return <Host />;
  }
}

class UndoAddCommand implements IUndoCommand {
  constructor(private type: string, private id: string, private position: IStoredPositionInfo) {}

  async undo(context: IContext): Promise<void> {
    await context.editor.removeControlNoUndo(this.id);
  }

  async redo(context: IContext): Promise<void> {
    await context.editor.addControlNoUndo(this.type, this.id, this.position);
    let container = context.editor.helpers.getControlContainer(this.id);
    context.editor.helpers.selectAndMarkActive(container);
  }
}

class UndoRemoveCommand implements IUndoCommand {
  constructor(private type: string, private id: string, private position: IStoredPositionInfo) {}

  async undo(context: IContext): Promise<void> {
    await context.editor.addControlNoUndo(this.type, this.id, this.position);
    let container = context.editor.helpers.getControlContainer(this.id);
    context.editor.helpers.selectAndMarkActive(container);
  }

  async redo(context: IContext): Promise<void> {
    await context.editor.removeControlNoUndo(this.id);
  }
}
