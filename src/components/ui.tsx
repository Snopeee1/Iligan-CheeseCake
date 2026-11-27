import Image from "next/image";
import Link from "next/link";
import { PHOTO_CROP } from "@/lib/content";
import { Icon } from "./Icon";
import { Dust } from "./motion";

export function Photo({ name, alt = "", className = "", sizes = "100vw", eager = false, crop }: { name: string; alt?: string; className?: string; sizes?: string; eager?: boolean; crop?: string }) {
  const c = crop ?? PHOTO_CROP[name];
  return (
    <div className={`ph ${className}`} style={c ? ({ "--crop": c } as React.CSSProperties) : undefined}>
      <Image src={`/images/${name}.webp`} alt={alt} fill sizes={sizes} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} />
    </div>
  );
}

export function PhotoPlaceholder({ label = "Photo coming soon", className = "", dark = false }: { label?: string; className?: string; dark?: boolean }) {
  return (
    <div
      className={`grid place-items-center text-[11px] font-semibold tracking-[.18em] uppercase ${className}`}
      style={{
        background: dark ? "repeating-linear-gradient(135deg,#221C17 0 10px,#1B1613 10px 20px)" : "repeating-linear-gradient(135deg,#EFE4CF 0 12px,#E8DBC1 12px 24px)",
        color: dark ? "rgba(230,201,135,.6)" : "var(--color-gold-deep)",
      }}
    >
      {label}
    </div>
  );
}

export function SectionHead({ eyebrow, title, lead, align = "center", className = "" }: { eyebrow: string; title: React.ReactNode; lead?: React.ReactNode; align?: "center" | "left"; className?: string }) {
  return (
    <div className={`head ${align === "left" ? "left" : ""} ${className}`}>
      <div className="orn">
        <i />
      </div>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="h2">{title}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </div>
  );
}

export function Logo({ light = false, href = "/" }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className={`logo ${light ? "on-light" : ""}`} aria-label="Iligan Cheesecake House home">
      <span className="badge">ICH</span>
      <span className="wm">
        <small>ILIGAN</small>
        <span>Cheesecake House</span>
      </span>
    </Link>
  );
}

export function BlackCard({ name = "BLACK CARD", sub = "MEMBER", footer = "Iligan Cheesecake House", className = "", style }: { name?: string; sub?: string; footer?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bcard ${className}`} style={style}>
      <div className="top">
        <span className="mono">ICH</span>
        <span className="tier">Premium VIP Member</span>
      </div>
      <span className="chipx" />
      <div>
        <div className="name">{name}</div>
        <div className="sub">
          <span>{footer}</span>
          <span>{sub}</span>
        </div>
      </div>
    </div>
  );
}

export function PageHero({ crumb, eyebrow, title, lead, children, aside }: { crumb: string; eyebrow: string; title: React.ReactNode; lead: React.ReactNode; children?: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="glow-dark spotlight relative overflow-hidden">
      <span className="blob top-[-140px] right-[-100px] size-[460px] bg-gold/35" />
      <span className="blob bottom-[-160px] left-[-120px] size-[420px] bg-berry/50" style={{ animationDelay: "-5s" }} />
      <Dust />
      <div className="wrap relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="fade-up">
          <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-cream/60">
            <Link href="/" className="hover:text-gold-light">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-gold-light">{crumb}</span>
          </nav>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="h1 mt-4 mb-6">{title}</h1>
          <p className="lead max-w-[560px]">{lead}</p>
          {children}
        </div>
        {aside ? <div className="fade-up hidden lg:block" style={{ animationDelay: "200ms" }}><div className="float-y">{aside}</div></div> : null}
      </div>
    </section>
  );
}

export function Empty({ icon = "inbox", title, children }: { icon?: Parameters<typeof Icon>[0]["name"]; title: string; children?: React.ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-cheesecake text-berry">
        <Icon name={icon} />
      </span>
      <b className="font-serif text-xl">{title}</b>
      {children ? <p className="max-w-sm text-sm text-muted">{children}</p> : null}
    </div>
  );
}

export function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="stars" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
    </span>
  );
}
