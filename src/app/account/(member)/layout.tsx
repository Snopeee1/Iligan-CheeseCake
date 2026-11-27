import { Logo } from "@/components/ui";
import { MemberNav, MemberTabs } from "@/components/MemberNav";
import { memberLogout } from "@/app/actions/member";
import { Icon } from "@/components/Icon";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh pb-24 md:pb-0">
      <header className="glow-dark sticky top-0 z-30 border-b border-gold/25">
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <Logo href="/account" />
          <MemberNav />
          <form action={memberLogout}>
            <button className="btn btn-outline btn-sm" aria-label="Sign out">
              <Icon name="logout" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>
      {children}
      <MemberTabs />
    </div>
  );
}
