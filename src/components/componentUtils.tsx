/**
 * Helper function to pass to a JSX ref attribute to append the given element when
 * inserted into the dom.
 *
 * Example usages:
 *   <div>
 *     <h1>Example</h1>
 *     <div ref={refAppendElement(document.createElement("span"))}></div>
 *   </div>
 */

export const ref = {
  /**
   * Helper function to pass to a JSX ref attribute to append the given element when
   * inserted into the dom.
   *
   * Example usages:
   *   <div>
   *     <h1>Example</h1>
   *     <div ref={refAppendElement(document.createElement("span"))}></div>
   *   </div>
   */
  appendElement: function(replacement: HTMLElement) {
    return function(element: HTMLElement) {
      if (element == null) {
        return;
      }

      if (element.firstChild != null) {
        element.innerHTML = '';
      }

      element.appendChild(replacement);
    };
  },
};
