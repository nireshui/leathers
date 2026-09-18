import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inventory Dashboard — Leather Factory" },
      {
        name: "description",
        content:
          "Minimal inventory management dashboard for a leather factory — stock levels, incoming and outgoing movements, and low stock alerts at a glance.",
      },
      { property: "og:title", content: "Inventory Dashboard — Leather Factory" },
      {
        property: "og:description",
        content:
          "Track total stock, incoming and outgoing movements, and low stock items at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

/* ---------------------------------- Data ---------------------------------- */

const KPIS = [
  { label: "Total Stock", value: "12,450", unit: "units", note: "Across 24 items" },
  { label: "Incoming Today", value: "850", unit: "units", note: "3 deliveries" },
  { label: "Outgoing Today", value: "420", unit: "units", note: "5 dispatches" },
  { label: "Low Stock", value: "8", unit: "items", note: "Below minimum", tone: "warning" },
];

const MOVEMENTS = [
  {
    date: "Today",
    item: "Cow Leather",
    type: "Incoming",
    quantity: "+500 Sq.ft",
    reference: "IN-00125",
  },
  {
    date: "Today",
    item: "Goat Leather",
    type: "Outgoing",
    quantity: "−120 Sq.ft",
    reference: "OUT-00089",
  },
  {
    date: "Yesterday",
    item: "Leather Dye",
    type: "Incoming",
    quantity: "+50 Kg",
    reference: "IN-00124",
  },
];

const LOW_STOCK = [
  { item: "Cow Leather", current: "120", minimum: "200", status: "Low" },
  { item: "Leather Dye", current: "15 Kg", minimum: "25 Kg", status: "Low" },
];

type Range = "7d" | "30d" | "3m";

function seededSeries(seed: number, n: number, base: number, amp: number) {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    out.push(Math.round(base + (x / 233280) * amp));
  }
  return out;
}

const MONTHS = ["Jun", "Jul", "Aug", "Sep"];

function buildChartData() {
  const days7 = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
    incoming: [520, 640, 410, 730, 590, 380, 850],
    outgoing: [310, 450, 280, 520, 410, 260, 420],
  };
  const incoming30 = seededSeries(7, 30, 300, 550);
  incoming30[29] = 850;
  const outgoing30 = seededSeries(19, 30, 200, 380);
  outgoing30[29] = 420;
  const days30 = {
    labels: Array.from({ length: 30 }, (_, i) => (i < 17 ? `Sep ${i + 1}` : `Aug ${i + 1 - 17}`)),
    incoming: incoming30,
    outgoing: outgoing30,
  };
  const incoming3m = seededSeries(41, 12, 2400, 2600);
  const outgoing3m = seededSeries(63, 12, 1600, 1800);
  const months3m = {
    labels: Array.from({ length: 12 }, (_, i) => {
      const week = i % 4;
      const month = MONTHS[Math.floor(i / 4)];
      return week === 0 ? month : `${month} w${week + 1}`;
    }),
    incoming: incoming3m,
    outgoing: outgoing3m,
  };
  return { "7d": days7, "30d": days30, "3m": months3m } as Record<Range, typeof days7>;
}

/* ------------------------------ Small pieces ------------------------------ */

