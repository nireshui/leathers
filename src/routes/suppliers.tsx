import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  FilterX,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  Mail,
  MapPin,
  Building2,
  Receipt,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  CATEGORIES,
  INITIAL_INCOMING_ENTRIES,
  INITIAL_SUPPLIERS,
  SUPPLIER_STATUSES,
  type Category,
  type SupplierRecord,
  type SupplierStatus,
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

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers — Leather Factory" },
      {
        name: "description",
        content:
          "Manage leather, chemical, hardware, and accessory vendors, supplied materials, and incoming delivery history.",
      },
    ],
  }),
  component: SuppliersPage,
});

/* -------------------------------- Badges -------------------------------- */

function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  const styles =
    status === "Active"
      ? "bg-success/10 text-success border-success/20"
      : "bg-muted text-muted-foreground border-border";

  const Icon = status === "Active" ? CheckCircle2 : XCircle;

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

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(INITIAL_SUPPLIERS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<SupplierRecord | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRecord | null>(null);

  // New Supplier Form State
  const [newSupplier, setNewSupplier] = useState({
    supplierCode: `SUP-00${suppliers.length + 1}`,
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "Chennai",
    state: "Tamil Nadu",
    gstNumber: "",
    mainCategory: "Raw Leather" as Category,
    itemsSuppliedList: "",
    status: "Active" as SupplierStatus,
    notes: "",
  });

  // Extract unique locations
  const locations = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((s) => set.add(s.location || s.city));
    return Array.from(set);
  }, [suppliers]);

  // Dynamic Summary Cards Metrics
  const summary = useMemo(() => {
    // Requested exact base numbers: Total 48, Active 42, Inactive 6
    const addedCount = suppliers.length - INITIAL_SUPPLIERS.length;
    let activeCount = 42;
    let inactiveCount = 6;

    suppliers.forEach((s, idx) => {
      if (idx >= INITIAL_SUPPLIERS.length) {
        if (s.status === "Active") activeCount++;
        else inactiveCount++;
      }
    });

    return {
      totalSuppliers: 48 + addedCount,
      activeSuppliers: activeCount,
      inactiveSuppliers: inactiveCount,
    };
  }, [suppliers]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.supplierCode.toLowerCase().includes(q) ||
        s.supplierName.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q);

      const matchesStatus = selectedStatus === "all" || s.status === selectedStatus;
      const matchesLocation =
        selectedLocation === "all" || s.location === selectedLocation || s.city === selectedLocation;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [suppliers, searchQuery, selectedStatus, selectedLocation]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedStatus !== "all" || selectedLocation !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedLocation("all");
  };

  // Toggle Supplier Status (Activate / Deactivate)
  const handleToggleStatus = (supplier: SupplierRecord) => {
    const nextStatus: SupplierStatus = supplier.status === "Active" ? "Inactive" : "Active";
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplier.id ? { ...s, status: nextStatus } : s))
    );
    toast.success(`${supplier.supplierName} marked as ${nextStatus}.`);
  };

  // Add Supplier Submit Handler
  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSupplier.supplierName.trim() || !newSupplier.contactPerson.trim() || !newSupplier.phone.trim()) {
      toast.error("Please fill in Supplier Name, Contact Person, and Phone.");
      return;
    }

    const created: SupplierRecord = {
      id: `sup-${Date.now()}`,
      supplierCode: newSupplier.supplierCode || `SUP-00${suppliers.length + 1}`,
      supplierName: newSupplier.supplierName.trim(),
      contactPerson: newSupplier.contactPerson.trim(),
      phone: newSupplier.phone.trim(),
      email: newSupplier.email.trim() || "N/A",
      address: newSupplier.address.trim() || undefined,
      city: newSupplier.city.trim() || "Chennai",
      state: newSupplier.state.trim() || "Tamil Nadu",
      gstNumber: newSupplier.gstNumber.trim().toUpperCase() || undefined,
      location: newSupplier.city.trim() || "Chennai",
      itemsSuppliedCount: newSupplier.itemsSuppliedList ? newSupplier.itemsSuppliedList.split(",").length : 3,
      mainCategory: newSupplier.mainCategory,
      itemsSuppliedList: newSupplier.itemsSuppliedList.trim() || "Raw materials",
      status: newSupplier.status,
      notes: newSupplier.notes.trim() || undefined,
      materials: [
        {
          itemCode: "LF-001",
          itemName: "Full Grain Cow Leather",
          category: newSupplier.mainCategory,
          lastReceived: "Recent",
          totalQuantity: "Initial Batch",
        },
      ],
    };

    setSuppliers((prev) => [created, ...prev]);
    setIsAddOpen(false);
    toast.success(`Supplier ${created.supplierName} added successfully.`);

    // Reset Form
    setNewSupplier({
      supplierCode: `SUP-00${suppliers.length + 2}`,
      supplierName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "Chennai",
      state: "Tamil Nadu",
      gstNumber: "",
      mainCategory: "Raw Leather",
      itemsSuppliedList: "",
      status: "Active",
      notes: "",
    });
  };

  // Edit Supplier Submit Handler
  const handleEditSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    setSuppliers((prev) =>
      prev.map((s) => (s.id === editingSupplier.id ? editingSupplier : s))
    );
    setEditingSupplier(null);
    toast.success(`Supplier ${editingSupplier.supplierName} updated successfully.`);
  };

  return (
    <AppLayout
      headerTitle="Suppliers"
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
              placeholder="Search suppliers, contact, location…"
              className="h-8 w-60 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} strokeWidth={2} />
            Add Supplier
          </button>
        </div>
      }
    >
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total Suppliers
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.totalSuppliers}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Registered material vendors</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Active Suppliers
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.activeSuppliers}
          </p>
          <p className="mt-0.5 text-[11px] text-success">Regular active procurement</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Inactive Suppliers
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-muted-foreground">
            {summary.inactiveSuppliers}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Paused or non-active accounts</p>
        </div>
      </div>

      {/* Filter Row & Supplier Table */}
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Statuses</option>
              {SUPPLIER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
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
            Showing <span className="font-semibold text-foreground">{filteredSuppliers.length}</span>{" "}
            suppliers
          </div>
        </div>

        {/* Main Supplier Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">Supplier Code</th>
                <th className="px-4 py-2.5 font-semibold">Supplier Name</th>
                <th className="px-4 py-2.5 font-semibold">Contact Person</th>
                <th className="px-4 py-2.5 font-semibold">Phone</th>
                <th className="px-4 py-2.5 font-semibold">Email</th>
                <th className="px-4 py-2.5 font-semibold">Location</th>
                <th className="px-4 py-2.5 text-right font-semibold">Items Supplied</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Truck size={24} className="text-muted-foreground/50" />
                      <p className="text-[13px] font-medium">No suppliers found matching your filters.</p>
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
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-foreground">
                      {supplier.supplierCode}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {supplier.supplierName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {supplier.contactPerson}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-muted-foreground">
                      {supplier.phone}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      <a
                        href={`mailto:${supplier.email}`}
                        className="text-primary hover:underline text-[12px]"
                      >
                        {supplier.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {supplier.location || supplier.city}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                      {supplier.itemsSuppliedCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <SupplierStatusBadge status={supplier.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingSupplier(supplier)}
                          title="View Details"
                          className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSupplier(supplier)}
                          title="Edit Supplier"
                          className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <Pencil size={14} />
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
                            <DropdownMenuItem onClick={() => setViewingSupplier(supplier)}>
                              <Eye className="mr-2 size-3.5" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                              <Pencil className="mr-2 size-3.5" /> Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(supplier)}>
                              {supplier.status === "Active" ? (
                                <>
                                  <ToggleLeft className="mr-2 size-3.5 text-muted-foreground" />{" "}
                                  Set Inactive
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 size-3.5 text-success" /> Set Active
                                </>
                              )}
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

      {/* ------------------------- Add Supplier Modal ------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Add New Supplier
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Add a new material vendor or chemical supplier to your ERP ledger.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSupplierSubmit} className="space-y-4 py-2">
            {/* Basic Information */}
            <div className="space-y-3">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-foreground">
                Basic Information
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Supplier Code
                  </label>
                  <input
                    type="text"
                    value={newSupplier.supplierCode}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, supplierCode: e.target.value })
                    }
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-muted px-2.5 font-mono text-[13px] text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={newSupplier.status}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, status: e.target.value as SupplierStatus })
                    }
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Leather Suppliers"
                  value={newSupplier.supplierName}
                  onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raj Kumar"
                    value={newSupplier.contactPerson}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
                    }
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 98765 43210"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 font-mono text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. abc@example.com"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    GST Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 33ABCDE1234F1Z5"
                    value={newSupplier.gstNumber}
                    onChange={(e) => setNewSupplier({ ...newSupplier, gstNumber: e.target.value })}
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 font-mono text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street, Industrial Area"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="Chennai / Ambur"
                    value={newSupplier.city}
                    onChange={(e) => setNewSupplier({ ...newSupplier, city: e.target.value })}
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>
            </div>

            {/* Supply Information */}
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-foreground">
                Supply Information
              </p>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Main Category
                </label>
                <select
                  value={newSupplier.mainCategory}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, mainCategory: e.target.value as Category })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Items / Materials Supplied
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full Grain Cow Hides, Goat Linings"
                  value={newSupplier.itemsSuppliedList}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, itemsSuppliedList: e.target.value })
                  }
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Payment terms, delivery lead times..."
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-input bg-background p-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="h-8 rounded-sm border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 rounded-sm bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Supplier
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------- View Supplier Modal ------------------------ */}
      {viewingSupplier && (
        <Dialog open={!!viewingSupplier} onOpenChange={(open) => !open && setViewingSupplier(null)}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <span>{viewingSupplier.supplierName}</span>
                  <span className="font-mono text-xs text-muted-foreground font-normal">
                    ({viewingSupplier.supplierCode})
                  </span>
                </DialogTitle>
                <SupplierStatusBadge status={viewingSupplier.status} />
              </div>
              <DialogDescription className="text-[13px]">
                Vendor Details, Materials Supplied, and Delivery History
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-[13px]">
              {/* Supplier Info Box */}
              <div className="grid grid-cols-2 gap-3 rounded-sm border border-border bg-muted/20 p-3 text-[12px]">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Contact Person</p>
                    <p className="font-medium text-foreground">{viewingSupplier.contactPerson}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Phone</p>
                    <p className="font-mono font-medium text-foreground">{viewingSupplier.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Email</p>
                    <p className="font-medium text-primary">{viewingSupplier.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Location</p>
                    <p className="font-medium text-foreground">{viewingSupplier.city}</p>
                  </div>
                </div>

                {viewingSupplier.address && (
                  <div className="col-span-2 border-t border-border pt-2 mt-1">
                    <p className="text-[10px] text-muted-foreground uppercase">Address</p>
                    <p className="text-foreground">{viewingSupplier.address}</p>
                  </div>
                )}

                {viewingSupplier.gstNumber && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase">GST Number</p>
                    <p className="font-mono font-semibold text-foreground">
                      {viewingSupplier.gstNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Materials Supplied Table */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Package size={13} /> Materials Supplied ({viewingSupplier.materials.length})
                </p>
                <div className="rounded-sm border border-border overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-semibold">Item</th>
                        <th className="px-3 py-2 font-semibold">Category</th>
                        <th className="px-3 py-2 font-semibold">Last Received</th>
                        <th className="px-3 py-2 text-right font-semibold">Total Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingSupplier.materials.map((mat, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-medium text-foreground">
                            <span className="font-mono text-[11px] text-muted-foreground mr-1.5">
                              {mat.itemCode}
                            </span>
                            {mat.itemName}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{mat.category}</td>
                          <td className="px-3 py-2 text-muted-foreground">{mat.lastReceived}</td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                            {mat.totalQuantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Incoming Deliveries */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Receipt size={13} /> Recent Incoming Deliveries
                </p>
                <div className="rounded-sm border border-border overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 py-2 font-semibold">Date</th>
                        <th className="px-3 py-2 font-semibold">GRN No.</th>
                        <th className="px-3 py-2 text-right font-semibold">Items</th>
                        <th className="px-3 py-2 text-right font-semibold">Quantity</th>
                        <th className="px-3 py-2 text-right font-semibold">Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {INITIAL_INCOMING_ENTRIES.filter(
                        (e) => e.supplier === viewingSupplier.supplierName
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                            No recent incoming deliveries recorded for this supplier.
                          </td>
                        </tr>
                      ) : (
                        INITIAL_INCOMING_ENTRIES.filter(
                          (e) => e.supplier === viewingSupplier.supplierName
                        ).map((grn) => (
                          <tr key={grn.id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 text-muted-foreground">{grn.date}</td>
                            <td className="px-3 py-2 font-mono font-medium text-foreground">
                              {grn.grnNumber}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                              {grn.itemCount}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-foreground font-medium">
                              {grn.quantityDisplay}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                              ₹{grn.grandTotal.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewingSupplier.notes && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">Vendor Notes</p>
                  <p className="mt-0.5 rounded-sm border border-border bg-background p-2 text-[12px] text-foreground">
                    {viewingSupplier.notes}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setViewingSupplier(null)}
                className="h-8 rounded-sm border border-input bg-background px-4 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------- Edit Supplier Modal ------------------------ */}
      {editingSupplier && (
        <Dialog open={!!editingSupplier} onOpenChange={(open) => !open && setEditingSupplier(null)}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-foreground">
                Edit Supplier — {editingSupplier.supplierCode}
              </DialogTitle>
              <DialogDescription className="text-[13px]">
                Update supplier details, contact info, or status.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSupplierSubmit} className="space-y-4 py-2">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Supplier Code
                    </label>
                    <input
                      type="text"
                      disabled
                      value={editingSupplier.supplierCode}
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-muted px-2.5 font-mono text-[13px] text-muted-foreground cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Status
                    </label>
                    <select
                      value={editingSupplier.status}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          status: e.target.value as SupplierStatus,
                        })
                      }
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.supplierName}
                    onChange={(e) =>
                      setEditingSupplier({ ...editingSupplier, supplierName: e.target.value })
                    }
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSupplier.contactPerson}
                      onChange={(e) =>
                        setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })
                      }
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSupplier.phone}
                      onChange={(e) =>
                        setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                      }
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 font-mono text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editingSupplier.email}
                      onChange={(e) =>
                        setEditingSupplier({ ...editingSupplier, email: e.target.value })
                      }
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={editingSupplier.gstNumber || ""}
                      onChange={(e) =>
                        setEditingSupplier({ ...editingSupplier, gstNumber: e.target.value })
                      }
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 font-mono text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editingSupplier.address || ""}
                      onChange={(e) =>
                        setEditingSupplier({ ...editingSupplier, address: e.target.value })
                      }
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Location / City
                    </label>
                    <input
                      type="text"
                      value={editingSupplier.city}
                      onChange={(e) =>
                        setEditingSupplier({
                          ...editingSupplier,
                          city: e.target.value,
                          location: e.target.value,
                        })
                      }
                      className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Items / Materials Supplied
                  </label>
                  <input
                    type="text"
                    value={editingSupplier.itemsSuppliedList}
                    onChange={(e) =>
                      setEditingSupplier({
                        ...editingSupplier,
                        itemsSuppliedList: e.target.value,
                      })
                    }
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editingSupplier.notes || ""}
                    onChange={(e) =>
                      setEditingSupplier({ ...editingSupplier, notes: e.target.value })
                    }
                    className="mt-1 w-full rounded-sm border border-input bg-background p-2 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="h-8 rounded-sm border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 rounded-sm bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
