"use client";

import { useActionState } from "react";
import { memberLogin, changePin, updateProfile, type AuthState } from "@/app/actions/member";
import { Icon } from "./Icon";
import { IconInput, SecretInput } from "./AuthShell";
import { useKeepValues } from "./keepForm";

const init: AuthState = {};

export function MemberLoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(memberLogin, init);
  const submit = useKeepValues(action);
  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <input type="hidden" name="next" value={next ?? "/account"} />
      <div className="grid gap-2">
        <label htmlFor="id" className="text-sm font-semibold">
          Mobile number or card number
        </label>
        <IconInput icon="phone" id="id">
          <input id="id" name="id" className="input !h-14 !pl-12" placeholder="0917 123 4567 or ICH-BC-0042" autoComplete="username" required />
        </IconInput>
      </div>
      <div className="grid gap-2">
        <label htmlFor="pin" className="text-sm font-semibold">
          4-digit PIN
        </label>
        <SecretInput id="pin" name="pin" placeholder="••••" autoComplete="current-password" numeric maxLength={6} />
      </div>
      {state.error ? (
        <p className="bad-msg fade-up" role="alert">
          <Icon name="x" size={18} /> {state.error}
        </p>
      ) : null}
      <button className="btn btn-berry !h-14 text-base" disabled={pending}>
        {pending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" /> Signing in…
          </>
        ) : (
          <>
            Open my Black Card <Icon name="arrow" />
          </>
        )}
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
  const submit = useKeepValues(action);
  return (
    <form onSubmit={submit} className="grid gap-4">
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
