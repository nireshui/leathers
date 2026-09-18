import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  FilterX,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Building2,
  ToggleLeft,
  ToggleRight,
  ShoppingBag,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
  INITIAL_CUSTOMERS,
  INITIAL_OUTGOING_ENTRIES,
  type CustomerRecord,
  type CustomerStatus,
  type CustomerType,
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

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Leather Factory" },
      {
        name: "description",
        content:
          "Manage leather factory customers, business contacts, and outgoing stock material issues history.",
      },
    ],
  }),
  component: CustomersPage,
});

/* -------------------------------- Badges -------------------------------- */

function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
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

function CustomerTypeBadge({ type }: { type: CustomerType }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-accent/60 border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {type}
    </span>
  );
}

/* -------------------------------- Main Page ------------------------------- */

function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerRecord | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    customerCode: `CUS-00${customers.length + 1}`,
    customerName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    location: "",
    gstNumber: "",
    customerType: "Business" as CustomerType,
    status: "Active" as CustomerStatus,
    notes: "",
  });

  // Unique Locations
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    customers.forEach((c) => {
      if (c.location) locSet.add(c.location);
    });
    return Array.from(locSet).sort();
  }, [customers]);

  // Dynamic Metrics or Default Baseline
  const summaryMetrics = useMemo(() => {
    const activeCount = customers.filter((c) => c.status === "Active").length;
    const inactiveCount = customers.filter((c) => c.status === "Inactive").length;

    // Use reported baselines (36 total, 32 active, 4 inactive) scaled with added local entries if present
    const extraEntries = customers.length - INITIAL_CUSTOMERS.length;
    const totalDisplay = 36 + extraEntries;
    const activeDisplay = 32 + (activeCount - INITIAL_CUSTOMERS.filter((c) => c.status === "Active").length);
    const inactiveDisplay = 4 + (inactiveCount - INITIAL_CUSTOMERS.filter((c) => c.status === "Inactive").length);

    return {
      total: totalDisplay,
      active: activeDisplay,
      inactive: Math.max(0, inactiveDisplay),
    };
  }, [customers]);

  // Filtered Table Data
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchQuery === "" ||
        customer.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || customer.status === selectedStatus;

      const matchesLocation =
        selectedLocation === "all" || customer.location === selectedLocation;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [customers, searchQuery, selectedStatus, selectedLocation]);

  // Handlers
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.customerName.trim()) {
      toast.error("Please enter a customer or company name.");
      return;
    }

    const created: CustomerRecord = {
      id: `cus-${Date.now()}`,
      customerCode: newCustomer.customerCode || `CUS-00${customers.length + 1}`,
      customerName: newCustomer.customerName.trim(),
      contactPerson: newCustomer.contactPerson.trim() || "—",
      phone: newCustomer.phone.trim() || "—",
      email: newCustomer.email.trim() || "—",
      address: newCustomer.address.trim() || "—",
      city: newCustomer.city.trim() || "Chennai",
      state: newCustomer.state.trim() || "Tamil Nadu",
      location: newCustomer.location.trim() || newCustomer.city.trim() || "Chennai",
      gstNumber: newCustomer.gstNumber.trim().toUpperCase() || "—",
      customerType: newCustomer.customerType,
      ordersCount: 0,
      lastTransaction: "No transactions yet",
      status: newCustomer.status,
      notes: newCustomer.notes.trim() || undefined,
      recentTransactions: [],
    };

    setCustomers([created, ...customers]);
    setIsAddOpen(false);
    toast.success(`Customer ${created.customerCode} (${created.customerName}) added successfully.`);

    // Reset Form
    setNewCustomer({
      customerCode: `CUS-00${customers.length + 2}`,
      customerName: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "Tamil Nadu",
      location: "",
      gstNumber: "",
      customerType: "Business",
      status: "Active",
      notes: "",
    });
  };

  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!editingCustomer.customerName.trim()) {
      toast.error("Customer name cannot be empty.");
      return;
    }

    setCustomers((prev) =>
      prev.map((c) => (c.id === editingCustomer.id ? editingCustomer : c))
    );
    toast.success(`Customer ${editingCustomer.customerCode} updated successfully.`);
    setEditingCustomer(null);
  };

  const handleToggleStatus = (customer: CustomerRecord) => {
    const nextStatus: CustomerStatus = customer.status === "Active" ? "Inactive" : "Active";
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, status: nextStatus } : c))
    );
    toast.info(
      `Status for ${customer.customerCode} changed to ${nextStatus}.`
    );
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedStatus !== "all" || selectedLocation !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedLocation("all");
  };

  return (
    <AppLayout
      headerTitle="Customers"
      headerRightContent={
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={14} />
            <span>+ Add Customer</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ------------------ Summary Cards ------------------ */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-sm border border-border bg-card p-3 shadow-xs">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Customers
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
              {summaryMetrics.total}
            </p>
          </div>
          <div className="rounded-sm border border-border bg-card p-3 shadow-xs">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Active Customers
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-success">
              {summaryMetrics.active}
            </p>
          </div>
          <div className="rounded-sm border border-border bg-card p-3 shadow-xs">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Inactive Customers
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-muted-foreground">
              {summaryMetrics.inactive}
            </p>
          </div>
        </div>

        {/* ------------------ Filters Bar ------------------ */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-sm border border-border bg-card p-2.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Statuses</option>
                {CUSTOMER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Location:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-7 rounded-sm border border-input bg-background px-2 py-0.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <FilterX size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredCustomers.length}</span> of{" "}
            <span className="font-semibold text-foreground">{customers.length}</span> records
          </div>
        </div>

        {/* ------------------ Main Customer Table ------------------ */}
        <div className="overflow-hidden rounded-sm border border-border bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5">Customer Code</th>
                  <th className="px-3 py-2.5">Customer Name</th>
                  <th className="px-3 py-2.5">Contact Person</th>
                  <th className="px-3 py-2.5">Phone</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5 text-right">Orders / Issues</th>
                  <th className="px-3 py-2.5">Last Transaction</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Users size={24} className="text-muted-foreground/40" />
                        <p className="text-xs font-medium">No customers found</p>
                        <p className="text-[11px]">Try adjusting your search query or filter selection.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-3 py-2 font-mono text-[11px] font-medium text-foreground">
                        {c.customerCode}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-foreground">{c.customerName}</div>
                        <div className="mt-0.5 flex items-center gap-1">
                          <CustomerTypeBadge type={c.customerType} />
                          {c.gstNumber !== "—" && (
                            <span className="text-[10px] text-muted-foreground/80 font-mono">
                              GST: {c.gstNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-foreground">{c.contactPerson}</td>
                      <td className="px-3 py-2 text-muted-foreground font-mono text-[11px]">
                        {c.phone}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{c.location}</td>
                      <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                        {c.ordersCount}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{c.lastTransaction}</td>
                      <td className="px-3 py-2">
                        <CustomerStatusBadge status={c.status} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded-sm p-1 hover:bg-accent text-muted-foreground hover:text-foreground">
                            <MoreVertical size={14} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuItem
                              onClick={() => setViewingCustomer(c)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setEditingCustomer({ ...c })}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Pencil size={13} />
                              <span>Edit Customer</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(c)}
                              className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
                            >
                              {c.status === "Active" ? (
                                <>
                                  <ToggleLeft size={13} className="text-muted-foreground" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight size={13} className="text-success" />
                                  <span>Set Active</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* -------------------------------- Modal: Add Customer -------------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden text-xs">
          <form onSubmit={handleCreateCustomer}>
            <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
              <DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Add New Customer
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground">
                Enter company contact details and material issue profiles for factory distribution.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[75vh] overflow-y-auto p-4 space-y-4">
              {/* Basic Information */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1 mb-2">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Customer Code
                    </label>
                    <input
                      type="text"
                      value={newCustomer.customerCode}
                      onChange={(e) => setNewCustomer({ ...newCustomer, customerCode: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Customer / Company Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABC Leather Works"
                      value={newCustomer.customerName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Raj Kumar"
                      value={newCustomer.contactPerson}
                      onChange={(e) => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 98765 43210"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. contact@abcleather.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 33ABCDE1234F1Z5"
                      value={newCustomer.gstNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, gstNumber: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs font-mono uppercase focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 45 Tannery Street, Guindy Industrial Estate"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      City / Hub
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={newCustomer.city}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          city: e.target.value,
                          location: e.target.value,
                        })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={newCustomer.state}
                      onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1 mb-2">
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Customer Type
                    </label>
                    <select
                      value={newCustomer.customerType}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, customerType: e.target.value as CustomerType })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    >
                      {CUSTOMER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Status
                    </label>
                    <select
                      value={newCustomer.status}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, status: e.target.value as CustomerStatus })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    >
                      {CUSTOMER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Special delivery instructions or order preferences..."
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save Customer
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------------- Modal: Edit Customer -------------------------------- */}
      {editingCustomer && (
        <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
          <DialogContent className="max-w-xl p-0 overflow-hidden text-xs">
            <form onSubmit={handleUpdateCustomer}>
              <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
                <DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Pencil size={15} className="text-primary" />
                  Edit Customer — {editingCustomer.customerCode}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  Update company profile and location attributes.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[75vh] overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Customer Code
                    </label>
                    <input
                      type="text"
                      disabled
                      value={editingCustomer.customerCode}
                      className="w-full rounded-sm border border-input bg-muted/40 px-2.5 py-1.5 text-xs font-mono text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Customer / Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.customerName}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, customerName: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={editingCustomer.contactPerson}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, contactPerson: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editingCustomer.phone}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, email: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={editingCustomer.gstNumber}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, gstNumber: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs font-mono uppercase focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editingCustomer.address}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, address: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Location / City
                    </label>
                    <input
                      type="text"
                      value={editingCustomer.location}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          location: e.target.value,
                          city: e.target.value,
                        })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Customer Type
                    </label>
                    <select
                      value={editingCustomer.customerType}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          customerType: e.target.value as CustomerType,
                        })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    >
                      {CUSTOMER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Status
                    </label>
                    <select
                      value={editingCustomer.status}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          status: e.target.value as CustomerStatus,
                        })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                    >
                      {CUSTOMER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editingCustomer.notes || ""}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, notes: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* -------------------------------- Modal: View Customer -------------------------------- */}
      {viewingCustomer && (
        <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden text-xs">
            <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 size={16} className="text-primary" />
                  <span>{viewingCustomer.customerName}</span>
                  <span className="font-mono text-xs text-muted-foreground">({viewingCustomer.customerCode})</span>
                </DialogTitle>
                <CustomerStatusBadge status={viewingCustomer.status} />
              </div>
              <DialogDescription className="text-[11px] text-muted-foreground">
                Customer master info and outgoing material history.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[75vh] overflow-y-auto p-4 space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-sm border border-border bg-muted/20 p-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Contact Person
                  </span>
                  <span className="text-xs font-medium text-foreground">{viewingCustomer.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Phone
                  </span>
                  <span className="text-xs font-mono text-foreground flex items-center gap-1">
                    <Phone size={11} className="text-muted-foreground" />
                    {viewingCustomer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Email
                  </span>
                  <span className="text-xs text-foreground flex items-center gap-1">
                    <Mail size={11} className="text-muted-foreground" />
                    {viewingCustomer.email}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Customer Type
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    <CustomerTypeBadge type={viewingCustomer.customerType} />
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    GST Number
                  </span>
                  <span className="text-xs font-mono text-foreground">{viewingCustomer.gstNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Total Issues
                  </span>
                  <span className="text-xs font-mono font-semibold text-foreground">
                    {viewingCustomer.ordersCount} Orders
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Address
                  </span>
                  <span className="text-xs text-foreground flex items-center gap-1">
                    <MapPin size={11} className="text-muted-foreground shrink-0" />
                    {viewingCustomer.address}, {viewingCustomer.city}, {viewingCustomer.state}
                  </span>
                </div>
                {viewingCustomer.notes && (
                  <div className="col-span-2 sm:col-span-3 border-t border-border/50 pt-2 mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Notes
                    </span>
                    <p className="text-xs text-muted-foreground italic">{viewingCustomer.notes}</p>
                  </div>
                )}
              </div>

              {/* Recent Outgoing Transactions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-primary" />
                    Recent Outgoing Transactions
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Last active: {viewingCustomer.lastTransaction}
                  </span>
                </div>

                <div className="rounded-sm border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Issue No.</th>
                        <th className="px-3 py-2">Items</th>
                        <th className="px-3 py-2 text-right">Quantity</th>
                        <th className="px-3 py-2">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {/* Priority 1: Check if matching entries exist in INITIAL_OUTGOING_ENTRIES */}
                      {(() => {
                        const matchedGlobal = INITIAL_OUTGOING_ENTRIES.filter(
                          (out) =>
                            out.destination.toLowerCase().includes(viewingCustomer.customerName.toLowerCase()) ||
                            viewingCustomer.customerName.toLowerCase().includes(out.destination.toLowerCase())
                        );

                        if (matchedGlobal.length > 0) {
                          return matchedGlobal.map((m) => (
                            <tr key={m.id} className="hover:bg-accent/30">
                              <td className="px-3 py-2 font-mono text-[11px]">{m.date}</td>
                              <td className="px-3 py-2 font-mono font-medium text-foreground">{m.issueNumber}</td>
                              <td className="px-3 py-2 text-foreground">
                                {m.items.map((i) => i.itemName).join(", ")}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                {m.quantityDisplay}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{m.purpose}</td>
                            </tr>
                          ));
                        }

                        if (viewingCustomer.recentTransactions && viewingCustomer.recentTransactions.length > 0) {
                          return viewingCustomer.recentTransactions.map((tx, idx) => (
                            <tr key={idx} className="hover:bg-accent/30">
                              <td className="px-3 py-2 font-mono text-[11px]">{tx.date}</td>
                              <td className="px-3 py-2 font-mono font-medium text-foreground">{tx.issueNumber}</td>
                              <td className="px-3 py-2 text-foreground">{tx.items}</td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                                {tx.quantity}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{tx.purpose}</td>
                            </tr>
                          ));
                        }

                        return (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground text-[11px]">
                              No recent outgoing transactions recorded for this customer.
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20">
              <button
                onClick={() => setViewingCustomer(null)}
                className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground ml-auto"
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
