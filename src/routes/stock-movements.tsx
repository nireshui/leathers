import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Eye,
  FilterX,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  RotateCcw,
  ArrowLeftRight,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  FileCode,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  INITIAL_INVENTORY_ITEMS,
  INITIAL_STOCK_MOVEMENTS,
  LOCATIONS,
  MOVEMENT_TYPES,
  type InventoryItem,
  type Location,
  type MovementType,
  type StockMovement,
} from "../lib/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/stock-movements")({
  head: () => ({
    meta: [
      { title: "Stock Movements — Leather Factory" },
      {
        name: "description",
        content:
          "Complete stock movement ledger and audit trail for Leather Factory inventory changes.",
      },
    ],
  }),
  component: StockMovementsPage,
});

/* -------------------------------- Badges -------------------------------- */

function MovementTypeBadge({ type }: { type: MovementType }) {
  const styles = {
    Incoming: "bg-success/10 text-success border-success/20",
    Outgoing: "bg-secondary text-secondary-foreground border-border",
    Adjustment: "bg-accent text-accent-foreground border-border",
    Return: "bg-warning/10 text-warning border-warning/20",
    Transfer: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  }[type];

  const Icon = {
    Incoming: ArrowDownToLine,
    Outgoing: ArrowUpFromLine,
    Adjustment: SlidersHorizontal,
    Return: RotateCcw,
    Transfer: ArrowLeftRight,
  }[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-medium leading-4 ${styles}`}
    >
      <Icon size={12} strokeWidth={2} />
      {type}
    </span>
  );
}

/* -------------------------------- Main Page ------------------------------- */

function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [viewingMovement, setViewingMovement] = useState<StockMovement | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // New Adjustment Form State
  const [newAdjustment, setNewAdjustment] = useState({
    itemId: INITIAL_INVENTORY_ITEMS[0].id,
    type: "Adjustment" as MovementType,
    quantity: 10,
    isPositive: true,
    location: LOCATIONS[0] as Location,
    user: "Admin",
    notes: "Physical stock audit correction.",
  });

  // Dynamic Metrics for Summary Cards
  const summary = useMemo(() => {
    // Requested exact base stats: Total 1,248, Stock In 720, Stock Out 528
    const addedCount = movements.length - INITIAL_STOCK_MOVEMENTS.length;
    let stockInCount = 720;
    let stockOutCount = 528;

    movements.forEach((m, idx) => {
      if (idx >= INITIAL_STOCK_MOVEMENTS.length) {
        if (
          m.type === "Incoming" ||
          m.type === "Return" ||
          (m.type === "Adjustment" && m.quantity > 0)
        ) {
          stockInCount++;
        } else {
          stockOutCount++;
        }
      }
    });

    return {
      totalMovements: 1248 + addedCount,
      stockIn: stockInCount,
      stockOut: stockOutCount,
    };
  }, [movements]);

  // Filtered movements list
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.movementId.toLowerCase().includes(q) ||
        m.itemName.toLowerCase().includes(q) ||
        m.itemCode.toLowerCase().includes(q) ||
        m.reference.toLowerCase().includes(q) ||
        m.user.toLowerCase().includes(q);

      const matchesDate =
        selectedDate === "all" ||
        (selectedDate === "today" && m.date.includes("17 Sep")) ||
        (selectedDate === "yesterday" && m.date.includes("16 Sep"));

      const matchesItem = selectedItem === "all" || m.itemId === selectedItem;

      const matchesType = selectedType === "all" || m.type === selectedType;

      return matchesSearch && matchesDate && matchesItem && matchesType;
    });
  }, [movements, searchQuery, selectedDate, selectedItem, selectedType]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDate !== "all" ||
    selectedItem !== "all" ||
    selectedType !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDate("all");
    setSelectedItem("all");
    setSelectedType("all");
    setCurrentPage(1);
  };

  // Paginated movements
  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1;
  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovements.slice(start, start + pageSize);
  }, [filteredMovements, currentPage]);

  // Export handler
  const handleExport = (format: "CSV" | "Excel" | "PDF") => {
    toast.success(
      `Exported ${summary.totalMovements.toLocaleString()} stock movements to ${format}.`,
    );
  };

  // Create Adjustment Movement Handler
  const handleCreateAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetInv = inventory.find((i) => i.id === newAdjustment.itemId) || inventory[0];
    const signedQty = newAdjustment.isPositive
      ? Math.abs(newAdjustment.quantity)
      : -Math.abs(newAdjustment.quantity);

    const prevBal = targetInv.currentStock;
    const newBal = Math.max(0, prevBal + signedQty);

    const created: StockMovement = {
      id: `mov-${Date.now()}`,
      movementId: `MOV-0${1249 + movements.length - INITIAL_STOCK_MOVEMENTS.length}`,
      date: "17 Sep 2026",
      dateTime: "17 Sep 2026, Just now",
      itemId: targetInv.id,
      itemCode: targetInv.itemCode,
      itemName: targetInv.itemName,
      type: newAdjustment.type,
      quantity: signedQty,
      quantityDisplay: `${signedQty > 0 ? "+" : ""}${signedQty.toLocaleString()} ${targetInv.unit}`,
      previousBalance: prevBal,
      newBalance: newBal,
      balanceDisplay: `${newBal.toLocaleString()} ${targetInv.unit}`,
      reference: `ADJ-000${19 + movements.length - INITIAL_STOCK_MOVEMENTS.length}`,
      location: newAdjustment.location,
      user: newAdjustment.user,
      notes: newAdjustment.notes.trim() || "Stock adjustment ledger entry.",
    };

    // Update movements list
    setMovements((prev) => [created, ...prev]);

    // Update inventory stock
    setInventory((prev) =>
      prev.map((item) =>
        item.id === targetInv.id
          ? { ...item, currentStock: newBal, lastUpdated: "Just now (Adjustment)" }
          : item,
      ),
    );

    setIsAdjustmentOpen(false);
    toast.success(`Adjustment ${created.movementId} created. Inventory balance updated.`);
  };

  return (
    <AppLayout
      headerTitle="Stock Movements"
      headerRightContent={
        <div className="flex items-center gap-3">
          <label className="relative hidden sm:block">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search movements, references…"
              className="h-8 w-60 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsAdjustmentOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Plus size={14} />
            Adjustment
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
              >
                <Download size={14} strokeWidth={2} />
                Export
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">
                Export Format
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("CSV")}>
                <FileCode className="mr-2 size-3.5" /> CSV File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("Excel")}>
                <FileSpreadsheet className="mr-2 size-3.5" /> Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("PDF")}>
                <FileText className="mr-2 size-3.5" /> PDF Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total Movements
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.totalMovements.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Audited stock transactions</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Stock In
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-success">
            {summary.stockIn.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-success">
            Incoming, returns & positive adjustments
          </p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Stock Out
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.stockOut.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Dispatches, transfers & issues</p>
        </div>
      </div>

      {/* Filter Row & Movements Ledger Table */}
      <section className="rounded-md border border-border bg-card">
        {/* Filters Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="h-8 w-44 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Date Range Filter */}
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Dates</option>
              <option value="today">Today (17 Sep)</option>
              <option value="yesterday">Yesterday (16 Sep)</option>
            </select>

            {/* Item Filter */}
            <select
              value={selectedItem}
              onChange={(e) => {
                setSelectedItem(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Items</option>
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.itemCode} — {inv.itemName}
                </option>
              ))}
            </select>

            {/* Movement Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Movement Types</option>
              {MOVEMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm px-2 text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <FilterX size={13} />
                Clear
              </button>
            )}
          </div>

          <div className="text-[12px] text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{filteredMovements.length}</span>{" "}
            movements
          </div>
        </div>

        {/* Stock Ledger Table (Read-Only) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Movement ID</th>
                <th className="px-4 py-2.5 font-semibold">Item</th>
                <th className="px-4 py-2.5 font-semibold">Type</th>
                <th className="px-4 py-2.5 text-right font-semibold">Quantity</th>
                <th className="px-4 py-2.5 text-right font-semibold">Balance</th>
                <th className="px-4 py-2.5 font-semibold">Reference</th>
                <th className="px-4 py-2.5 font-semibold">User</th>
                <th className="px-4 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Package size={24} className="text-muted-foreground/50" />
                      <p className="text-[13px] font-medium">No stock movement records found.</p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-1 text-[12px] font-medium text-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMovements.map((mov) => (
                  <tr
                    key={mov.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {mov.date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-foreground">
                      {mov.movementId}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <span className="font-mono text-[11px] text-muted-foreground mr-1.5">
                        {mov.itemCode}
                      </span>
                      {mov.itemName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <MovementTypeBadge type={mov.type} />
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${
                        mov.quantity > 0 ? "text-success" : "text-foreground"
                      }`}
                    >
                      {mov.quantityDisplay}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {mov.balanceDisplay}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                      {mov.reference}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {mov.user}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingMovement(mov)}
                        title="View Details"
                        className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors inline-flex items-center gap-1 text-[12px]"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredMovements.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredMovements.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {summary.totalMovements.toLocaleString()}
            </span>{" "}
            movements
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-7 items-center gap-1 rounded-sm border border-input bg-background px-2.5 font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              <ChevronLeft size={13} /> Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 rounded-sm border text-[12px] font-medium transition-colors ${
                    currentPage === pageNum
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && <span className="px-1 text-muted-foreground">…</span>}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-7 items-center gap-1 rounded-sm border border-input bg-background px-2.5 font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------ View Movement Modal ------------------------- */}
      {viewingMovement && (
        <Dialog open={!!viewingMovement} onOpenChange={(open) => !open && setViewingMovement(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold font-mono text-foreground">
                  {viewingMovement.movementId}
                </DialogTitle>
                <MovementTypeBadge type={viewingMovement.type} />
              </div>
              <DialogDescription className="text-[13px]">
                Stock Audit Ledger Detail — {viewingMovement.itemName} ({viewingMovement.itemCode})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-2.5 rounded-sm border border-border bg-muted/20 p-3 text-[12px]">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Date & Time
                  </p>
                  <p className="font-medium text-foreground">
                    {viewingMovement.dateTime || viewingMovement.date}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Reference
                  </p>
                  <p className="font-mono font-medium text-foreground">
                    {viewingMovement.reference}
                  </p>
                </div>
                <div className="mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Location
                  </p>
                  <p className="font-medium text-foreground">{viewingMovement.location}</p>
                </div>
                <div className="mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Recorded By
                  </p>
                  <p className="font-medium text-foreground">{viewingMovement.user}</p>
                </div>
              </div>

              {/* Movement Quantities */}
              <div className="rounded-sm border border-border bg-card p-3 space-y-2 text-[12px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Previous Stock Balance</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {viewingMovement.previousBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Movement Quantity</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      viewingMovement.quantity > 0 ? "text-success" : "text-foreground"
                    }`}
                  >
                    {viewingMovement.quantityDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-1.5 text-[13px] font-semibold text-foreground">
                  <span>New Stock Balance</span>
                  <span className="tabular-nums text-primary">
                    {viewingMovement.balanceDisplay}
                  </span>
                </div>
              </div>

              {viewingMovement.notes && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">
                    Audit Notes
                  </p>
                  <p className="mt-0.5 rounded-sm border border-border bg-background p-2.5 text-[12px] text-foreground">
                    {viewingMovement.notes}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setViewingMovement(null)}
                className="h-8 rounded-sm border border-input bg-background px-4 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ----------------------- Record Adjustment Modal ---------------------- */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Record Stock Adjustment
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Record physical count audit corrections or stock adjustments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAdjustmentSubmit} className="space-y-3 py-2 text-[13px]">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Item *
              </label>
              <select
                value={newAdjustment.itemId}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, itemId: e.target.value })}
                className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {inventory.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.itemCode} — {inv.itemName} ({inv.currentStock} {inv.unit} in stock)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Adjustment Direction
                </label>
                <select
                  value={newAdjustment.isPositive ? "add" : "subtract"}
                  onChange={(e) =>
                    setNewAdjustment({ ...newAdjustment, isPositive: e.target.value === "add" })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="add">+ Add Stock (Audit Gain)</option>
                  <option value="subtract">- Reduce Stock (Audit Loss)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Adjustment Qty *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={newAdjustment.quantity}
                  onChange={(e) =>
                    setNewAdjustment({
                      ...newAdjustment,
                      quantity: Math.abs(parseFloat(e.target.value) || 0),
                    })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Warehouse Location
                </label>
                <select
                  value={newAdjustment.location}
                  onChange={(e) =>
                    setNewAdjustment({ ...newAdjustment, location: e.target.value as Location })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Recorded By
                </label>
                <input
                  type="text"
                  value={newAdjustment.user}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, user: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Audit Notes / Reason *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Reason for stock correction..."
                value={newAdjustment.notes}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, notes: e.target.value })}
                className="mt-1 w-full rounded-sm border border-input bg-background p-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <DialogFooter className="pt-3">
              <button
                type="button"
                onClick={() => setIsAdjustmentOpen(false)}
                className="h-8 rounded-sm border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 rounded-sm bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Adjustment
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
