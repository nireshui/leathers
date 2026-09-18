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
  AlertCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  INITIAL_INVENTORY_ITEMS,
  INITIAL_OUTGOING_ENTRIES,
  LOCATIONS,
  OUTGOING_STATUSES,
  PURPOSES,
  type InventoryItem,
  type Location,
  type OutgoingEntry,
  type OutgoingLineItem,
  type OutgoingPurpose,
  type OutgoingStatus,
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

export const Route = createFileRoute("/outgoing")({
  head: () => ({
    meta: [
      { title: "Outgoing Stock — Leather Factory" },
      {
        name: "description",
        content:
          "Record and track materials, hides, chemicals, and supplies leaving factory inventory for production or dispatch.",
      },
    ],
  }),
  component: OutgoingPage,
});

/* -------------------------------- Badges -------------------------------- */

function OutgoingStatusBadge({ status }: { status: OutgoingStatus }) {
  const styles = {
    Issued: "bg-success/10 text-success border-success/20",
    Pending: "bg-warning/10 text-warning border-warning/20",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  }[status];

  const Icon = {
    Issued: CheckCircle2,
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

function OutgoingPage() {
  const [entries, setEntries] = useState<OutgoingEntry[]>(INITIAL_OUTGOING_ENTRIES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  // Modal States
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<OutgoingEntry | null>(null);

  // Record Form Header State
  const [recordHeader, setRecordHeader] = useState({
    issueNumber: `OUT-00${90 + entries.length - INITIAL_OUTGOING_ENTRIES.length}`,
    date: "17 Sep 2026",
    destination: "Production",
    purpose: "Production" as OutgoingPurpose,
    warehouse: LOCATIONS[0] as Location,
    issuedBy: "R. Geetha",
    referenceNumber: "WO-2026-445",
    notes: "",
  });

  // Record Form Items State
  const [lineItems, setLineItems] = useState<OutgoingLineItem[]>([
    {
      itemId: INITIAL_INVENTORY_ITEMS[0].id,
      itemCode: INITIAL_INVENTORY_ITEMS[0].itemCode,
      itemName: INITIAL_INVENTORY_ITEMS[0].itemName,
      availableStock: INITIAL_INVENTORY_ITEMS[0].currentStock,
      quantity: 100,
      unit: INITIAL_INVENTORY_ITEMS[0].unit,
      rate: 110,
      total: 11000,
    },
  ]);

  // Dynamic calculation for record totals
  const totalQuantity = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [lineItems]);

  const totalValue = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.total || 0), 0);
  }, [lineItems]);

  // Validation: Check if any item quantity exceeds available stock
  const hasInsufficientStock = useMemo(() => {
    return lineItems.some(
      (item) =>
        (Number(item.quantity) || 0) > item.availableStock || (Number(item.quantity) || 0) <= 0,
    );
  }, [lineItems]);

  // Dynamic Summary Cards Metrics
  const summary = useMemo(() => {
    // Exact requested base numbers: Today 420 units, Month 8,250 units, Pending 2
    let todayQty = 420;
    let monthQty = 8250;
    let pendingCount = 2;

    entries.forEach((e, idx) => {
      if (idx >= INITIAL_OUTGOING_ENTRIES.length) {
        if (e.status === "Pending") pendingCount++;
        if (e.status === "Issued") {
          monthQty += e.totalQuantity;
          if (e.date.includes("17 Sep")) todayQty += e.totalQuantity;
        }
      }
    });

    return {
      todayOutgoing: todayQty,
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
        e.issueNumber.toLowerCase().includes(q) ||
        e.destination.toLowerCase().includes(q) ||
        e.issuedBy.toLowerCase().includes(q) ||
        (e.referenceNumber && e.referenceNumber.toLowerCase().includes(q)) ||
        e.items.some(
          (item) =>
            item.itemName.toLowerCase().includes(q) || item.itemCode.toLowerCase().includes(q),
        );

      const matchesPurpose = selectedPurpose === "all" || e.purpose === selectedPurpose;
      const matchesStatus = selectedStatus === "all" || e.status === selectedStatus;
      const matchesDate =
        selectedDate === "all" ||
        (selectedDate === "today" && e.date.includes("17 Sep")) ||
        (selectedDate === "yesterday" && e.date.includes("16 Sep"));

      return matchesSearch && matchesPurpose && matchesStatus && matchesDate;
    });
  }, [entries, searchQuery, selectedPurpose, selectedStatus, selectedDate]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedPurpose !== "all" ||
    selectedStatus !== "all" ||
    selectedDate !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPurpose("all");
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
        availableStock: defaultItem.currentStock,
        quantity: Math.min(50, defaultItem.currentStock),
        unit: defaultItem.unit,
        rate: 100,
        total: Math.min(50, defaultItem.currentStock) * 100,
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
    field: keyof OutgoingLineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "itemId") {
          const selectedInv = inventory.find((inv) => inv.id === value) || inventory[0];
          const newQty = Math.min(item.quantity || 1, selectedInv.currentStock);
          const newRate = item.rate || 100;
          return {
            ...item,
            itemId: selectedInv.id,
            itemCode: selectedInv.itemCode,
            itemName: selectedInv.itemName,
            availableStock: selectedInv.currentStock,
            unit: selectedInv.unit,
            quantity: newQty,
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
  const handleSaveOutgoingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasInsufficientStock) {
      toast.error("Insufficient stock available for one or more items.");
      return;
    }

    if (!recordHeader.issueNumber || !recordHeader.destination) {
      toast.error("Please fill in Issue Number and Destination.");
      return;
    }

    const mainUnit = lineItems[0]?.unit || "Units";

    const newEntry: OutgoingEntry = {
      id: `out-${Date.now()}`,
      issueNumber: recordHeader.issueNumber,
      date: recordHeader.date || "17 Sep 2026",
      destination: recordHeader.destination.trim(),
      purpose: recordHeader.purpose,
      referenceNumber: recordHeader.referenceNumber.trim() || undefined,
      warehouse: recordHeader.warehouse,
      issuedBy: recordHeader.issuedBy.trim() || "R. Geetha",
      itemCount: lineItems.length,
      totalQuantity,
      quantityDisplay: `${totalQuantity.toLocaleString()} ${mainUnit}`,
      totalValue,
      status: "Issued",
      notes: recordHeader.notes.trim() || undefined,
      items: lineItems,
    };

    // 1. Add new outgoing entry
    setEntries((prev) => [newEntry, ...prev]);

    // 2. Decrease corresponding inventory stock quantities
    setInventory((prev) =>
      prev.map((invItem) => {
        const matchingLines = lineItems.filter((l) => l.itemId === invItem.id);
        if (matchingLines.length > 0) {
          const issuedQty = matchingLines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
          const updatedStock = Math.max(0, invItem.currentStock - issuedQty);
          return {
            ...invItem,
            currentStock: updatedStock,
            lastUpdated: "Just now (Outgoing Issue)",
          };
        }
        return invItem;
      }),
    );

    setIsRecordOpen(false);
    toast.success(`Outgoing entry ${newEntry.issueNumber} saved. Stock updated successfully.`);

    // Reset Form
    const nextIssueNum = `OUT-00${91 + entries.length - INITIAL_OUTGOING_ENTRIES.length}`;
    setRecordHeader({
      issueNumber: nextIssueNum,
      date: "17 Sep 2026",
      destination: "Production",
      purpose: "Production",
      warehouse: LOCATIONS[0] as Location,
      issuedBy: "R. Geetha",
      referenceNumber: "",
      notes: "",
    });
    setLineItems([
      {
        itemId: inventory[0]?.id || "lf-001",
        itemCode: inventory[0]?.itemCode || "LF-001",
        itemName: inventory[0]?.itemName || "Full Grain Cow Leather",
        availableStock: inventory[0]?.currentStock || 2450,
        quantity: 100,
        unit: inventory[0]?.unit || "Sq.ft",
        rate: 110,
        total: 11000,
      },
    ]);
  };

  return (
    <AppLayout
      headerTitle="Outgoing Stock"
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
              placeholder="Search outgoing issue, destination…"
              className="h-8 w-60 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            />
          </label>
          <button
            type="button"
            onClick={() => setIsRecordOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} strokeWidth={2} />
            Record Outgoing
          </button>
        </div>
      }
    >
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Today's Outgoing
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.todayOutgoing.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">units</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Issued to production & orders</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            This Month
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.thisMonth.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">units</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Total stock dispatches</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Pending Entries
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-warning">
            {summary.pendingEntries}
          </p>
          <p className="mt-0.5 text-[11px] text-warning">Awaiting dispatch release</p>
        </div>
      </div>

      {/* Filter Row & Outgoing Table */}
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

            {/* Purpose Filter */}
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Purposes</option>
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
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
              {OUTGOING_STATUSES.map((st) => (
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

        {/* Outgoing Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">Issue No.</th>
                <th className="px-4 py-2.5 font-semibold">Date</th>
                <th className="px-4 py-2.5 font-semibold">Destination</th>
                <th className="px-4 py-2.5 font-semibold">Purpose</th>
                <th className="px-4 py-2.5 text-right font-semibold">Items</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total Qty</th>
                <th className="px-4 py-2.5 font-semibold">Issued By</th>
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
                      <p className="text-[13px] font-medium">No outgoing entries found.</p>
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
                      {entry.issueNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {entry.date}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{entry.destination}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {entry.purpose}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {entry.itemCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {entry.quantityDisplay}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {entry.issuedBy}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <OutgoingStatusBadge status={entry.status} />
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
                              <Eye className="mr-2 size-3.5" /> View Voucher
                            </DropdownMenuItem>

                            {entry.status === "Pending" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEntries((prev) =>
                                    prev.map((e) =>
                                      e.id === entry.id ? { ...e, status: "Issued" } : e,
                                    ),
                                  );
                                  toast.success(`Issue ${entry.issueNumber} marked as Issued.`);
                                }}
                              >
                                <CheckCircle2 className="mr-2 size-3.5 text-success" /> Mark Issued
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => {
                                setEntries((prev) => prev.filter((e) => e.id !== entry.id));
                                toast.success(`Issue ${entry.issueNumber} removed.`);
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

      {/* ------------------------ Record Outgoing Modal ----------------------- */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              <span>Record Outgoing Stock</span>
              <span className="font-mono text-xs text-muted-foreground font-normal">
                {recordHeader.issueNumber}
              </span>
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Record materials leaving inventory for production, orders, or internal transfer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveOutgoingSubmit} className="space-y-4 py-2">
            {/* Header Fields */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Issue Number *
                </label>
                <input
                  type="text"
                  required
                  value={recordHeader.issueNumber}
                  onChange={(e) =>
                    setRecordHeader({ ...recordHeader, issueNumber: e.target.value })
                  }
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
                  Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Floor / Client"
                  value={recordHeader.destination}
                  onChange={(e) =>
                    setRecordHeader({ ...recordHeader, destination: e.target.value })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Purpose *
                </label>
                <select
                  value={recordHeader.purpose}
                  onChange={(e) =>
                    setRecordHeader({ ...recordHeader, purpose: e.target.value as OutgoingPurpose })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {PURPOSES.map((pur) => (
                    <option key={pur} value={pur}>
                      {pur}
                    </option>
                  ))}
                </select>
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
                  Issued By *
                </label>
                <input
                  type="text"
                  required
                  value={recordHeader.issuedBy}
                  onChange={(e) => setRecordHeader({ ...recordHeader, issuedBy: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Reference Number (WO / Order No)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WO-2026-441"
                  value={recordHeader.referenceNumber}
                  onChange={(e) =>
                    setRecordHeader({ ...recordHeader, referenceNumber: e.target.value })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="Dispatch vehicle, batch target..."
                  value={recordHeader.notes}
                  onChange={(e) => setRecordHeader({ ...recordHeader, notes: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-foreground">
                  Items to Issue
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
                      <th className="px-3 py-2 text-right font-semibold w-28">Available Stock</th>
                      <th className="px-3 py-2 text-right font-semibold w-28">Issue Qty</th>
                      <th className="px-3 py-2 font-semibold w-16">Unit</th>
                      <th className="px-3 py-2 text-right font-semibold w-24">Rate (₹)</th>
                      <th className="px-3 py-2 text-right font-semibold w-28">Total (₹)</th>
                      <th className="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((line, idx) => {
                      const isOverStock = (Number(line.quantity) || 0) > line.availableStock;
                      const isInvalidQty = (Number(line.quantity) || 0) <= 0;

                      return (
                        <tr
                          key={idx}
                          className={`border-b border-border last:border-0 ${
                            isOverStock ? "bg-destructive/5" : ""
                          }`}
                        >
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

                          <td className="p-2 text-right">
                            <span className="inline-flex items-center justify-end font-semibold tabular-nums text-foreground px-2 py-1 bg-muted/50 rounded-xs text-[11px]">
                              {line.availableStock.toLocaleString()} {line.unit}
                            </span>
                          </td>

                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              max={line.availableStock}
                              step="any"
                              value={line.quantity}
                              onChange={(e) =>
                                handleLineItemChange(
                                  idx,
                                  "quantity",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className={`h-8 w-full text-right rounded-sm border px-2 text-[12px] tabular-nums focus:outline-none ${
                                isOverStock
                                  ? "border-destructive text-destructive font-semibold focus:ring-destructive/30"
                                  : "border-input bg-background text-foreground focus:ring-ring/30"
                              }`}
                            />
                            {isOverStock && (
                              <p className="mt-0.5 text-[10px] text-destructive font-medium flex items-center justify-end gap-1">
                                <AlertCircle size={10} /> Insufficient stock available.
                              </p>
                            )}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="rounded-sm border border-border bg-muted/20 p-3 text-[12px] flex items-center justify-between">
              <div>
                <span className="text-muted-foreground">Total Items: </span>
                <span className="font-semibold text-foreground">{lineItems.length}</span>
                <span className="text-muted-foreground ml-4">Total Issue Quantity: </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {totalQuantity.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">Total Value: </span>
                <span className="text-base font-semibold tabular-nums text-primary ml-1">
                  ₹{totalValue.toLocaleString()}
                </span>
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
                disabled={hasInsufficientStock}
                className="h-8 rounded-sm bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Outgoing
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------- View Outgoing Modal ------------------------ */}
      {viewingEntry && (
        <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold font-mono text-foreground">
                  {viewingEntry.issueNumber}
                </DialogTitle>
                <OutgoingStatusBadge status={viewingEntry.status} />
              </div>
              <DialogDescription className="text-[13px]">
                Stock Dispatch Voucher — {viewingEntry.destination} ({viewingEntry.purpose})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-[13px]">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 rounded-sm border border-border bg-muted/20 p-3 text-[12px]">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Issue Date
                  </p>
                  <p className="font-medium text-foreground">{viewingEntry.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Reference No.
                  </p>
                  <p className="font-medium text-foreground">
                    {viewingEntry.referenceNumber || "—"}
                  </p>
                </div>
                <div className="mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Warehouse
                  </p>
                  <p className="font-medium text-foreground">{viewingEntry.warehouse}</p>
                </div>
                <div className="mt-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Issued By
                  </p>
                  <p className="font-medium text-foreground">{viewingEntry.issuedBy}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  Items Issued ({viewingEntry.items.length})
                </p>
                <div className="rounded-sm border border-border overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-semibold">Item</th>
                        <th className="px-3 py-2 text-right font-semibold">Issued Qty</th>
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
              <div className="rounded-sm border border-border bg-card p-3 space-y-1 text-[12px]">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Total Quantity Issued</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {viewingEntry.quantityDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-1.5 text-[13px] font-semibold text-foreground">
                  <span>Total Dispatch Value</span>
                  <span className="tabular-nums text-primary">
                    ₹{viewingEntry.totalValue.toLocaleString()}
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
