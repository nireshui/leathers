import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FileBarChart2,
  Download,
  Calendar,
  ArrowLeft,
  FilterX,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  CATEGORIES,
  INITIAL_INCOMING_ENTRIES,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_OUTGOING_ENTRIES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SUPPLIERS,
  LOCATIONS,
  STATUSES,
  type Category,
  type InventoryItem,
  type Location,
  type StockStatus,
} from "../lib/inventoryData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Leather Factory" },
      {
        name: "description",
        content:
          "Generate and export operational inventory, incoming deliveries, outgoing issues, stock ledger, and low stock reports.",
      },
    ],
  }),
  component: ReportsPage,
});

type DateRangeFilter = "Today" | "This Week" | "This Month" | "Custom Date";
type ReportType =
  | "inventory"
  | "incoming"
  | "outgoing"
  | "movements"
  | "low-stock"
  | null;

const DATE_RANGE_OPTIONS: DateRangeFilter[] = [
  "Today",
  "This Week",
  "This Month",
  "Custom Date",
];

/* -------------------------------- Main Component ------------------------------- */

function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRangeFilter>("This Month");
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  // Filters for individual report views
  const [invCategory, setInvCategory] = useState<string>("all");
  const [invStatus, setInvStatus] = useState<string>("all");
  const [invLocation, setInvLocation] = useState<string>("all");

  const [incSupplier, setIncSupplier] = useState<string>("all");
  const [incItem, setIncItem] = useState<string>("all");

  const [outDestination, setOutDestination] = useState<string>("all");
  const [outPurpose, setOutPurpose] = useState<string>("all");

  const [movItem, setMovItem] = useState<string>("all");
  const [movType, setMovType] = useState<string>("all");

  const handleExport = (reportName: string, format: "Excel" | "CSV" | "PDF") => {
    toast.success(
      `Exporting ${reportName} as ${format} file... Download started.`
    );
  };

  /* ---------------- Low Stock Items Data ---------------- */
  const lowStockItems = useMemo(() => {
    return INITIAL_INVENTORY_ITEMS.filter(
      (item) => item.status === "Low Stock" || item.status === "Out of Stock"
    ).map((item) => ({
      ...item,
      difference: Math.max(0, item.minStock - item.currentStock),
    }));
  }, []);

  return (
    <AppLayout
      headerTitle="Reports"
      headerRightContent={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-sm border border-input bg-card px-2.5 py-1 text-xs text-foreground">
            <Calendar size={13} className="text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="bg-transparent font-medium text-foreground focus:outline-none cursor-pointer"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ------------------ View Mode: Report Catalog Overview ------------------ */}
        {activeReport === null ? (
          <div className="space-y-4">
            <div className="rounded-sm border border-border bg-card p-3 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-foreground">
                  Operational Inventory Reports
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Select a report to inspect detailed ledger data, filter by parameters, or export offline documents.
                </p>
              </div>
              <span className="rounded-sm bg-primary/10 border border-primary/20 px-2 py-1 text-[11px] font-mono text-primary font-medium">
                Active Range: {dateRange}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. Inventory Report */}
              <div className="flex flex-col justify-between rounded-sm border border-border bg-card p-3.5 shadow-xs hover:border-primary/40 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-sm bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Master List
                    </span>
                    <FileBarChart2 size={16} className="text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Inventory Report
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Complete stock snapshot by category, storage location, current vs minimum thresholds, and status.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReport("inventory")}
                    className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View Report
                  </button>
                  <ExportDropdown
                    onExport={(fmt) => handleExport("Inventory Report", fmt)}
                  />
                </div>
              </div>

              {/* 2. Incoming Report */}
              <div className="flex flex-col justify-between rounded-sm border border-border bg-card p-3.5 shadow-xs hover:border-primary/40 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-sm bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Deliveries
                    </span>
                    <FileSpreadsheet size={16} className="text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Incoming Report
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Goods received notes (GRN), vendor delivery quantities, unit rates, and totals.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReport("incoming")}
                    className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View Report
                  </button>
                  <ExportDropdown
                    onExport={(fmt) => handleExport("Incoming Report", fmt)}
                  />
                </div>
              </div>

              {/* 3. Outgoing Report */}
              <div className="flex flex-col justify-between rounded-sm border border-border bg-card p-3.5 shadow-xs hover:border-primary/40 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-sm bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Dispatches
                    </span>
                    <FileText size={16} className="text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Outgoing Report
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Stock issue slips, production floor distributions, customer order dispatches, and issuing officer.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReport("outgoing")}
                    className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View Report
                  </button>
                  <ExportDropdown
                    onExport={(fmt) => handleExport("Outgoing Report", fmt)}
                  />
                </div>
              </div>

              {/* 4. Stock Movement Report */}
              <div className="flex flex-col justify-between rounded-sm border border-border bg-card p-3.5 shadow-xs hover:border-primary/40 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-sm bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Ledger History
                    </span>
                    <FileCode size={16} className="text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Stock Movement Report
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Detailed movement audit trail, quantity changes, previous balance, new balance, and reference codes.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReport("movements")}
                    className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    View Report
                  </button>
                  <ExportDropdown
                    onExport={(fmt) =>
                      handleExport("Stock Movement Report", fmt)
                    }
                  />
                </div>
              </div>

              {/* 5. Low Stock Report */}
              <div className="flex flex-col justify-between rounded-sm border border-border bg-card p-3.5 shadow-xs hover:border-destructive/40 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-sm bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-medium">
                      Critical Alert
                    </span>
                    <AlertTriangle size={16} className="text-destructive" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Low Stock Report
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Filter for items below safety reorder threshold or completely out of stock requiring urgent PO.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReport("low-stock")}
                    className="rounded-sm bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    View Report
                  </button>
                  <ExportDropdown
                    onExport={(fmt) => handleExport("Low Stock Report", fmt)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------ Detailed Report Table View ------------------ */
          <div className="space-y-4 text-xs">
            {/* Top Navigation & Export Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-card p-2.5 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveReport(null)}
                  className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Back to All Reports</span>
                </button>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <h3 className="text-xs font-semibold text-foreground">
                  {activeReport === "inventory" && "Inventory Report"}
                  {activeReport === "incoming" && "Incoming Deliveries Report"}
                  {activeReport === "outgoing" && "Outgoing Stock Issues Report"}
                  {activeReport === "movements" && "Stock Movements Ledger Report"}
                  {activeReport === "low-stock" && "Low Stock & Out of Stock Exception Report"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <ExportDropdown
                  onExport={(fmt) =>
                    handleExport(
                      activeReport === "inventory"
                        ? "Inventory Report"
                        : activeReport === "incoming"
                        ? "Incoming Report"
                        : activeReport === "outgoing"
                        ? "Outgoing Report"
                        : activeReport === "movements"
                        ? "Stock Movements Report"
                        : "Low Stock Report",
                      fmt
                    )
                  }
                />
              </div>
            </div>

            {/* ---------------- 1. INVENTORY REPORT ---------------- */}
            {activeReport === "inventory" && (
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Category:
                    </span>
                    <select
                      value={invCategory}
                      onChange={(e) => setInvCategory(e.target.value)}
                      className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Status:
                    </span>
                    <select
                      value={invStatus}
                      onChange={(e) => setInvStatus(e.target.value)}
                      className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Location:
                    </span>
                    <select
                      value={invLocation}
                      onChange={(e) => setInvLocation(e.target.value)}
                      className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Locations</option>
                      {LOCATIONS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-sm border border-border bg-card shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Item Code</th>
                          <th className="px-3 py-2.5">Item Name</th>
                          <th className="px-3 py-2.5">Category</th>
                          <th className="px-3 py-2.5 text-right">Current Stock</th>
                          <th className="px-3 py-2.5">Unit</th>
                          <th className="px-3 py-2.5 text-right">Min Stock</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {INITIAL_INVENTORY_ITEMS.filter((item) => {
                          const mCat =
                            invCategory === "all" || item.category === invCategory;
                          const mSt =
                            invStatus === "all" || item.status === invStatus;
                          const mLoc =
                            invLocation === "all" || item.location === invLocation;
                          return mCat && mSt && mLoc;
                        }).map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-accent/40 transition-colors"
                          >
                            <td className="px-3 py-2 font-mono text-[11px] font-medium text-foreground">
                              {item.itemCode}
                            </td>
                            <td className="px-3 py-2 font-medium text-foreground">
                              {item.itemName}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.category}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                              {item.currentStock.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.unit}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                              {item.minStock.toLocaleString()}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-medium ${
                                  item.status === "In Stock"
                                    ? "bg-success/10 text-success border-success/20"
                                    : item.status === "Low Stock"
                                    ? "bg-warning/10 text-warning border-warning/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.location}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 2. INCOMING REPORT ---------------- */}
            {activeReport === "incoming" && (
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Supplier:
                    </span>
                    <select
                      value={incSupplier}
                      onChange={(e) => setIncSupplier(e.target.value)}
                      className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Suppliers</option>
                      {INITIAL_SUPPLIERS.map((s) => (
                        <option key={s.id} value={s.supplierName}>
                          {s.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-sm border border-border bg-card shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5">GRN No.</th>
                          <th className="px-3 py-2.5">Supplier</th>
                          <th className="px-3 py-2.5">Item</th>
                          <th className="px-3 py-2.5 text-right">Quantity</th>
                          <th className="px-3 py-2.5">Unit</th>
                          <th className="px-3 py-2.5 text-right">Rate</th>
                          <th className="px-3 py-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {INITIAL_INCOMING_ENTRIES.filter((entry) => {
                          return (
                            incSupplier === "all" ||
                            entry.supplier === incSupplier
                          );
                        }).flatMap((entry) =>
                          entry.items.map((line, idx) => (
                            <tr
                              key={`${entry.id}-${idx}`}
                              className="hover:bg-accent/40 transition-colors"
                            >
                              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                                {entry.date}
                              </td>
                              <td className="px-3 py-2 font-mono font-medium text-foreground">
                                {entry.grnNumber}
                              </td>
                              <td className="px-3 py-2 text-foreground font-medium">
                                {entry.supplier}
                              </td>
                              <td className="px-3 py-2 text-foreground">
                                {line.itemName}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                {line.quantity.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {line.unit}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                ₹{line.rate.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                ₹{line.total.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 3. OUTGOING REPORT ---------------- */}
            {activeReport === "outgoing" && (
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Destination:
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Production or Client"
                      value={outDestination}
                      onChange={(e) => setOutDestination(e.target.value)}
                      className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Purpose:
                    </span>
                    <select
                      value={outPurpose}
                      onChange={(e) => setOutPurpose(e.target.value)}
                      className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Purposes</option>
                      <option value="Production">Production</option>
                      <option value="Customer Order">Customer Order</option>
                      <option value="Internal Transfer">Internal Transfer</option>
                      <option value="Sample">Sample</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-sm border border-border bg-card shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5">Issue No.</th>
                          <th className="px-3 py-2.5">Destination</th>
                          <th className="px-3 py-2.5">Item</th>
                          <th className="px-3 py-2.5 text-right">Quantity</th>
                          <th className="px-3 py-2.5">Unit</th>
                          <th className="px-3 py-2.5">Purpose</th>
                          <th className="px-3 py-2.5">Issued By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {INITIAL_OUTGOING_ENTRIES.filter((entry) => {
                          const mDest =
                            outDestination === "all" ||
                            outDestination === "" ||
                            entry.destination
                              .toLowerCase()
                              .includes(outDestination.toLowerCase());
                          const mPurp =
                            outPurpose === "all" || entry.purpose === outPurpose;
                          return mDest && mPurp;
                        }).flatMap((entry) =>
                          entry.items.map((line, idx) => (
                            <tr
                              key={`${entry.id}-${idx}`}
                              className="hover:bg-accent/40 transition-colors"
                            >
                              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                                {entry.date}
                              </td>
                              <td className="px-3 py-2 font-mono font-medium text-foreground">
                                {entry.issueNumber}
                              </td>
                              <td className="px-3 py-2 text-foreground font-medium">
                                {entry.destination}
                              </td>
                              <td className="px-3 py-2 text-foreground">
                                {line.itemName}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                {line.quantity.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {line.unit}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {entry.purpose}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {entry.issuedBy}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 4. STOCK MOVEMENT REPORT ---------------- */}
            {activeReport === "movements" && (
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-card p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Movement Type:
                    </span>
                    <select
                      value={movType}
                      onChange={(e) => setMovType(e.target.value)}
                      className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Movement Types</option>
                      <option value="Incoming">Incoming</option>
                      <option value="Outgoing">Outgoing</option>
                      <option value="Adjustment">Adjustment</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-sm border border-border bg-card shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5">Movement ID</th>
                          <th className="px-3 py-2.5">Item</th>
                          <th className="px-3 py-2.5">Type</th>
                          <th className="px-3 py-2.5 text-right">Quantity</th>
                          <th className="px-3 py-2.5 text-right">Previous Balance</th>
                          <th className="px-3 py-2.5 text-right">New Balance</th>
                          <th className="px-3 py-2.5">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {INITIAL_STOCK_MOVEMENTS.filter((m) => {
                          return movType === "all" || m.movementType === movType;
                        }).map((mov) => {
                          const prev =
                            mov.movementType === "Incoming"
                              ? mov.newBalance - mov.quantity
                              : mov.newBalance + mov.quantity;
                          return (
                            <tr
                              key={mov.id}
                              className="hover:bg-accent/40 transition-colors"
                            >
                              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                                {mov.date}
                              </td>
                              <td className="px-3 py-2 font-mono font-medium text-foreground">
                                {mov.movementId}
                              </td>
                              <td className="px-3 py-2 font-medium text-foreground">
                                {mov.itemName}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium ${
                                    mov.movementType === "Incoming"
                                      ? "bg-success/10 text-success border-success/20"
                                      : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                  }`}
                                >
                                  {mov.movementType}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                {mov.quantityDisplay}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                                {prev.toLocaleString()} {mov.unit}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                {mov.newBalanceDisplay}
                              </td>
                              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                                {mov.referenceNumber}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 5. LOW STOCK REPORT ---------------- */}
            {activeReport === "low-stock" && (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-sm border border-border bg-card shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Item</th>
                          <th className="px-3 py-2.5">Category</th>
                          <th className="px-3 py-2.5 text-right">Current Stock</th>
                          <th className="px-3 py-2.5 text-right">Minimum Stock</th>
                          <th className="px-3 py-2.5 text-right">Difference</th>
                          <th className="px-3 py-2.5">Location</th>
                          <th className="px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {lowStockItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-accent/40 transition-colors"
                          >
                            <td className="px-3 py-2 font-medium text-foreground">
                              {item.itemName}{" "}
                              <span className="font-mono text-[11px] text-muted-foreground">
                                ({item.itemCode})
                              </span>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.category}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-semibold text-foreground">
                              {item.currentStock.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                              {item.minStock.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-semibold text-destructive">
                              -{item.difference.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.location}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-medium ${
                                  item.status === "Low Stock"
                                    ? "bg-warning/10 text-warning border-warning/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/* -------------------------------- Helper Dropdown ------------------------------- */

function ExportDropdown({
  onExport,
}: {
  onExport: (format: "Excel" | "CSV" | "PDF") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
        <Download size={13} />
        <span>Export</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 text-xs">
        <DropdownMenuItem
          onClick={() => onExport("Excel")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileSpreadsheet size={13} className="text-emerald-600" />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onExport("CSV")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileText size={13} className="text-blue-600" />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onExport("PDF")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FileCode size={13} className="text-rose-600" />
          <span>PDF Document</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
