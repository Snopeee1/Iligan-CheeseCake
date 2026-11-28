"use client";

import { useActionState, useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { applyBlackCard, requestBooking, submitInquiry, type FormState } from "@/app/actions/public";
import { ROOMS, TIME_SLOTS, peso } from "@/lib/content";
import { Icon } from "./Icon";
import { fmtTime } from "@/lib/format";

const init: FormState = {};

export function Field({ label, name, error, hint, children, className = "" }: { label: string; name: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    // the label wraps its input, so the association never depends on (possibly clashing) ids
    <label className={`label ${className}`}>
      <span>
        {label} {hint ? <span className="hint">· {hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span className="err" id={`${name}-err`} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

const Honeypot = () => (
  <input type="text" name="company" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
);

export function Success({ message, onReset }: { message?: string; onReset?: () => void }) {
  return (
    <div className="grid justify-items-start gap-4 fade-up" role="status">
      <span className="grid size-14 place-items-center rounded-full bg-[#eef1e8] text-sage">
        <Icon name="check" size={28} />
      </span>
      <h3 className="h3">Received with thanks</h3>
      <p className="text-muted">{message}</p>
      {onReset ? (
        <button type="button" className="link" onClick={onReset}>
          Send another <Icon name="arrow" size={16} />
        </button>
      ) : null}
    </div>
  );
}

/** Today's date in Manila, read on the client only (current time can't be read during prerender). */
const noop = () => () => {};
function useMinDate() {
  return useSyncExternalStore(noop, () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10), () => undefined);
}

/* ---------------- Quick inquiry ---------------- */
export function InquiryForm({ defaultTopic = "VIP Room", source = "website" }: { defaultTopic?: string; source?: "website" | "card" }) {
  const [key, setKey] = useState(0);
  return <InquiryInner key={key} defaultTopic={defaultTopic} source={source} onReset={() => setKey((k) => k + 1)} />;
}
function InquiryInner({ defaultTopic, source, onReset }: { defaultTopic: string; source: string; onReset: () => void }) {
  const [state, action, pending] = useActionState(submitInquiry, init);
  const minDate = useMinDate();
  if (state.ok) return <div className="p-6 md:p-8"><Success message={state.message} onReset={onReset} /></div>;
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const topics = ["Order", "Reserve a table", "VIP Room", "Exclusive booking", "Packages", "Black Card"];
  return (
    <form action={action} className="relative grid gap-4 p-6 md:grid-cols-2 md:p-8" noValidate>
      <Honeypot />
      <input type="hidden" name="source" value={source} />
      <fieldset className="md:col-span-2">
        <legend className="mb-2 text-sm font-semibold">I’d like to</legend>
        <div className="chips">
          {topics.map((t) => (
            <label key={t}>
              <input type="radio" name="topic" value={t} defaultChecked={(v.topic ?? defaultTopic) === t} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Full name" name="name" error={e.name}>
        <input id="name" name="name" className="input" placeholder="e.g. Maria Santos" defaultValue={v.name} autoComplete="name" aria-invalid={!!e.name} required />
      </Field>
      <Field label="Mobile or Messenger name" name="contact" error={e.contact}>
        <input id="inq-contact" name="contact" className="input" placeholder="09XX XXX XXXX" defaultValue={v.contact}autoComplete="tel" aria-invalid={!!e.contact} required />
      </Field>
      <Field label="Date" name="date" hint="optional" error={e.date}>
        <input id="date" type="date" name="date" min={minDate} className="input" defaultValue={v.date} aria-invalid={!!e.date} />
      </Field>
      <Field label="Guests" name="guests" hint="optional" error={e.guests}>
        <input id="guests" type="number" name="guests" min={1} max={60} className="input" placeholder="e.g. 10" defaultValue={v.guests} aria-invalid={!!e.guests} />
      </Field>
      <Field label="Message" name="message" className="md:col-span-2">
        <textarea id="message" name="message" className="input" rows={3} placeholder="Tell us about your order or celebration…" defaultValue={v.message} />
      </Field>
      <div className="flex flex-col items-stretch justify-between gap-4 md:col-span-2 md:flex-row md:items-center">
        <small className="text-xs text-muted">We’ll get back to you on Messenger or by phone. Your details are only used to reply to you.</small>
        <button className="btn btn-berry" disabled={pending}>
          {pending ? "Sending…" : "Send inquiry"} <Icon name="send" />
        </button>
      </div>
    </form>
  );
}

/* ---------------- Booking request ---------------- */
export function BookingForm({ member, initialRoom = "family", busy = [] }: { member?: { name: string; mobile: string; vouchersLeft: number } | null; initialRoom?: string; busy?: { room: string; date: string; time: string }[] }) {
  const [key, setKey] = useState(0);
  return <BookingInner key={key} member={member} initialRoom={initialRoom} busy={busy} onReset={() => setKey((k) => k + 1)} />;
}
function BookingInner({ member, initialRoom, busy, onReset }: { member?: { name: string; mobile: string; vouchersLeft: number } | null; initialRoom: string; busy: { room: string; date: string; time: string }[]; onReset: () => void }) {
  const [state, action, pending] = useActionState(requestBooking, init);
  const minDate = useMinDate();
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const sp = useSearchParams();
  const wanted = sp.get("room");
  const [picked, setRoom] = useState<string | null>(v.room ?? null);
  const room = picked ?? (wanted && ROOMS.some((x) => x.id === wanted) ? wanted : initialRoom);
  const [date, setDate] = useState(v.date ?? "");
  const [chosenTime, setTime] = useState(v.time ?? "15:00");
  const [guests, setGuests] = useState(v.guests ?? "");
  const r = ROOMS.find((x) => x.id === room) ?? ROOMS[0];
  const monday = date ? new Date(`${date}T12:00:00+08:00`).getUTCDay() === 1 : false;
  const takenTimes = useMemo(() => new Set(busy.filter((b) => b.room === room && b.date === date).map((b) => b.time)), [busy, room, date]);
  // a booked slot can never stay selected (e.g. the 3 PM default on a busy day)
  const time = takenTimes.has(chosenTime) ? "" : chosenTime;

  if (state.ok)
    return (
      <div className="panel">
        <Success message={state.message} onReset={onReset} />
      </div>
    );

  return (
    <form action={action} className="relative grid items-start gap-6 lg:grid-cols-[1fr_380px]" noValidate>
      <Honeypot />
      <div className="panel grid gap-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Room</legend>
          <div className="chips">
            {ROOMS.map((x) => (
              <label key={x.id}>
                <input type="radio" name="room" value={x.id} checked={room === x.id} onChange={() => setRoom(x.id)} />
                <span>
                  {x.short} · {x.capacity.replace("Good for ", "")}
                </span>
              </label>
            ))}
          </div>
          {e.room ? <span className="err">{e.room}</span> : null}
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" name="date" error={e.date || (monday ? "We’re closed on Mondays." : undefined)}>
            <input id="date" type="date" name="date" min={minDate} className="input" value={date} onChange={(ev) => setDate(ev.target.value)} aria-invalid={!!e.date || monday} required />
          </Field>
          <Field label="Guests" name="guests" error={e.guests} hint={`max ${r.max}`}>
            <input id="guests" type="number" name="guests" min={1} max={r.max} className="input" placeholder="e.g. 10" value={guests} onChange={(ev) => setGuests(ev.target.value)} aria-invalid={!!e.guests} required />
          </Field>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Start time</legend>
          <div className="chips">
            {TIME_SLOTS.map((t) => {
              const taken = takenTimes.has(t);
              return (
                <label key={t} className={taken ? "pointer-events-none opacity-40" : ""}>
                  <input type="radio" name="time" value={t} checked={time === t} onChange={() => setTime(t)} disabled={taken} />
                  <span>
                    {fmtTime(t)}
                    {taken ? " · booked" : ""}
                  </span>
                </label>
              );
            })}
          </div>
          {e.time ? <span className="err">{e.time}</span> : null}
        </fieldset>
        <Field label="Occasion" name="occasion">
          <select id="occasion" name="occasion" className="input" defaultValue={v.occasion ?? "Birthday"}>
            {["Birthday", "Family gathering", "Business meeting", "Training / seminar", "Anniversary", "Despedida", "Other"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" error={e.name}>
            <input id="name" name="name" className="input" defaultValue={v.name ?? member?.name} autoComplete="name" aria-invalid={!!e.name} required />
          </Field>
          <Field label="Mobile or Messenger" name="contact" error={e.contact}>
            <input id="contact" name="contact" className="input" placeholder="09XX XXX XXXX" defaultValue={v.contact ?? member?.mobile} autoComplete="tel" aria-invalid={!!e.contact} required />
          </Field>
        </div>
        <Field label="Notes" name="notes" hint="optional">
          <textarea id="notes" name="notes" className="input" rows={3} placeholder="Cake, decorations, special requests…" defaultValue={v.notes} />
        </Field>
        {member && member.vouchersLeft > 0 ? (
          <label className="flex items-center gap-3 rounded-xl bg-cheesecake/60 px-4 py-3 text-sm font-medium">
            <input type="checkbox" name="useVoucher" className="size-5 accent-[var(--color-berry)]" defaultChecked={v.useVoucher === "on"} />
            Use one ₱400 voucher on this visit ({member.vouchersLeft} left)
          </label>
        ) : null}
      </div>
      <aside className="glow-dark sticky top-28 grid gap-3 rounded-3xl p-7 shadow-[var(--shadow-deep)]">
        <div className="eyebrow">Your request</div>
        <h3 className="h3">{r.short}</h3>
        <Row k="Date" v={date ? new Date(`${date}T12:00:00+08:00`).toLocaleDateString("en-PH", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—"} />
        <Row k="Time" v={time ? fmtTime(time) : "Pick a time"} />
        <Row k="Guests" v={guests || "—"} />
        {r.id === "exclusive" ? (
          <Row k="Consumable" v={<span>₱50,000 · promo ₱40–45k</span>} />
        ) : (
          <>
            <Row k="Consumable" v={member ? <s className="opacity-60">{peso(r.consumable)}</s> : peso(r.consumable)} />
            <Row k="Black Card member" v={<span className="text-gold-light">{r.member ? peso(r.member) : "—"}</span>} />
            <Row k="Room fee" v="Waived · first 4 hrs" />
          </>
        )}
        <button className="btn btn-gold mt-2" disabled={pending || monday}>
          {pending ? "Sending…" : "Send booking request"} <Icon name="arrow" />
        </button>
        <p className="text-xs text-cream/60">Not yet confirmed — our team will message you. Extra hours ₱1,500 each. Consumable covers food.</p>
      </aside>
    </form>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gold/15 py-2 text-sm">
      <span className="text-cream/65">{k}</span>
      <b className="text-right font-semibold">{v}</b>
    </div>
  );
}

/* ---------------- Black Card application ---------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function ApplyForm() {
  const [state, action, pending] = useActionState(applyBlackCard, init);
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const [mm, setMm] = useState(v.birthday?.slice(0, 2) ?? "");
  const [dd, setDd] = useState(v.birthday?.slice(3, 5) ?? "");
  if (state.ok)
    return (
      <div className="panel">
        <Success message={state.message} />
      </div>
    );
  return (
    <form action={action} className="panel relative grid gap-4" noValidate>
      <Honeypot />
      <div>
        <div className="eyebrow">Apply now</div>
        <h3 className="h3 mt-1.5">Black Card application</h3>
        <p className="text-[15px] text-muted">₱2,200 · valid for 1 year. We’ll contact you to complete payment and switch on your digital card.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" error={e.name}>
          <input id="name" name="name" className="input" placeholder="e.g. Maria Santos" defaultValue={v.name} autoComplete="name" aria-invalid={!!e.name} />
        </Field>
        <Field label="Mobile number" name="mobile" error={e.mobile}>
          <input id="mobile" name="mobile" inputMode="tel" className="input" placeholder="0917 123 4567" defaultValue={v.mobile} autoComplete="tel" aria-invalid={!!e.mobile} />
        </Field>
        <Field label="Email" name="email" hint="optional" error={e.email}>
          <input id="email" type="email" name="email" className="input" placeholder="name@email.com" defaultValue={v.email} autoComplete="email" aria-invalid={!!e.email} />
        </Field>
        <Field label="Payment method" name="payment" error={e.payment}>
          <select id="payment" name="payment" className="input" defaultValue={v.payment ?? "cash"}>
            <option value="cash">Cash (in store)</option>
            <option value="card">Card (in store)</option>
            <option value="bank">Bank transfer</option>
          </select>
        </Field>
        <Field label="Birthday" name="birthday" hint="for your free birthday slice" error={e.birthday} className="sm:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <select aria-label="Birth month" className="input" value={mm} onChange={(ev) => setMm(ev.target.value)}>
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </option>
              ))}
            </select>
            <select aria-label="Birth day" className="input" value={dd} onChange={(ev) => setDd(ev.target.value)}>
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <input type="hidden" name="birthday" value={mm && dd ? `${mm}-${dd}` : ""} />
        </Field>
      </div>
      <label className="flex items-start gap-2.5 text-sm text-muted">
        <input type="checkbox" name="agree" className="mt-1 size-4 accent-[var(--color-berry)]" defaultChecked={v.agree === "on"} />
        <span>
          I agree to be contacted about my application. The full Black Card terms will be shared before payment.
          {e.agree ? <span className="err block">{e.agree}</span> : null}
        </span>
      </label>
      <button className="btn btn-berry justify-self-start" disabled={pending}>
        {pending ? "Sending…" : "Submit application"} <Icon name="arrow" />
      </button>
    </form>
  );
}
