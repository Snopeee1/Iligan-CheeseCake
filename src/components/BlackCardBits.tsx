export const BC_BENEFITS = [
  { icon: "tag" as const, t: "Member discounts", d: "25% off the Chef VIP Special Menu · 10% off the regular menu for you + up to 4 companions" },
  { icon: "coffee" as const, t: "₱1,200 back in vouchers", d: "3 × ₱400 food & drink vouchers, one per dine-in, PIN-protected" },
  { icon: "home" as const, t: "₱2,000 off VIP Rooms", d: "Spend ₱2,000 less on every private room" },
  { icon: "star" as const, t: "Free every visit", d: "Hot or Cold Americano or Fruitea · a free slice on your birthday month · no minimum spend" },
];

export function CompareTable() {
  const rows: [string, string, string][] = [
    ["Regular menu", "Standard prices", "10% off · you + 4"],
    ["Chef VIP Menu", "Members only", "25% off"],
    ["Family Room", "₱8,000 food & drinks", "₱6,000 food & drinks"],
    ["Corporate Room", "₱12,000 food & drinks", "₱10,000 food & drinks"],
    ["Seminar Room", "₱20,000 food & drinks", "₱18,000 food & drinks"],
    ["Membership", "—", "₱2,200 · ₱1,200 back"],
    ["Validity", "—", "1 year"],
  ];
  return (
    <div className="cmp" role="table" aria-label="Regular guest vs Black Card member">
      <div className="tr" role="row">
        <span role="columnheader" />
        <span role="columnheader">Regular guest</span>
        <span role="columnheader">Black Card member</span>
      </div>
      {rows.map(([a, b, c]) => (
        <div className="tr" role="row" key={a}>
          <b role="rowheader">{a}</b>
          <span role="cell">{b}</span>
          <span role="cell">{c}</span>
        </div>
      ))}
    </div>
  );
}

