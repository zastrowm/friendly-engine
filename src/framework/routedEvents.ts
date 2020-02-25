/**
 * The options that must be passed into RoutedCommandDescriptor
 */
interface IRoutedEventDescriptorOptions {
  /** The unique id of the command */
  id: string;
  /** True if the event must be handled, false otherwise. */
  mustBeHandled: boolean;
}

/**
 * Represents an event that can be triggered from one element and bubbles up through
 * the tree looking for a handler.
 */
export class RoutedEventDescriptor<T> {
  constructor(private configuration: IRoutedEventDescriptorOptions) {}

  /**
   * Propagates an undo event to be handled by an upstream listener
   * @returns true if it was handled, false otherwise
   */
  trigger(element: HTMLElement, data: T) {
    let wasUnhandled = element.dispatchEvent(
      new CustomEvent(this.configuration.id, {
        bubbles: true,
        detail: data,
        cancelable: true,
      }),
    );

    if (this.configuration.mustBeHandled && wasUnhandled) {
      console.error(`Event ${this.configuration.id} with data was unhandled:`, data);
    }

    return !wasUnhandled;
  }

  /**
   * Adds a routed command listener on the given element.
   */
  public addListener(element: HTMLElement, callback: (data: T) => boolean) {
    element.addEventListener(this.configuration.id, function(evt: CustomEvent<T>) {
      let command = evt.detail;
      let didHandle = callback(command);
      if (didHandle) {
        evt.preventDefault();
      }
    });
  }
}
