
import React, { useLayoutEffect, useRef } from "react";
import { Portal } from "./Portal";

/**
 * A dialog that prevents focus to the other elements not inside of the dialog
 */
export const ModalDialog = function Dialog(props: React.DialogHTMLAttributes<any>) {
  // See https://github.com/reactjs/reactjs.org/issues/272 for a background, but the jist is that
  // if we use a ref here, it will always be null.  So we delegate out to a different element that
  // actually uses ref and does the handling for us
  return <Portal>
    <ModalDialogImplementation {...props} />
  </Portal>
};

function ModalDialogImplementation(props: React.DialogHTMLAttributes<any>) {
  let dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(function() {
    let ref = dialogRef.current!;
    if (ref == null)
      return;

    if (!ref.open) {
      ref.showModal()
    }

    return function() {
      if (ref == null || !ref.isConnected || !ref.open)
        return;

      ref.close();
    }

  }, [dialogRef])

  let rest = {...props};

  return <dialog ref={dialogRef} {...rest}>
    {props.children}
  </dialog>;
}
