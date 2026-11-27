import { biz, LINKS } from "@/lib/content";
import { Icon, type IconName } from "./Icon";

export function MapEmbed({ className = "" }: { className?: string }) {
  return (
    <div className={`relative min-h-[300px] overflow-hidden rounded-3xl border border-line bg-[#F3EADA] lg:min-h-[440px] ${className}`}>
      <iframe
        title="Map to Iligan Cheesecake House"
        src={LINKS.mapsEmbed}
        className="absolute inset-0 size-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-sm absolute bottom-4 left-4 shadow-lg">
        <Icon name="map" /> Get directions
      </a>
    </div>
  );
}

function Card({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[48px_1fr] items-start gap-4 rounded-[18px] border border-line bg-white px-5 py-[18px]">
      <span className="grid size-12 place-items-center rounded-[14px] bg-cheesecake text-berry">
        <Icon name={icon} />
      </span>
      <div>
        <b className="mb-0.5 block text-xs font-semibold tracking-[.16em] text-gold-deep uppercase">{title}</b>
        {children}
      </div>
    </div>
  );
}

export function ContactCards() {
  return (
    <div className="grid content-start gap-4">
      <Card icon="pin" title="Address">
        <p className="text-[15px] leading-[23px]">0002 Bauhina St. cor. Champaca St., San Miguel Village, Pala-o, Iligan City</p>
        <small className="block text-[13px] text-muted">{biz.address.landmark}</small>
      </Card>
      <Card icon="clock" title="Hours">
        <div className="mt-1 grid grid-cols-[auto_auto] justify-start gap-x-6 gap-y-0.5 text-sm">
          <span>Tuesday – Sunday</span>
          <span>11:30am – 9:30pm</span>
          <span>Monday</span>
          <span className="font-semibold text-berry">Rest day</span>
        </div>
        <small className="mt-1 block text-xs text-muted">We sometimes open on Mondays for special occasions.</small>
      </Card>
      <Card icon="phone" title="Call or message">
        <p className="flex flex-wrap gap-x-3 text-[15px] leading-[23px]">
          <a className="font-semibold hover:text-berry" href={LINKS.phone}>
            {biz.phone}
          </a>
          <a className="font-semibold text-berry hover:underline" href={LINKS.messenger} target="_blank" rel="noopener noreferrer">
            Messenger
          </a>
        </p>
        <a href={LINKS.email} className="block text-[13px] break-all text-muted hover:text-berry">
          {biz.email}
        </a>
      </Card>
      <Card icon="ig" title="Follow">
        <p className="flex flex-wrap gap-x-3 text-[15px] leading-[23px]">
          <a href={LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-berry">
            Facebook
          </a>
          <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-berry">
            Instagram
          </a>
          <a href={LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-berry">
            TikTok
          </a>
        </p>
        <small className="block text-[13px] text-muted">@iligancheesecakehouse</small>
      </Card>
    </div>
  );
}