function Badge({
  tone,
  children,
}: {
  tone: "success" | "neutral" | "warning";
  children: React.ReactNode;
}) {
  const tones = {
    success: "bg-success/10 text-success border-success/20",
    neutral: "bg-secondary text-secondary-foreground border-border",
    warning: "bg-warning/10 text-warning border-warning/20",
  } as const;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-4 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/* ---------------------------------- Chart --------------------------------- */

/* ---------------------------------- Chart --------------------------------- */

function StockChart() {
  const [range, setRange] = useState<Range>("7d");
  const all = useMemo(buildChartData, []);
  const data = all[range];

  const max = Math.max(...data.incoming, ...data.outgoing);
  const niceMax = Math.ceil(max / 250) * 250;
  const labelEvery = range === "7d" ? 1 : range === "30d" ? 5 : 2;

  // SVG dimensions for line graph calculation
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 20;
  const paddingY = 15;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const pointsCount = data.labels.length;

  const getX = (index: number) => {
    if (pointsCount <= 1) return paddingX;
    return paddingX + (index / (pointsCount - 1)) * chartW;
  };

  const getY = (val: number) => {
    const ratio = Math.min(1, Math.max(0, val / niceMax));
    return svgHeight - paddingY - ratio * chartH;
  };

  // Build SVG path commands
  const buildPath = (values: number[]) => {
    return values
      .map((val, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(val).toFixed(1)}`)
      .join(" ");
  };

  const buildAreaPath = (values: number[]) => {
    const linePath = buildPath(values);
    const lastX = getX(values.length - 1).toFixed(1);
    const firstX = getX(0).toFixed(1);
    const bottomY = (svgHeight - paddingY).toFixed(1);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const incomingPath = buildPath(data.incoming);
  const incomingArea = buildAreaPath(data.incoming);

  const outgoingPath = buildPath(data.outgoing);
  const outgoingArea = buildAreaPath(data.outgoing);

  return (
    <Panel
      title="Stock Overview"
      action={
        <div className="flex items-center gap-3">
          <div className="mr-1 hidden items-center gap-4 text-[11px] text-muted-foreground sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Incoming
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/60" /> Outgoing
            </span>
          </div>
          <div className="flex rounded-sm border border-border p-0.5">
            {(
              [
                ["7d", "7 Days"],
                ["30d", "30 Days"],
                ["3m", "3 Months"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                className={`rounded-[3px] px-2 py-1 text-[11px] font-medium transition-colors ${
                  range === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div className="px-4 pb-4 pt-5">
        <div className="relative h-52">
          {/* Y-axis grid lines */}
          {[1, 0.5, 0].map((f) => (
            <div
              key={f}
              className="absolute left-0 right-0 border-t border-dashed border-border"
              style={{ top: `${(1 - f) * 100}%` }}
            >
              <span className="absolute -top-2 right-0 bg-card pl-1 text-[10px] tabular-nums text-muted-foreground">
                {Math.round(niceMax * f).toLocaleString()}
              </span>
            </div>
          ))}

          {/* SVG Line Graph */}
          <div className="absolute inset-0 pr-10">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
            >
              <defs>
                <linearGradient id="incomingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="outgoingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fills */}
              <path d={incomingArea} fill="url(#incomingGrad)" />
              <path d={outgoingArea} fill="url(#outgoingGrad)" />

              {/* Line strokes */}
              <path
                d={outgoingPath}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              />
              <path
                d={incomingPath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data point dots */}
              {data.labels.map((label, i) => {
                const incY = getY(data.incoming[i] ?? 0);
                const outY = getY(data.outgoing[i] ?? 0);
                const x = getX(i);
                return (
                  <g key={label + i} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={outY}
                      r="3.5"
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      className="transition-all group-hover:r-5"
                    >
                      <title>{`${label} — Outgoing: ${(data.outgoing[i] ?? 0).toLocaleString()} units`}</title>
                    </circle>
                    <circle
                      cx={x}
                      cy={incY}
                      r="4"
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--card))"
                      strokeWidth="2"
                      className="transition-all group-hover:r-5"
                    >
                      <title>{`${label} — Incoming: ${(data.incoming[i] ?? 0).toLocaleString()} units`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* X-axis Labels */}
        <div className="mt-2 flex gap-[3px] pr-10">
          {data.labels.map((label, i) => (
            <div key={label + i} className="flex-1 text-center">
              <span className="text-[10px] text-muted-foreground">
                {i % labelEvery === 0 || i === data.labels.length - 1 ? label : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------- Page ---------------------------------- */

function Index() {
  return (
    <AppLayout headerTitle="Inventory Dashboard">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map(({ label, value, unit, note, tone }) => (
          <div key={label} className="rounded-md border border-border bg-card px-4 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7">
              {value} <span className="text-[13px] font-normal text-muted-foreground">{unit}</span>
            </p>
            <p
              className={`mt-0.5 text-[11px] ${tone === "warning" ? "text-warning" : "text-muted-foreground"}`}
            >
              {note}
            </p>
          </div>
        ))}
      </div>

      {/* Stock overview chart */}
      <StockChart />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Recent movements */}
        <div className="lg:col-span-3">
          <Panel title="Recent Stock Movements">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 text-right font-medium">Quantity</th>
                  <th className="px-4 py-2 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {MOVEMENTS.map(({ date, item, type, quantity, reference }) => (
                  <tr
                    key={reference}
                    className="border-b border-border last:border-0 hover:bg-accent/60"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">{date}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium">{item}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={type === "Incoming" ? "success" : "neutral"}>{type}</Badge>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-2.5 text-right font-medium tabular-nums ${
                        quantity.startsWith("+") ? "text-success" : "text-foreground"
                      }`}
                    >
                      {quantity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-muted-foreground">
                      {reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        {/* Low stock */}
        <div className="lg:col-span-2">
          <Panel title="Low Stock" action={<Badge tone="warning">8 items low</Badge>}>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 text-right font-medium">Current</th>
                  <th className="px-4 py-2 text-right font-medium">Minimum</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {LOW_STOCK.map(({ item, current, minimum }) => (
                  <tr
                    key={item}
                    className="border-b border-border last:border-0 hover:bg-accent/60"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium">
                      <span className="flex items-center gap-2">
                        <Package size={13} className="text-warning" strokeWidth={1.8} />
                        {item}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                      {current}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {minimum}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone="warning">Low Stock</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-4 py-2.5">
              <p className="text-[11px] text-muted-foreground">
                6 more items below minimum in Inventory.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}
