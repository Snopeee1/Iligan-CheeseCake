const P = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12l5 5L20 7",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5",
  clock: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 7v5l3 2",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  users: "M9 5a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M21 20c0-2-1.5-4-4-4.5",
  user: "M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM4 21c0-4 4-6 8-6s8 2 8 6",
  cake: "M3 19h18M5 19v-7h14v7M5 12l7-6 7 6M9 15h6",
  pasta: "M3 11h18a9 9 0 0 1-18 0zM9 11c0-3 1-6 4-7M13 11c0-3 1-5 4-6",
  meal: "M3 3v6M6 3v6M3 9h3M4.5 9v12M13 7a6 6 0 1 1 0 12a6 6 0 0 1 0-12",
  coffee: "M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3",
  tag: "M4 12l8-8h7v7l-8 8zM15.5 7a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3",
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  star: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z",
  cal: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  inbox: "M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16",
  megaphone: "M3 10v4l11 5V5zM14 8h3a3 3 0 0 1 0 6h-3M6 14l1 5h3l-1-5",
  search: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14zM20 20l-4-4",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2",
  chat: "M4 5h16v11H8l-4 4z",
  send: "M4 12l16-8-6 16-2-6z",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  chevron: "M9 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  down: "M6 9l6 6 6-6",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
  gift: "M4 10h16v10H4zM2 7h20v3H2zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0",
  fb: "M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z",
  ig: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM17.5 6.5h.01",
  tiktok: "M14 3v11a4 4 0 1 1-4-4M14 3c0 3 2 5 5 5",
  map: "M9 4l6 2 6-2v16l-6 2-6-2-6 2V6zM9 4v16M15 6v16",
  menu: "M4 7h16M4 12h16M4 17h16",
  copy: "M8 8h12v12H8zM4 16V4h12",
  download: "M12 4v12M6 10l6 6 6-6M4 20h16",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4a2 2 0 0 0 0 4z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  scan: "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 12h16",
  leaf: "M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l7-7",
  award: "M12 3a6 6 0 1 0 0 12a6 6 0 0 0 0-12zM8.5 13.5L7 21l5-3 5 3-1.5-7.5",
} as const;

export type IconName = keyof typeof P;

export function Icon({ name, size = 20, className = "", strokeWidth = 1.6 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d={P[name]} />
    </svg>
  );
}
