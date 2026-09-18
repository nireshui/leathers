import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  FilterX,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Calendar,
  Truck,
  IndianRupee,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  INITIAL_INCOMING_ENTRIES,
  INITIAL_INVENTORY_ITEMS,
  LOCATIONS,
  SUPPLIERS,
  INCOMING_STATUSES,
  type IncomingEntry,
  type IncomingLineItem,
  type IncomingStatus,
  type InventoryItem,
  type Location,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/incoming")({
  head: () => ({
    meta: [
      { title: "Incoming Stock — Leather Factory" },
      {
        name: "description",
        content:
          "Record and track raw materials, chemicals, and supplies received at the Leather Factory.",
      },
    ],
  }),
  component: IncomingPage,
});

/* -------------------------------- Badges -------------------------------- */

function IncomingStatusBadge({ status }: { status: IncomingStatus }) {
  const styles = {
    Received: "bg-success/10 text-success border-success/20",
    Pending: "bg-warning/10 text-warning border-warning/20",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  }[status];

  const Icon = {
    Received: CheckCircle2,
    Pending: Clock,
    Cancelled: XCircle,
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-medium leading-4 ${styles}`}
    >
      <Icon size={12} strokeWidth={2} />
      {status}
    </span>
  );
}

/* -------------------------------- Main Page ------------------------------- */

function IncomingPage() {
  const [entries, setEntries] = useState<IncomingEntry[]>(INITIAL_INCOMING_ENTRIES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  // Modal States
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<IncomingEntry | null>(null);

  // Record Form State
  const [recordHeader, setRecordHeader] = useState({
    grnNumber: `IN-00${126 + entries.length - INITIAL_INCOMING_ENTRIES.length}`,
    date: "17 Sep 2026",
    supplier: SUPPLIERS[0],
    invoiceNumber: "",
    warehouse: LOCATIONS[0] as Location,
    receivedBy: "R. Geetha",
    notes: "",
    otherCharges: 0,
  });

  const [lineItems, setLineItems] = useState<IncomingLineItem[]>([
    {
      itemId: INITIAL_INVENTORY_ITEMS[0].id,
      itemCode: INITIAL_INVENTORY_ITEMS[0].itemCode,
      itemName: INITIAL_INVENTORY_ITEMS[0].itemName,
      quantity: 100,
      unit: INITIAL_INVENTORY_ITEMS[0].unit,
      rate: 110,
      total: 11000,
    },
  ]);

  // Dynamic calculations for record modal line totals & grand total
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.total || 0), 0);
  }, [lineItems]);

  const grandTotal = useMemo(() => {
    return subtotal + (Number(recordHeader.otherCharges) || 0);
  }, [subtotal, recordHeader.otherCharges]);

  // Dynamic Summary Cards Metrics
  const summary = useMemo(() => {
    // Exact requested base numbers: Today 850 units, Month 12,450 units, Pending 3
    let todayQty = 850;
    let monthQty = 12450;
    let pendingCount = 3;

    // Adjust for newly added/modified entries
    entries.forEach((e, idx) => {
      if (idx >= INITIAL_INCOMING_ENTRIES.length) {
        if (e.status === "Pending") pendingCount++;
        if (e.status === "Received") {
          monthQty += e.totalQuantity;
          if (e.date.includes("17 Sep")) todayQty += e.totalQuantity;
        }
      }
    });

    return {
      todayIncoming: todayQty,
      thisMonth: monthQty,
      pendingEntries: pendingCount,
    };
  }, [entries]);

  // Filtered entries for table
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.grnNumber.toLowerCase().includes(q) ||
        e.supplier.toLowerCase().includes(q) ||
        e.receivedBy.toLowerCase().includes(q) ||
        (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(q)) ||
        e.items.some(
          (item) =>
            item.itemName.toLowerCase().includes(q) || item.itemCode.toLowerCase().includes(q),
        );

      const matchesSupplier = selectedSupplier === "all" || e.supplier === selectedSupplier;

      const matchesStatus = selectedStatus === "all" || e.status === selectedStatus;

      const matchesDate =
        selectedDate === "all" ||
        (selectedDate === "today" && e.date.includes("17 Sep")) ||
        (selectedDate === "yesterday" && e.date.includes("16 Sep"));

      return matchesSearch && matchesSupplier && matchesStatus && matchesDate;
    });
  }, [entries, searchQuery, selectedSupplier, selectedStatus, selectedDate]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedSupplier !== "all" ||
    selectedStatus !== "all" ||
    selectedDate !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSupplier("all");
    setSelectedStatus("all");
    setSelectedDate("all");
  };

  // Add Item to Record Form
  const handleAddLineItem = () => {
    const defaultItem = inventory[0] || INITIAL_INVENTORY_ITEMS[0];
    setLineItems((prev) => [
      ...prev,
      {
        itemId: defaultItem.id,
        itemCode: defaultItem.itemCode,
        itemName: defaultItem.itemName,
        quantity: 50,
        unit: defaultItem.unit,
        rate: 100,
        total: 5000,
      },
    ]);
  };

  // Remove Item from Record Form
  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.error("At least one line item is required.");
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update line item property
  const handleLineItemChange = (
    index: number,
    field: keyof IncomingLineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "itemId") {
          const selectedInv = inventory.find((inv) => inv.id === value) || inventory[0];
          const newQty = item.quantity || 1;
          const newRate = item.rate || 100;
          return {
            ...item,
            itemId: selectedInv.id,
            itemCode: selectedInv.itemCode,
            itemName: selectedInv.itemName,
            unit: selectedInv.unit,
            total: newQty * newRate,
          };
        }

        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          const qty = Number(field === "quantity" ? value : item.quantity) || 0;
          const rate = Number(field === "rate" ? value : item.rate) || 0;
          updated.total = qty * rate;
        }
        return updated;
      }),
    );
  };

  // Save Record Handler
  const handleSaveIncomingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recordHeader.grnNumber || !recordHeader.supplier) {
      toast.error("Please fill in GRN Number and Supplier.");
      return;
    }

    if (lineItems.length === 0) {
      toast.error("Please add at least one line item.");
      return;
    }

    const totalQty = lineItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const mainUnit = lineItems[0]?.unit || "Units";

    const newEntry: IncomingEntry = {
      id: `in-${Date.now()}`,
      grnNumber: recordHeader.grnNumber,
      date: recordHeader.date || "17 Sep 2026",
      supplier: recordHeader.supplier,
      invoiceNumber: recordHeader.invoiceNumber.trim() || undefined,
      warehouse: recordHeader.warehouse,
      receivedBy: recordHeader.receivedBy.trim() || "R. Geetha",
      itemCount: lineItems.length,
      totalQuantity: totalQty,
      quantityDisplay: `${totalQty.toLocaleString()} ${mainUnit}`,
      subtotal,
      otherCharges: Number(recordHeader.otherCharges) || 0,
      grandTotal,
      status: "Received",
      notes: recordHeader.notes.trim() || undefined,
      items: lineItems,
    };

    // 1. Add new entry
    setEntries((prev) => [newEntry, ...prev]);

    // 2. Increase corresponding inventory stock quantities
    setInventory((prev) =>
      prev.map((invItem) => {
        const matchingLines = lineItems.filter((l) => l.itemId === invItem.id);
        if (matchingLines.length > 0) {
          const addedStock = matchingLines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
          const updatedStock = invItem.currentStock + addedStock;
          return {
            ...invItem,
            currentStock: updatedStock,
            lastUpdated: "Just now (Incoming)",
          };
        }
        return invItem;
      }),
    );

    setIsRecordOpen(false);
    toast.success(`GRN ${newEntry.grnNumber} saved. Inventory stock updated successfully.`);

    // Reset Form
    const nextGRNNum = `IN-00${127 + entries.length - INITIAL_INCOMING_ENTRIES.length}`;
    setRecordHeader({
      grnNumber: nextGRNNum,
      date: "17 Sep 2026",
      supplier: SUPPLIERS[0],
      invoiceNumber: "",
      warehouse: LOCATIONS[0] as Location,
      receivedBy: "R. Geetha",
      notes: "",
      otherCharges: 0,
    });
    setLineItems([
      {
        itemId: inventory[0]?.id || "lf-001",
        itemCode: inventory[0]?.itemCode || "LF-001",
        itemName: inventory[0]?.itemName || "Full Grain Cow Leather",
        quantity: 100,
        unit: inventory[0]?.unit || "Sq.ft",
        rate: 110,
        total: 11000,
      },
    ]);
  };

  return (
    <AppLayout
      headerTitle="Incoming Stock"
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incoming GRN, supplier…"
              className="h-8 w-60 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            />
          </label>
          <button
            type="button"
            onClick={() => setIsRecordOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} strokeWidth={2} />
            Record Incoming
          </button>
        </div>
      }
    >
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Today's Incoming
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.todayIncoming.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">units</span>
          </p>
          <p className="mt-0.5 text-[11px] text-success">Verified arrivals today</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            This Month
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.thisMonth.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">units</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Total received stock</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Pending Entries
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-warning">
            {summary.pendingEntries}
          </p>
          <p className="mt-0.5 text-[11px] text-warning">Awaiting verification / lab test</p>
        </div>
      </div>

      {/* Filter Row & Incoming Table */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-8 w-44 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Date Filter */}
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Dates</option>
              <option value="today">Today (17 Sep)</option>
              <option value="yesterday">Yesterday (16 Sep)</option>
            </select>

            {/* Supplier Filter */}
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Suppliers</option>
              {SUPPLIERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Statuses</option>
              {INCOMING_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
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
            Showing <span className="font-semibold text-foreground">{filteredEntries.length}</span>{" "}
            entries
          </div>
        </div>

        {/* Incoming Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">GRN / Entry No.</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Supplier</th>
                <th className="px-4 py-2.5 text-right font-semibold">Items</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total Qty</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total Value</th>
                <th className="px-4 py-2.5 font-semibold">Received By</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Package size={24} className="text-muted-foreground/50" />
                      <p className="text-[13px] font-medium">No incoming entries found.</p>
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
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-foreground">
                      {entry.grnNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {entry.date}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{entry.supplier}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {entry.itemCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {entry.quantityDisplay}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                      ₹{entry.grandTotal.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {entry.receivedBy}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <IncomingStatusBadge status={entry.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingEntry(entry)}
                          title="View Details"
                          className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <Eye size={14} />
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setViewingEntry(entry)}>
                              <Eye className="mr-2 size-3.5" /> View Receipt
                            </DropdownMenuItem>

                            {entry.status === "Pending" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEntries((prev) =>
                                    prev.map((e) =>
                                      e.id === entry.id ? { ...e, status: "Received" } : e,
                                    ),
                                  );
                                  toast.success(`GRN ${entry.grnNumber} marked as Received.`);
                                }}
                              >
                                <CheckCircle2 className="mr-2 size-3.5 text-success" /> Mark
                                Received
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => {
                                setEntries((prev) => prev.filter((e) => e.id !== entry.id));
                                toast.success(`GRN ${entry.grnNumber} removed.`);
                              }}
                            >
                              Remove Entry
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------ Record Incoming Modal ----------------------- */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Record Incoming Stock</span>
              <span className="font-mono text-xs text-muted-foreground font-normal">
                {recordHeader.grnNumber}
              </span>
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Record new raw leather, chemical, or accessory deliveries coming into the factory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveIncomingSubmit} className="space-y-4 py-2">
            {/* Header Fields */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Entry / GRN No. *
                </label>
                <input
                  type="text"
                  required
                  value={recordHeader.grnNumber}
                  onChange={(e) => setRecordHeader({ ...recordHeader, grnNumber: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-muted px-2.5 text-[13px] font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Date *
                </label>
                <input
                  type="text"
                  required
                  value={recordHeader.date}
                  onChange={(e) => setRecordHeader({ ...recordHeader, date: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Supplier *
                </label>
                <select
                  value={recordHeader.supplier}
                  onChange={(e) => setRecordHeader({ ...recordHeader, supplier: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {SUPPLIERS.map((sup) => (
                    <option key={sup} value={sup}>
                      {sup}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-984"
                  value={recordHeader.invoiceNumber}
                  onChange={(e) =>
                    setRecordHeader({ ...recordHeader, invoiceNumber: e.target.value })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Warehouse *
                </label>
                <select
                  value={recordHeader.warehouse}
                  onChange={(e) =>
                    setRecordHeader({ ...recordHeader, warehouse: e.target.value as Location })
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
                  Received By *
                </label>
                <input
                  type="text"
                  required
                  value={recordHeader.receivedBy}
                  onChange={(e) => setRecordHeader({ ...recordHeader, receivedBy: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-foreground">
                  Items Received
                </p>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              <div className="rounded-sm border border-border bg-card overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-semibold">Item</th>
                      <th className="px-3 py-2 text-right font-semibold w-24">Qty</th>
                      <th className="px-3 py-2 font-semibold w-20">Unit</th>
                      <th className="px-3 py-2 text-right font-semibold w-24">Rate (₹)</th>
                      <th className="px-3 py-2 text-right font-semibold w-28">Total (₹)</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((line, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="p-2">
                          <select
                            value={line.itemId}
                            onChange={(e) => handleLineItemChange(idx, "itemId", e.target.value)}
                            className="h-8 w-full rounded-sm border border-input bg-background px-2 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                          >
                            {inventory.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.itemCode} — {inv.itemName}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={line.quantity}
                            onChange={(e) =>
                              handleLineItemChange(idx, "quantity", parseFloat(e.target.value) || 0)
                            }
                            className="h-8 w-full text-right rounded-sm border border-input bg-background px-2 text-[12px] tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="text"
                            readOnly
                            value={line.unit}
                            className="h-8 w-full rounded-sm border border-input bg-muted px-2 text-[12px] text-muted-foreground cursor-not-allowed"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={line.rate}
                            onChange={(e) =>
                              handleLineItemChange(idx, "rate", parseFloat(e.target.value) || 0)
                            }
                            className="h-8 w-full text-right rounded-sm border border-input bg-background px-2 text-[12px] tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </td>

                        <td className="p-2 text-right font-semibold tabular-nums text-foreground">
                          ₹{line.total.toLocaleString()}
                        </td>

                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Batch numbers, quality check remarks, vehicle details..."
                  value={recordHeader.notes}
                  onChange={(e) => setRecordHeader({ ...recordHeader, notes: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-input bg-background p-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div className="space-y-2 rounded-sm border border-border bg-muted/20 p-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Other Charges (Freight/Taxes)</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={recordHeader.otherCharges}
                    onChange={(e) =>
                      setRecordHeader({
                        ...recordHeader,
                        otherCharges: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-7 w-24 text-right rounded-sm border border-input bg-background px-2 text-[12px] tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2 text-[13px] font-semibold text-foreground">
                  <span>Grand Total</span>
                  <span className="tabular-nums text-primary">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <button
                type="button"
                onClick={() => setIsRecordOpen(false)}
                className="h-8 rounded-sm border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 rounded-sm bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Incoming
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------- View Incoming Modal ------------------------ */}
      {viewingEntry && (
        <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold font-mono text-foreground">
                  {viewingEntry.grnNumber}
                </DialogTitle>
                <IncomingStatusBadge status={viewingEntry.status} />
              </div>
              <DialogDescription className="text-[13px]">
                Goods Receipt Note — {viewingEntry.supplier}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-[13px]">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 rounded-sm border border-border bg-muted/20 p-3 text-[12px]">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Date Received
                  </p>
                  <p className="font-medium text-foreground">{viewingEntry.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Invoice No.
                  </p>
                  <p className="font-medium text-foreground">{viewingEntry.invoiceNumber || "—"}</p>
                </div>
                <div className="mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Warehouse
                  </p>
                  <p className="font-medium text-foreground">{viewingEntry.warehouse}</p>
                </div>
                <div className="mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Received By
                  </p>
                  <p className="font-medium text-foreground">{viewingEntry.receivedBy}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Line Items ({viewingEntry.items.length})
                </p>
                <div className="rounded-sm border border-border overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-semibold">Item</th>
                        <th className="px-3 py-2 text-right font-semibold">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold">Rate</th>
                        <th className="px-3 py-2 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingEntry.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-medium text-foreground">
                            <span className="font-mono text-[11px] text-muted-foreground mr-1.5">
                              {item.itemCode}
                            </span>
                            {item.itemName}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-foreground">
                            {item.quantity.toLocaleString()} {item.unit}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                            ₹{item.rate.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                            ₹{item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="rounded-sm border border-border bg-card p-3 space-y-1.5 text-[12px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₹{viewingEntry.subtotal.toLocaleString()}</span>
                </div>
                {viewingEntry.otherCharges > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Other Charges</span>
                    <span className="tabular-nums">
                      ₹{viewingEntry.otherCharges.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-1.5 text-[13px] font-semibold text-foreground">
                  <span>Grand Total</span>
                  <span className="tabular-nums text-primary">
                    ₹{viewingEntry.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {viewingEntry.notes && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">Notes</p>
                  <p className="mt-0.5 rounded-sm border border-border bg-background p-2 text-[12px] text-foreground">
                    {viewingEntry.notes}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setViewingEntry(null)}
                className="h-8 rounded-sm border border-input bg-background px-4 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
