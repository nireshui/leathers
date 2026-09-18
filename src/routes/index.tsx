import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CheckCircle2,
  Clock,
  Factory,
  Layers,
  PackageCheck,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { useFactoryStore } from "../lib/factoryStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leather Factory Manufacturing & Inventory Dashboard" },
      {
        name: "description",
        content:
          "Manufacturing inventory dashboard for a leather product factory — raw material stock, WIP, finished goods, production overview, low stock alerts, and recent stock movements.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const store = useFactoryStore();

  const metrics = useMemo(() => {
    const totalRMStock = store.rawMaterials.reduce((acc, m) => acc + m.currentStock, 0);
    const lowRMCount = store.rawMaterials.filter(
      (m) => m.status === "Low Stock" || m.status === "Out of Stock"
    ).length;

    const activeWIPOrders = store.productionOrders.filter(
      (o) => o.status === "In Production"
    ).length;

    const totalWIPUnits = store.wipItems
      .filter((w) => w.status === "In Production")
      .reduce((acc, w) => acc + w.quantity, 0);

    const totalFinishedStock = store.finishedProducts.reduce((acc, f) => acc + f.currentStock, 0);
    const lowFinishedCount = store.finishedProducts.filter(
      (f) => f.status === "Low Stock" || f.status === "Out of Stock"
    ).length;

    const totalLowStockCount = lowRMCount + lowFinishedCount;

    return {
      totalRMStock,
      rmItemsCount: store.rawMaterials.length,
      activeWIPOrders,
      totalWIPUnits,
      totalFinishedStock,
      fpCount: store.finishedProducts.length,
      totalLowStockCount,
    };
  }, [store]);

  // Production status overview counters
  const productionOverview = useMemo(() => {
    const planned = store.productionOrders.filter((o) => o.status === "Planned").length;
    const inProd = store.productionOrders.filter((o) => o.status === "In Production").length;
    const completed = store.productionOrders.filter((o) => o.status === "Completed").length;

    return { planned, inProd, completed };
  }, [store]);

  // Low stock list (combines Raw Materials and Finished Products)
  const lowStockList = useMemo(() => {
    const rmLow = store.rawMaterials
      .filter((m) => m.status === "Low Stock" || m.status === "Out of Stock")
      .map((m) => ({
        item: m.itemName,
        category: "Raw Material",
        current: `${m.currentStock} ${m.unit}`,
        minimum: `${m.minStock} ${m.unit}`,
        status: m.status,
      }));

    const fpLow = store.finishedProducts
      .filter((f) => f.status === "Low Stock" || f.status === "Out of Stock")
      .map((f) => ({
        item: `${f.productName} (${f.variantName})`,
        category: "Finished Goods",
        current: `${f.currentStock} pairs`,
        minimum: `${f.minStock} pairs`,
        status: f.status,
      }));

    return [...rmLow, ...fpLow];
  }, [store]);

  return (
    <AppLayout headerTitle="Leather Factory Dashboard">
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Card 1: Raw Material Stock */}
        <div className="rounded-md border border-border bg-card p-4 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            1. Raw Material Stock
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {metrics.totalRMStock.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">Sq.ft</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Across {metrics.rmItemsCount} raw hide categories
          </p>
        </div>

        {/* Card 2: Work in Progress (WIP) */}
        <div className="rounded-md border border-border bg-card p-4 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            2. Work in Progress (WIP)
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {metrics.totalWIPUnits.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">units</span>
          </p>
          <p className="text-[11px] text-primary font-medium">
            {metrics.activeWIPOrders} production batches active
          </p>
        </div>

        {/* Card 3: Finished Goods */}
        <div className="rounded-md border border-border bg-card p-4 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            3. Finished Products
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {metrics.totalFinishedStock.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">pairs</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            Ready in warehouse across {metrics.fpCount} SKUs
          </p>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div className="rounded-md border border-border bg-card p-4 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            4. Low Stock Alerts
          </p>
          <p className="text-2xl font-bold tabular-nums text-warning">
            {metrics.totalLowStockCount} <span className="text-[13px] font-normal">items</span>
          </p>
          <p className="text-[11px] text-warning">Below minimum reorder threshold</p>
        </div>
      </div>

      {/* 2. PRODUCTION OVERVIEW & TODAY'S ACTIVITY */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Production Overview */}
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Factory size={16} className="text-primary" />
              Production Status Overview
            </h2>
            <span className="text-[11px] font-medium text-muted-foreground">
              Factory Shop Floor
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-sm bg-accent/40 p-2.5">
              <p className="text-[11px] text-muted-foreground">Planned</p>
              <p className="mt-1 text-xl font-bold text-foreground tabular-nums">
                {productionOverview.planned}
              </p>
            </div>
            <div className="rounded-sm bg-primary/10 border border-primary/20 p-2.5">
              <p className="text-[11px] text-primary font-medium">In Production</p>
              <p className="mt-1 text-xl font-bold text-primary tabular-nums">
                {productionOverview.inProd}
              </p>
            </div>
            <div className="rounded-sm bg-success/10 border border-success/20 p-2.5">
              <p className="text-[11px] text-success font-medium">Completed</p>
              <p className="mt-1 text-xl font-bold text-success tabular-nums">
                {productionOverview.completed}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Today's Factory Activity
            </h2>
            <span className="text-[11px] font-medium text-muted-foreground">Live Ledger</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-[12px]">
              <span className="text-muted-foreground">Incoming Hides:</span>
              <span className="font-bold text-foreground">+850 Sq.ft</span>
            </div>
            <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-[12px]">
              <span className="text-muted-foreground">Material Issued:</span>
              <span className="font-bold text-foreground">-1,260 Sq.ft</span>
            </div>
            <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-[12px]">
              <span className="text-muted-foreground">Shoes Completed:</span>
              <span className="font-bold text-success">+60 Pairs</span>
            </div>
            <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2 text-[12px]">
              <span className="text-muted-foreground">Dispatched Goods:</span>
              <span className="font-bold text-foreground">-50 Pairs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY AUDIT LEDGER & LOW STOCK LIST */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Recent Stock Movements */}
        <div className="lg:col-span-3 rounded-md border border-border bg-card overflow-hidden">
          <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-accent/20">
            <h2 className="text-sm font-bold text-foreground">Recent Factory Stock Movements</h2>
            <span className="text-[11px] text-muted-foreground">Read-Only Audit Ledger</span>
          </header>

          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Item / Product</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 text-right font-medium">Quantity</th>
                <th className="px-4 py-2 font-medium">Ref #</th>
              </tr>
            </thead>
            <tbody>
              {store.stockMovements.slice(0, 6).map((mov) => (
                <tr key={mov.id} className="border-b border-border last:border-0 hover:bg-accent/60">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                    {mov.date}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{mov.itemName}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {mov.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                      mov.quantity >= 0 ? "text-success" : "text-foreground"
                    }`}
                  >
                    {mov.quantityDisplay}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground text-[12px]">
                    {mov.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Items */}
        <div className="lg:col-span-2 rounded-md border border-border bg-card overflow-hidden">
          <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-warning/10">
            <h2 className="text-sm font-bold text-warning flex items-center gap-1.5">
              <AlertTriangle size={15} />
              Low Stock Reorder Alerts
            </h2>
            <span className="text-[11px] font-semibold text-warning">
              {lowStockList.length} items low
            </span>
          </header>

          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 text-right font-medium">Current</th>
                <th className="px-4 py-2 text-right font-medium">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStockList.map((row, idx) => (
                <tr key={idx} className="border-b border-border last:border-0 hover:bg-accent/60">
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {row.item}
                    <p className="text-[10px] text-muted-foreground">{row.category}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-warning tabular-nums">
                    {row.current}
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                    {row.minimum}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
