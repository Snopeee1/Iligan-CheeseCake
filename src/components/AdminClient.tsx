"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import QRCode from "qrcode";
import {
  addMember,
  addStaff,
  approveApplication,
  changeStaffPassword,
  declineApplication,
  lookupCard,
  recordVisit,
  renewMember,
  resetPin,
  saveMenuItem,
  saveSettings,
  setBookingStatus,
  setInquiryStatus,
  setMemberStatus,
  staffLogin,
  toggleAvailable,
  type Result,
  type ScanMember,
} from "@/app/actions/admin";
import { Icon } from "./Icon";
import { IconInput, SecretInput } from "./AuthShell";

const init: Result = {};

function Msg({ r }: { r: Result }) {
  if (r.error) return <p className="bad-msg" role="alert">{r.error}</p>;
  if (r.ok && r.message) return <p className="ok-msg" role="status">{r.message}</p>;
  return null;
}

/* One-time PIN pop-up lives in the admin layout so it survives the list re-rendering. */
type PinData = Record<string, unknown> | null;
let pinData: PinData = null;
const pinSubs = new Set<() => void>();
function showPin(d: PinData) {
  pinData = d;
  pinSubs.forEach((f) => f());
}
export function PinRevealHost() {
  const d = useSyncExternalStore(
    (f) => {
      pinSubs.add(f);
      return () => pinSubs.delete(f);
    },
    () => pinData,
    () => null,
  );
  return d ? <PinReveal data={d} onClose={() => showPin(null)} /> : null;
}

/** Shows a one-time temporary PIN so staff can hand it to the member. */
function PinReveal({ data, onClose }: { data: Record<string, unknown>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Temporary PIN">
      <div className="grid w-full max-w-sm gap-4 rounded-3xl bg-white p-7 text-center shadow-2xl fade-up">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#eef1e8] text-sage">
          <Icon name="check" size={28} />
        </span>
        <h3 className="h4">{String(data.name ?? "Member")}</h3>
        <p className="text-sm text-muted">Card <b className="text-ink">{String(data.cardNo)}</b>. Give the member this temporary PIN — it is shown only once. Ask them to change it in their profile.</p>
        <div className="rounded-2xl bg-espresso py-5 font-serif text-5xl tracking-[.4em] text-gold-light">{String(data.pin)}</div>
        <button className="btn btn-berry" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

/* ---------- login ---------- */
export function StaffLoginForm() {
  const [state, action, pending] = useActionState(staffLogin, init);
  return (
    <form action={action} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-semibold">
          Work email
        </label>
        <IconInput icon="mail" id="email">
          <input id="email" name="email" type="email" className="input !h-14 !pl-12" placeholder="you@iligancheesecakehouse.com" autoComplete="username" required />
        </IconInput>
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-semibold">
          Password
        </label>
        <SecretInput id="password" name="password" placeholder="Your password" autoComplete="current-password" />
      </div>
      {state.error ? (
        <p className="bad-msg fade-up" role="alert">
          <Icon name="shield" size={18} /> {state.error}
        </p>
      ) : null}
      <button className="btn btn-berry group !h-14 text-base" disabled={pending}>
        {pending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" /> Signing in…
          </>
        ) : (
          <>
            Sign in to admin <Icon name="arrow" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-muted">Forgot your password? Ask the owner to reset it from Website &amp; staff.</p>
    </form>
  );
}

/* ---------- reservations ---------- */
export function BookingActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const run = (s: "confirmed" | "declined" | "completed" | "cancelled") =>
    start(async () => {
      const r = await setBookingStatus(id, s);
      setErr(r.error ?? null);
    });
  return (
    <div className="grid gap-1">
      <div className="flex flex-wrap gap-1.5">
        {status === "pending" ? (
          <>
            <button className="btn btn-berry btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => run("confirmed")}>
              Confirm
            </button>
            <button className="btn btn-white btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => run("declined")}>
              Decline
            </button>
          </>
        ) : null}
        {status === "confirmed" ? (
          <>
            <button className="btn btn-white btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => run("completed")}>
              Mark done
            </button>
            <button className="btn btn-white btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => run("cancelled")}>
              Cancel
            </button>
          </>
        ) : null}
      </div>
      {err ? <span className="err">{err}</span> : null}
    </div>
  );
}

export function InquiryToggle({ id, status }: { id: string; status: "open" | "done" }) {
  const [pending, start] = useTransition();
  return (
    <button className={`btn btn-sm !px-3 !py-1.5 ${status === "open" ? "btn-berry" : "btn-white"}`} disabled={pending} onClick={() => start(async () => void (await setInquiryStatus(id, status === "open" ? "done" : "open")))}>
      {status === "open" ? "Mark replied" : "Reopen"}
    </button>
  );
}

/* ---------- Black Card ---------- */
export function ApplicationActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [r, setR] = useState<Result>({});
  return (
    <div className="grid gap-1.5">
      <div className="flex gap-1.5">
        <button className="btn btn-berry btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => start(async () => { const x = await approveApplication(id); if (x.data) showPin(x.data); setR(x); })}>
          Paid · activate
        </button>
        <button className="btn btn-white btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => start(async () => setR(await declineApplication(id)))}>
          Decline
        </button>
      </div>
      {r.error ? <span className="err">{r.error}</span> : null}
    </div>
  );
}

export function MemberActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  const [r, setR] = useState<Result>({});
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        <button className="btn btn-white btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => start(async () => { const x = await resetPin(id); if (x.data) showPin(x.data); setR(x); })}>
          Reset PIN
        </button>
        <button className="btn btn-white btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => confirm("Record a ₱2,200 renewal? This adds 1 year and resets vouchers to 3.") && start(async () => setR(await renewMember(id)))}>
          Renew
        </button>
        <button className="btn btn-white btn-sm !px-3 !py-1.5" disabled={pending} onClick={() => start(async () => setR(await setMemberStatus(id, status === "active" ? "suspended" : "active")))}>
          {status === "active" ? "Suspend" : "Reactivate"}
        </button>
      </div>
      {r.error ? <span className="err">{r.error}</span> : null}
      {r.ok && r.message && !r.data ? <span className="text-xs text-sage">{r.message}</span> : null}
    </div>
  );
}

