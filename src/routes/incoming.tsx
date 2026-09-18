import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  receiveIncomingStock,
  useFactoryStore,
} from "../lib/factoryStore";
import { INITIAL_INCOMING_ENTRIES, LOCATIONS, SUPPLIERS, type Location } from "../lib/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/incoming")({
  head: () => ({
    meta: [
      { title: "Incoming Stock (GRN) — Leather Factory" },
      {
        name: "description",
        content:
          "Record and track raw materials, hides, chemicals, and component supplies received at the Leather Factory.",
      },
    ],
  }),
  component: IncomingPage,
});

function IncomingPage() {
  const store = useFactoryStore();

  const [entries, setEntries] = useState(INITIAL_INCOMING_ENTRIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  // New GRN state
  const [grnNumber, setGrnNumber] = useState(`IN-${Math.floor(10000 + Math.random() * 90000)}`);
  const [supplier, setSupplier] = useState(SUPPLIERS[0]);
  const [warehouse, setWarehouse] = useState<Location>("Main Warehouse");
  const [selectedItemId, setSelectedItemId] = useState(store.rawMaterials[0]?.id || "");
  const [quantity, setQuantity] = useState("500");
  const [rate, setRate] = useState("110");
  const [notes, setNotes] = useState("");

  const selectedItem =
    store.rawMaterials.find((m) => m.id === selectedItemId) ||
    store.components.find((c) => c.id === selectedItemId);

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const qty = parseFloat(quantity) || 0;
    const itemRate = parseFloat(rate) || 0;

    if (qty <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const res = receiveIncomingStock({
      grnNumber,
      supplier,
      warehouse,
      receivedBy: "R. Geetha",
      items: [
        {
          itemId: selectedItem.id,
          itemCode: "itemCode" in selectedItem ? selectedItem.itemCode : (selectedItem as any).sku,
          itemName: selectedItem.itemName,
          quantity: qty,
          unit: selectedItem.unit,
          rate: itemRate,
          total: Math.round(qty * itemRate),
        },
      ],
    });

    if (res.success) {
      toast.success(res.message);
      setIsRecordOpen(false);
    }
  };

  return (
    <AppLayout headerTitle="Purchasing & Incoming GRN">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Incoming Goods Receipts (GRN)
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Receive raw leather hides, chemicals, hardware, and packaging components.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRecordOpen(true)}
          className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Record GRN Arrival
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Incoming Deliveries
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {store.stockMovements.filter((m) => m.type === "Incoming").length}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium">Logged GRN shipments</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Raw Hides Received
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            1,350 <span className="text-[13px] font-normal text-muted-foreground">Sq.ft</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Received this week</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Active Suppliers
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {SUPPLIERS.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Certified tanneries & vendors</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Pending Quality Approvals
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-warning">1</p>
          <p className="text-[11px] text-warning">Chemical dye batch pending approval</p>
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
            placeholder="Search GRN #, supplier, hide code…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* GRN LEDGER TABLE */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">GRN #</th>
              <th className="px-4 py-2.5 font-medium">Item / Material Received</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
              <th className="px-4 py-2.5 font-medium">Location</th>
              <th className="px-4 py-2.5 font-medium">Received By</th>
            </tr>
          </thead>
          <tbody>
            {store.stockMovements
              .filter((m) => m.type === "Incoming")
              .filter(
                (m) =>
                  !searchQuery ||
                  m.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.reference.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((mov) => (
                <tr key={mov.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.date}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                    {mov.reference}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {mov.itemName}
                    <span className="ml-1 text-[10px] text-muted-foreground">({mov.itemCode})</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.category}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-success">
                    {mov.quantityDisplay}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.location}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.user}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* RECORD GRN DIALOG */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Goods Receipt Note (GRN)</DialogTitle>
            <DialogDescription>
              Receive incoming raw materials or components directly into factory inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordSubmit} className="space-y-3 text-[13px]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">GRN Number</label>
                <input
                  type="text"
                  required
                  value={grnNumber}
                  onChange={(e) => setGrnNumber(e.target.value)}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Supplier Vendor</label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  {SUPPLIERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Material / Component Received</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              >
                <optgroup label="Raw Materials">
                  {store.rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.itemCode} — {m.itemName} (Current Stock: {m.currentStock} {m.unit})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Components & Accessories">
                  {store.components.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.itemCode} — {c.itemName} (Current Stock: {c.currentStock} {c.unit})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Unit Rate (₹)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Warehouse</label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value as Location)}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Inspection Notes / Batch Lot</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hide quality inspection notes or invoice number..."
                className="w-full rounded-sm border border-input bg-background p-2 text-[13px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsRecordOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Receive & Add to Stock
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
