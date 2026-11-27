export const fmtDate = (iso: string, o: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) =>
  new Date(iso).toLocaleDateString("en-PH", { timeZone: "Asia/Manila", ...o });

export function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Today in Manila as YYYY-MM-DD. */
export const todayPH = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);

export const dayLabel = (d: string) => fmtDate(`${d}T12:00:00+08:00`, { weekday: "short", day: "numeric", month: "short" });

/** Current time in ms (server components read this per request). */
export const nowMs = () => Date.now();
