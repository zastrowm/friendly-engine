import { Control, controlProperty } from './Control';
import { IControlDescriptor, ReflectionBasedDescriptor } from '../framework/controlsRegistry';
import { BackgroundProperty } from './editors/Background';

export class UserControl extends Control {
  private containerElement: HTMLDivElement;

  @controlProperty(new BackgroundProperty((c: UserControl) => c.containerElement))
  public backgroundColor: string;

  protected initialize(): HTMLElement {
    this.containerElement = document.createElement('div');
    return this.containerElement;
  }

  public get descriptor(): IControlDescriptor<UserControl> {
    return userControlDescriptor;
  }
}

export let userControlDescriptor = new ReflectionBasedDescriptor('userControl', UserControl);
