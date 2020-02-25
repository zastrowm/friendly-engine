import { RoutedEventDescriptor } from './routedEvents';

let routedCommandEvent = new RoutedEventDescriptor<RoutedCommand>({
  id: 'routedCommand',
  mustBeHandled: false,
});

/**
 * A command that can be triggered from a source element and listened to and handled at a higher point
 * in the document.
 *
 * Inspired by WPF routed commands and keybindings.
 **/
export class RoutedCommand {
  constructor(public id: string) {}

  /**
   * Triggers the search for an element that will handle the given command.
   * @returns true if the command was handed, false otherwise
   **/
  public trigger(element: HTMLElement): boolean {
    return routedCommandEvent.trigger(element, this);
  }

  private static commandListenerLookup = new WeakMap<HTMLElement, RoutedCommandListener>();

  /** Creates a listener which can be used to subscribe to RoutedCommands reaching the given element. */
  static createListener(element: HTMLElement): RoutedCommandListener {
    let listener = RoutedCommand.commandListenerLookup.get(element);
    if (listener == null) {
      listener = new RoutedCommandListener();
      RoutedCommand.commandListenerLookup.set(element, listener);
      routedCommandEvent.addListener(element, listener.tryHandle);
    }

    return listener;
  }
}

/** Callback type for a listener to a routed command. */
interface RoutedCommandListenerCallback {
  (): boolean | void;
}

class RoutedCommandListener {
  private data = new Map<string, RoutedCommandListenerCallback>();

  public set(command: RoutedCommand, callback: RoutedCommandListenerCallback) {
    this.data.set(command.id, callback);
  }

  public tryHandle = (command: RoutedCommand) => {
    let callback = this.data.get(command.id);
    if (callback != null) {
      let returnValue = callback();
      if (returnValue === false) {
        return false;
      } else if (returnValue === true) {
        return true;
      } else {
        // no return value
        return true;
      }
    } else {
      return false;
    }
  };
}
