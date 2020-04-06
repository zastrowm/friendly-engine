/**
 * The options that must be passed into RoutedCommandDescriptor
 */
interface IRoutedEventDescriptorOptions {
  /** The unique id of the command */
  id: string;
  /** True if the event must be handled, false otherwise. */
  mustBeHandled: boolean;
}

type BooleanOrVoid = boolean | void;

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
   * @returns a function, then when executed, will remove the listener
   */
  public addListener(element: HTMLElement, callback: (data: T) => BooleanOrVoid): () => void {
    let configurationId = this.configuration.id;

    let listener = function (evt: CustomEvent<T>) {
      let command = evt.detail;
      let didHandle = callback(command);
      if (didHandle === true) {
        evt.preventDefault();
      }
    };

    element.addEventListener(configurationId, listener);

    return function () {
      element.removeEventListener(configurationId, listener);
    };
  }
}
