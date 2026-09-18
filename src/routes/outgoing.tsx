import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Eye,
  FilterX,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  dispatchFinishedGoods,
  useFactoryStore,
} from "../lib/factoryStore";
import { INITIAL_CUSTOMERS, LOCATIONS, type Location } from "../lib/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/outgoing")({
  head: () => ({
    meta: [
      { title: "Outgoing / Dispatch — Leather Factory" },
      {
        name: "description",
        content:
          "Manage customer dispatches of finished goods and raw material stock issues with clear purpose tracking.",
      },
    ],
  }),
  component: OutgoingPage,
});

type DispatchType = "Finished Product" | "Raw Material / Component";

function OutgoingPage() {
  const store = useFactoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<string>("all");
  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);

  // New Dispatch Form State
  const [dispatchType, setDispatchType] = useState<DispatchType>("Finished Product");
  const [customerName, setCustomerName] = useState(INITIAL_CUSTOMERS[0]?.customerName || "ABC Leather Works");
  const [selectedFpId, setSelectedFpId] = useState(store.finishedProducts[0]?.id || "");
  const [selectedRmId, setSelectedRmId] = useState(store.rawMaterials[0]?.id || "");
  const [quantity, setQuantity] = useState("10");
  const [referenceNumber, setReferenceNumber] = useState(`SO-${Math.floor(10000 + Math.random() * 90000)}`);
  const [purpose, setPurpose] = useState<string>("Customer Order");
  const [issuedBy, setIssuedBy] = useState("R. Geetha");
  const [notes, setNotes] = useState("");

  const selectedFpItem = store.finishedProducts.find((f) => f.id === selectedFpId);
  const selectedRmItem = store.rawMaterials.find((m) => m.id === selectedRmId);

  // Available stock check error message
  const availableStock = dispatchType === "Finished Product"
    ? (selectedFpItem?.currentStock || 0)
    : (selectedRmItem?.currentStock || 0);

  const requestedQty = parseFloat(quantity) || 0;
  const isInsufficientStock = requestedQty > availableStock;

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (requestedQty <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    if (isInsufficientStock) {
      toast.error(
        `Insufficient finished product stock. Requested ${requestedQty}, but only ${availableStock} available in inventory.`
      );
      return;
    }

    if (dispatchType === "Finished Product") {
      if (!selectedFpItem) return;
      const res = dispatchFinishedGoods({
        customerName,
        sku: selectedFpItem.sku,
        quantity: requestedQty,
        referenceNumber,
        issuedBy,
        notes,
      });

      if (res.success) {
        toast.success(res.message);
        setIsNewDispatchOpen(false);
      } else {
        toast.error(res.message);
      }
    } else {
      // Raw Material / Component Issue
      if (!selectedRmItem) return;
      toast.success(
        `Issued ${requestedQty} ${selectedRmItem.unit} of ${selectedRmItem.itemName} for ${purpose}`
      );
      setIsNewDispatchOpen(false);
    }
  };

  return (
    <AppLayout headerTitle="Outgoing / Customer Dispatch">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Dispatch & Outgoing Stock
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Customer order dispatches, finished product shipments, and raw material issues.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewDispatchOpen(true)}
          className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          New Dispatch Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Finished Goods Outgoing
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {store.stockMovements.filter((m) => m.type === "Outgoing").length}
          </p>
          <p className="text-[11px] text-muted-foreground">Recent customer dispatches</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Available Finished Goods
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {store.finishedProducts.reduce((a, b) => a + b.currentStock, 0)}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">pairs</span>
          </p>
          <p className="text-[11px] text-muted-foreground">In stock across 5 SKUs</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Material Issues
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {store.stockMovements.filter((m) => m.type === "Material Issue").length}
          </p>
          <p className="text-[11px] text-muted-foreground">Raw leather issued to production</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Active Customers
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {INITIAL_CUSTOMERS.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Registered buyers & distributors</p>
        </div>
      </div>

      {/* SEARCH / FILTER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search dispatch ref, customer, item…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* DISPATCH LEDGER TABLE */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Reference #</th>
              <th className="px-4 py-2.5 font-medium">Item / Product Dispatched</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Purpose / Customer</th>
              <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
              <th className="px-4 py-2.5 font-medium">Location</th>
              <th className="px-4 py-2.5 font-medium">Issued By</th>
            </tr>
          </thead>
          <tbody>
            {store.stockMovements
              .filter((m) => m.type === "Outgoing" || m.type === "Material Issue")
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
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {mov.type === "Outgoing" ? "Customer Order" : "Production Issue"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                    {mov.quantityDisplay}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.location}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.user}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* NEW DISPATCH DIALOG */}
      <Dialog open={isNewDispatchOpen} onOpenChange={setIsNewDispatchOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Dispatch / Outgoing Order</DialogTitle>
            <DialogDescription>
              Record finished goods customer dispatch or raw material factory issue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDispatchSubmit} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Dispatch Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-[13px]">
                  <input
                    type="radio"
                    name="dispatchType"
                    checked={dispatchType === "Finished Product"}
                    onChange={() => setDispatchType("Finished Product")}
                  />
                  <span>Finished Product (Customer Shipment)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[13px]">
                  <input
                    type="radio"
                    name="dispatchType"
                    checked={dispatchType === "Raw Material / Component"}
                    onChange={() => setDispatchType("Raw Material / Component")}
                  />
                  <span>Raw Material Issue</span>
                </label>
              </div>
            </div>

            {dispatchType === "Finished Product" ? (
              <>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium">Select Customer</label>
                  <select
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                  >
                    {INITIAL_CUSTOMERS.map((c) => (
                      <option key={c.id} value={c.customerName}>
                        {c.customerCode} — {c.customerName} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium">Select Finished Product</label>
                  <select
                    value={selectedFpId}
                    onChange={(e) => setSelectedFpId(e.target.value)}
                    className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                  >
                    {store.finishedProducts.map((fp) => (
                      <option key={fp.id} value={fp.id}>
                        {fp.sku} — {fp.productName} ({fp.variantName}) — Available: {fp.currentStock}{" "}
                        pairs
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium">Select Raw Material</label>
                  <select
                    value={selectedRmId}
                    onChange={(e) => setSelectedRmId(e.target.value)}
                    className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                  >
                    {store.rawMaterials.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.itemCode} — {rm.itemName} — Available: {rm.currentStock} {rm.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium">Transaction Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                  >
                    <option value="Production">Production</option>
                    <option value="Internal Transfer">Internal Transfer</option>
                    <option value="Sample">Sample</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Return">Return</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Quantity Requested</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`h-8 w-full rounded-sm border bg-background px-2.5 text-[13px] font-bold ${
                    isInsufficientStock ? "border-destructive text-destructive" : "border-input"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Available Stock</label>
                <input
                  type="text"
                  disabled
                  value={`${availableStock} ${
                    dispatchType === "Finished Product" ? "pairs" : selectedRmItem?.unit || "units"
                  }`}
                  className="h-8 w-full rounded-sm border border-input bg-accent/50 px-2.5 text-[13px] font-bold text-muted-foreground"
                />
              </div>
            </div>

            {/* STOCK VALIDATION WARNING */}
            {isInsufficientStock && (
              <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-2.5 text-destructive flex items-center gap-2 text-[12px]">
                <AlertTriangle size={15} />
                <span>
                  <strong>Insufficient finished product stock.</strong> Requested {requestedQty},
                  but only {availableStock} available in inventory.
                </span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Reference Number (SO / Invoice)</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsNewDispatchOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInsufficientStock}
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Confirm Dispatch
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
