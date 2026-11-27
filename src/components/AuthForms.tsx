"use client";

import { useActionState, useState } from "react";
import { memberLogin, changePin, updateProfile, type AuthState } from "@/app/actions/member";
import { Icon } from "./Icon";

const init: AuthState = {};

export function MemberLoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(memberLogin, init);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="next" value={next ?? "/account"} />
      <label className="label" htmlFor="id">
        Mobile number or card number
        <input id="id" name="id" className="input" placeholder="0917 123 4567 or ICH-BC-0042" autoComplete="username" inputMode="text" required />
      </label>
      <label className="label" htmlFor="pin">
        <span className="flex justify-between">
          4-digit PIN
          <button type="button" className="text-xs font-semibold text-berry" onClick={() => setShow((s) => !s)}>
            {show ? "Hide" : "Show"}
          </button>
        </span>
        <input id="pin" name="pin" className="input tracking-[.4em]" type={show ? "text" : "password"} inputMode="numeric" pattern="\d{4,6}" maxLength={6} placeholder="••••" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p className="bad-msg" role="alert">
          <Icon name="x" size={18} /> {state.error}
        </p>
      ) : null}
      <button className="btn btn-berry" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"} <Icon name="arrow" />
      </button>
      <p className="text-center text-xs text-muted">Forgot your PIN? Ask our staff at the counter or message us on Messenger to reset it.</p>
    </form>
  );
}

export function ChangePinForm() {
  const [state, action, pending] = useActionState(changePin, init);
  return (
    <form action={action} className="grid gap-4">
      <h3 className="h4">Change PIN</h3>
      {(["current", "next", "confirm"] as const).map((n) => (
        <label key={n} className="label" htmlFor={`pin-${n}`}>
          {n === "current" ? "Current PIN" : n === "next" ? "New PIN" : "Confirm new PIN"}
          <input id={`pin-${n}`} name={n} className="input tracking-[.4em]" type="password" inputMode="numeric" maxLength={4} autoComplete={n === "current" ? "current-password" : "new-password"} required />
        </label>
      ))}
      {state.error ? <p className="bad-msg">{state.error}</p> : null}
      {state.ok ? <p className="ok-msg">{state.message}</p> : null}
      <button className="btn btn-ink justify-self-start" disabled={pending}>
        {pending ? "Saving…" : "Update PIN"}
      </button>
    </form>
  );
}

export function ProfileForm({ email }: { email?: string | null }) {
  const [state, action, pending] = useActionState(updateProfile, init);
  return (
    <form action={action} className="grid gap-4">
      <label className="label" htmlFor="email">
        Email for receipts <span className="hint">optional</span>
        <input id="email" name="email" type="email" className="input" defaultValue={email ?? ""} placeholder="name@email.com" autoComplete="email" />
      </label>
      {state.error ? <p className="bad-msg">{state.error}</p> : null}
      {state.ok ? <p className="ok-msg">{state.message}</p> : null}
      <button className="btn btn-ink justify-self-start" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
