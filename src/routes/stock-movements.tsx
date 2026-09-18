import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Boxes,
  CheckCircle2,
  Clock,
  Eye,
  FilterX,
  Layers,
  RotateCcw,
  Search,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { useFactoryStore } from "../lib/factoryStore";
import { LOCATIONS } from "../lib/inventoryData";

export const Route = createFileRoute("/stock-movements")({
  head: () => ({
    meta: [
      { title: "Stock Movements Audit Ledger — Leather Factory" },
      {
        name: "description",
        content:
          "Read-only central inventory audit ledger recording all 11 movement types across raw materials, WIP, finished goods, and wastage.",
      },
    ],
  }),
  component: StockMovementsPage,
});

function StockMovementsPage() {
  const store = useFactoryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredMovements = useMemo(() => {
    return store.stockMovements.filter((mov) => {
      const matchesSearch =
        !searchQuery ||
        mov.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mov.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mov.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mov.movementId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "all" || mov.type === selectedType;
      const matchesCategory = selectedCategory === "all" || mov.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [store.stockMovements, searchQuery, selectedType, selectedCategory]);

  return (
    <AppLayout headerTitle="Stock Movements — Audit Ledger">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Central Inventory Audit Ledger
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Immutable, read-only transaction log for all 11 inventory movement types.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Total Ledger Entries
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {store.stockMovements.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Traceable inventory transactions</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Incoming Stock Movements
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">
            {store.stockMovements.filter((m) => m.type === "Incoming").length}
          </p>
          <p className="text-[11px] text-success font-medium">Supplier GRN receipts</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Production Outputs
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
            {store.stockMovements.filter((m) => m.type === "Production Output").length}
          </p>
          <p className="text-[11px] text-primary font-medium">Finished goods added to stock</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Dispatches & Outgoing
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {store.stockMovements.filter((m) => m.type === "Outgoing").length}
          </p>
          <p className="text-[11px] text-muted-foreground">Customer order shipments</p>
        </div>
      </div>

      {/* SEARCH / FILTERS */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search MOV ID, item code, reference…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 rounded-sm border border-input bg-background px-2.5 text-[12px]"
          >
            <option value="all">All Movement Types</option>
            <option value="Incoming">Incoming</option>
            <option value="Material Issue">Material Issue</option>
            <option value="Production Consumption">Production Consumption</option>
            <option value="Production Output">Production Output</option>
            <option value="Outgoing">Outgoing / Dispatch</option>
            <option value="Adjustment">Adjustment</option>
            <option value="Transfer">Transfer</option>
            <option value="Wastage">Wastage</option>
            <option value="Rejection">Rejection</option>
            <option value="Opening Stock">Opening Stock</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 rounded-sm border border-input bg-background px-2.5 text-[12px]"
          >
            <option value="all">All Categories</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Component">Component</option>
            <option value="Accessory">Accessory</option>
            <option value="Finished Goods">Finished Goods</option>
          </select>
        </div>
      </div>

      {/* READ-ONLY AUDIT LEDGER TABLE */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Date & Time</th>
              <th className="px-4 py-2.5 font-medium">Movement ID</th>
              <th className="px-4 py-2.5 font-medium">Item / Product</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
              <th className="px-4 py-2.5 text-right font-medium">New Balance</th>
              <th className="px-4 py-2.5 font-medium">Reference</th>
              <th className="px-4 py-2.5 font-medium">User</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((mov) => (
              <tr key={mov.id} className="border-b border-border hover:bg-accent/40">
                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                  {mov.dateTime || mov.date}
                </td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{mov.movementId}</td>
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {mov.itemName}
                  <span className="ml-1 text-[10px] text-muted-foreground">({mov.itemCode})</span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{mov.category}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground border border-border">
                    {mov.type}
                  </span>
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-bold tabular-nums ${
                    mov.quantity >= 0 ? "text-success" : "text-foreground"
                  }`}
                >
                  {mov.quantityDisplay}
                </td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">
                  {mov.balanceDisplay}
                </td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground text-[12px]">
                  {mov.reference}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{mov.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