export function AddMemberForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: Result, f: FormData) => {
    const r = await addMember(prev, f);
    if (r.data) {
      showPin(r.data);
      formRef.current?.reset();
    }
    return r;
  }, init);
  return (
    <form ref={formRef} action={action} className="grid gap-3">
      <h3 className="h4">Register in store</h3>
      <input name="name" className="input" placeholder="Full name" required />
      <input name="mobile" className="input" placeholder="Mobile, e.g. 09171234567" inputMode="tel" required />
      <div className="grid grid-cols-2 gap-3">
        <input name="birthday" className="input" placeholder="Birthday MM-DD" />
        <input name="email" type="email" className="input" placeholder="Email (optional)" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="paid" className="size-4 accent-[var(--color-berry)]" /> ₱2,200 received (cash, card or bank transfer)
      </label>
      {state.error ? <p className="bad-msg">{state.error}</p> : null}
      <button className="btn btn-berry" disabled={pending}>
        {pending ? "Creating…" : "Create card"}
      </button>
    </form>
  );
}

/* ---------- counter ---------- */
type Detector = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

export function CounterScanner() {
  const [code, setCode] = useState("");
  const [member, setMember] = useState<ScanMember | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [camera, setCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [voucher, setVoucher] = useState(false);
  const [state, action, saving] = useActionState(async (prev: Result, f: FormData) => {
    const r = await recordVisit(prev, f);
    if (r.ok && member) {
      const fresh = await lookupCard(member.cardNo);
      setMember(fresh.member ?? null);
      setVoucher(false);
    }
    return r;
  }, init);
  const canScan = useSyncExternalStore(
    () => () => {},
    () => "BarcodeDetector" in window,
    () => false,
  );

  const lookup = (v: string) =>
    start(async () => {
      const r = await lookupCard(v);
      setErr(r.error ?? null);
      setMember(r.member ?? null);
      setVoucher(false);
    });

  useEffect(() => {
    if (!camera) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const BD = (window as unknown as { BarcodeDetector: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    const det = new BD({ formats: ["qr_code"] });
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play();
        }
        const loop = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const found = await det.detect(videoRef.current);
            if (found[0]?.rawValue) {
              setCode(found[0].rawValue);
              setCamera(false);
              lookup(found[0].rawValue);
              return;
            }
          } catch {}
          raf = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch(() => {
        setErr("Camera not available. Type the card number instead.");
        setCamera(false);
      });
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [camera]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[420px_1fr]">
      <div className="panel grid gap-4">
        <h2 className="h4">Find a member</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) lookup(code);
          }}
          className="flex gap-2"
        >
          <input value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="Card no. (e.g. 0042) or mobile" aria-label="Card number or mobile" autoFocus />
          <button className="btn btn-berry !px-5" disabled={pending}>
            {pending ? "…" : "Find"}
          </button>
        </form>
        {canScan ? (
          <button type="button" className="btn btn-dark" onClick={() => setCamera((c) => !c)}>
            <Icon name="scan" /> {camera ? "Stop camera" : "Scan member QR"}
          </button>
        ) : (
          <p className="text-xs text-muted">Tip: on Chrome for Android you can scan the member’s QR with the camera. Here, type the card number or mobile.</p>
        )}
        {camera ? <video ref={videoRef} className="aspect-square w-full rounded-2xl bg-black object-cover" muted playsInline /> : null}
        {err ? <p className="bad-msg">{err}</p> : null}
      </div>

      {member ? (
        <div className="panel grid gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="eyebrow">{member.cardNo}</div>
              <h2 className="h3">{member.name}</h2>
              <p className="text-sm text-muted">
                {member.mobile} · {member.visits} visits · valid until {new Date(member.expiresAt).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.expired ? <span className="st bad">Expired</span> : member.status !== "active" ? <span className="st bad">Suspended</span> : <span className="st ok">Active</span>}
              {member.verified ? <span className="st ok">Live QR verified</span> : <span className="st mute">Typed — check the member’s phone</span>}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-cheesecake p-4">
              <b className="block font-serif text-3xl">{member.vouchersLeft} × ₱400</b>
              <span className="text-xs text-muted">vouchers left</span>
            </div>
            <div className="rounded-2xl bg-cheesecake p-4">
              <b className="block font-serif text-3xl">10%</b>
              <span className="text-xs text-muted">regular menu · member + 4</span>
            </div>
            <div className="rounded-2xl bg-cheesecake p-4">
              <b className="block font-serif text-3xl">25%</b>
              <span className="text-xs text-muted">Chef VIP Special Menu</span>
            </div>
          </div>
          {member.birthdayMonth ? (
            <p className={member.birthdayClaimed ? "bad-msg" : "ok-msg"}>
              <Icon name="gift" size={18} /> Birthday month! {member.birthdayClaimed ? "Free slice already claimed this year." : "One free slice of cheesecake, any flavour."}
            </p>
          ) : null}
          {member.status === "active" && !member.expired ? (
            <form action={action} className="grid gap-4 border-t border-line pt-5">
              <input type="hidden" name="memberId" value={member.id} />
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Free drink this visit</legend>
                <div className="chips">
                  {["", "Hot Americano", "Cold Americano", "Fruitea · Passion", "Fruitea · Green Apple", "Fruitea · Lychee"].map((d) => (
                    <label key={d || "none"}>
                      <input type="radio" name="drink" value={d} defaultChecked={d === ""} />
                      <span>{d || "None"}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="hidden" name="voucher" value={voucher ? "on" : ""} />
                <input type="checkbox" className="size-5 accent-[var(--color-berry)]" checked={voucher} onChange={(e) => setVoucher(e.target.checked)} disabled={member.vouchersLeft < 1} />
                Use one ₱400 voucher {member.vouchersLeft < 1 ? "(none left)" : ""}
              </label>
              {voucher ? (
                <label className="label max-w-xs" htmlFor="pin">
                  Member enters their PIN
                  <input id="pin" name="pin" type="password" inputMode="numeric" maxLength={6} className="input tracking-[.4em]" placeholder="••••" required autoComplete="off" />
                </label>
              ) : null}
              {member.birthdayMonth && !member.birthdayClaimed ? (
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input type="checkbox" name="birthday" className="size-5 accent-[var(--color-berry)]" /> Give the free birthday slice
                </label>
              ) : null}
              <Msg r={state} />
              <button className="btn btn-berry justify-self-start" disabled={saving}>
                {saving ? "Saving…" : "Save visit"}
              </button>
            </form>
          ) : (
            <p className="bad-msg">Renew or reactivate this card in Black Card members before giving perks.</p>
          )}
        </div>
      ) : (
        <div className="panel grid place-items-center gap-2 py-16 text-center text-muted">
          <Icon name="scan" size={36} className="text-gold" />
          <p>Scan the member’s live QR, or type their card number or mobile.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- menu ---------- */
export function MenuRowEditor({ itemKey, name, price, basePrice, available, hidden }: { itemKey: string; name: string; price: number | null; basePrice: number | null; available: boolean; hidden: boolean }) {
  const [state, action, pending] = useActionState(saveMenuItem, init);
  const [avail, setAvail] = useState(available);
  const [, start] = useTransition();
  return (
    <form action={action} className="grid items-center gap-3 border-b border-line px-4 py-3 last:border-0 md:grid-cols-[1fr_130px_auto_auto_auto]">
      <input type="hidden" name="key" value={itemKey} />
      <div>
        <b className="text-sm">{name}</b>
        {basePrice !== null && price !== basePrice ? <span className="block text-xs text-muted">Delivery-app price ₱{basePrice}</span> : null}
      </div>
      <label className="flex items-center gap-1 text-sm">
        ₱<input name="price" defaultValue={price ?? ""} inputMode="numeric" className="input !h-10 !w-24" placeholder="—" aria-label={`Price of ${name}`} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="available"
          checked={avail}
          onChange={(e) => {
            setAvail(e.target.checked);
            start(async () => void (await toggleAvailable(itemKey, e.target.checked)));
          }}
          className="size-4 accent-[var(--color-sage)]"
        />
        {avail ? "Available" : <span className="font-semibold text-berry">Sold out</span>}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="hidden" defaultChecked={hidden} className="size-4" /> Hide
      </label>
      <div className="flex items-center gap-2">
        <button className="btn btn-ink btn-sm !px-3 !py-1.5" disabled={pending}>
          {pending ? "…" : "Save"}
        </button>
        {state.ok ? <Icon name="check" size={18} className="text-sage" /> : null}
        {state.error ? <span className="err">{state.error}</span> : null}
      </div>
    </form>
  );
}

/* ---------- settings ---------- */
export function SettingsForm({ s }: { s: { offerHeadline: string; offerBody: string; offerActive: boolean; announcement: string; announcementActive: boolean } }) {
  const [state, action, pending] = useActionState(saveSettings, init);
  return (
    <form action={action} className="grid gap-4">
      <h2 className="h4">Offer &amp; announcement</h2>
      <label className="label">
        Offer headline <span className="hint">keep “5–10%” and “selected”</span>
        <input name="offerHeadline" className="input" defaultValue={s.offerHeadline} />
      </label>
      <label className="label">
        Offer text
        <textarea name="offerBody" className="input" rows={3} defaultValue={s.offerBody} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="offerActive" defaultChecked={s.offerActive} className="size-4" /> Show the offer on the website
      </label>
      <label className="label">
        Announcement bar <span className="hint">e.g. “Open this Monday for Christmas”</span>
        <input name="announcement" className="input" defaultValue={s.announcement} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="announcementActive" defaultChecked={s.announcementActive} className="size-4" /> Show the announcement bar
      </label>
      <Msg r={state} />
      <button className="btn btn-berry justify-self-start" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function CallingCardQr({ url }: { url: string }) {
  const [svg, setSvg] = useState("");
  const [png, setPng] = useState("");
  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "H", color: { dark: "#14110F", light: "#FFFFFF" } }).then(setSvg);
    QRCode.toDataURL(url, { margin: 2, width: 1200, errorCorrectionLevel: "H", color: { dark: "#14110F", light: "#FFFFFF" } }).then(setPng);
  }, [url]);
  return (
    <div className="grid gap-4">
      <h2 className="h4">Calling-card QR</h2>
      <p className="text-sm text-muted">Print this on Sir Angelo’s calling card to replace the old menu QR. It opens the “one tap” page with the menu, offer, Black Card, VIP Rooms, Messenger and directions.</p>
      <div className="flex flex-wrap items-center gap-5">
        <div className="size-40 rounded-2xl border border-line bg-white p-2.5 [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label="Calling card QR code" />
        <div className="grid gap-2">
          <code className="rounded-lg bg-cream px-3 py-2 text-xs break-all">{url}</code>
          {png ? (
            <a className="btn btn-ink btn-sm justify-self-start" href={png} download="ich-calling-card-qr.png">
              <Icon name="download" /> Download PNG (print quality)
            </a>
          ) : null}
          {svg ? (
            <a className="btn btn-white btn-sm justify-self-start" href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} download="ich-calling-card-qr.svg">
              <Icon name="download" /> Download SVG (for the printer)
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AddStaffForm() {
  const [state, action, pending] = useActionState(addStaff, init);
  return (
    <form action={action} className="grid gap-3">
      <h2 className="h4">Add a staff account</h2>
      <input name="name" className="input" placeholder="Name" required />
      <input name="email" type="email" className="input" placeholder="Email" required autoComplete="off" />
      <input name="password" type="password" className="input" placeholder="Temporary password (10+ characters)" required autoComplete="new-password" />
      <Msg r={state} />
      <button className="btn btn-ink justify-self-start" disabled={pending}>
        {pending ? "Adding…" : "Add staff"}
      </button>
    </form>
  );
}

export function StaffPasswordForm() {
  const [state, action, pending] = useActionState(changeStaffPassword, init);
  return (
    <form action={action} className="grid gap-3">
      <h2 className="h4">Change my password</h2>
      <input name="current" type="password" className="input" placeholder="Current password" autoComplete="current-password" required />
      <input name="next" type="password" className="input" placeholder="New password (10+ characters)" autoComplete="new-password" required />
      <Msg r={state} />
      <button className="btn btn-ink justify-self-start" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
