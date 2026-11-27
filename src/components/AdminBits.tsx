import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export function AdminTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[34px] leading-10 font-medium md:text-[40px]">{title}</h1>
        {sub ? <p className="text-sm text-muted">{sub}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function Stat({ label, value, hint, icon, href, tone }: { label: string; value: React.ReactNode; hint?: string; icon: IconName; href?: string; tone?: "warn" | "ok" }) {
  const body = (
    <>
      <div className="flex items-center justify-between text-[13px] font-semibold text-muted">
        {label}
        <Icon name={icon} size={18} className="text-gold-deep" />
      </div>
      <b className="font-serif text-[38px] leading-[44px] font-semibold">{value}</b>
      {hint ? <small className={`text-xs ${tone === "warn" ? "font-semibold text-gold-deep" : tone === "ok" ? "text-sage" : "text-muted"}`}>{hint}</small> : null}
    </>
  );
  const cls = "panel grid gap-1 !p-5 transition";
  return href ? (
    <Link href={href} className={`${cls} hover:border-gold`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel !p-0 ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export const statusTone: Record<string, string> = { pending: "pend", confirmed: "ok", declined: "bad", cancelled: "bad", completed: "mute", new: "pend", approved: "ok", open: "pend", done: "mute", active: "ok", suspended: "bad" };
