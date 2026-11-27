import Link from "next/link";
import { Icon, type IconName } from "./Icon";
import { Dust } from "./motion";

export function AdminTitle({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <section className="glow-dark spotlight relative -mx-4 -mt-4 overflow-hidden px-6 py-7 md:-mx-8 md:-mt-8 md:px-10 md:py-9">
      <span className="blob top-[-140px] right-[-60px] size-[360px] bg-gold/25" />
      <Dust />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow fade-up">ICH Admin</div>
          <h1 className="fade-up mt-2 font-serif text-[36px] leading-10 font-medium text-cream md:text-[44px] md:leading-[48px]" style={{ animationDelay: "80ms" }}>
            {title}
          </h1>
          {sub ? (
            <p className="fade-up mt-1 max-w-2xl text-sm text-cream/65" style={{ animationDelay: "160ms" }}>
              {sub}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="fade-up flex flex-wrap gap-2" style={{ animationDelay: "240ms" }}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
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
  const cls = "panel fade-up lift group grid gap-1 !p-5";
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
    <section className={`panel fade-up !p-0 ${className}`}>
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
