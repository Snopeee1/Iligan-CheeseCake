"use client";

import { useTransition, type FormEvent } from "react";

/**
 * Submit handler for forms backed by useActionState that keeps what the user typed.
 * (With `action={fn}`, React clears the form after every submit — even when the
 * server returns an error — so people would have to retype their mobile or email.)
 */
export function useKeepValues(dispatch: (f: FormData) => void) {
  const [, start] = useTransition();
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    start(() => dispatch(fd));
  };
}
