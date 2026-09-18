import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Eye,
  Plus,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { useFactoryStore } from "../lib/factoryStore";
import { INITIAL_CUSTOMERS, type CustomerRecord } from "../lib/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Leather Factory" },
      {
        name: "description",
        content:
          "Manage leather factory customers, retail buyers, distributors, and finished goods dispatch history.",
      },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const store = useFactoryStore();
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingCustomer, setViewingCustomer] = useState<CustomerRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Customer Form State
  const [newCus, setNewCus] = useState({
    customerCode: `CUS-${Math.floor(100 + Math.random() * 900)}`,
    customerName: "",
    contactPerson: "",
    phone: "",
    email: "",
    city: "Chennai",
    gstNumber: "",
    customerType: "Business" as const,
    notes: "",
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCus.customerName) {
      toast.error("Customer Name is required.");
      return;
    }

    const created: CustomerRecord = {
      id: `cus-${Date.now()}`,
      customerCode: newCus.customerCode,
      customerName: newCus.customerName,
      contactPerson: newCus.contactPerson || "Purchase Manager",
      phone: newCus.phone || "98765 43210",
      email: newCus.email || "buyer@example.com",
      address: "Industrial Estate",
      city: newCus.city,
      state: "Tamil Nadu",
      location: newCus.city,
      gstNumber: newCus.gstNumber || "33ABCDE1234F1Z5",
      customerType: newCus.customerType,
      ordersCount: 1,
      lastTransaction: "18 Sep 2026",
      status: "Active",
      notes: newCus.notes,
      recentTransactions: [
        {
          date: "18 Sep 2026",
          issueNumber: "SO-2026-001",
          items: "Classic Leather Shoe (Black / Size 8)",
          quantity: "50 Pairs",
          purpose: "Finished Product Order",
        },
      ],
    };

    setCustomers([created, ...customers]);
    toast.success(`Customer ${newCus.customerName} added successfully.`);
    setIsAddOpen(false);
  };

  return (
    <AppLayout headerTitle="Sales / Dispatch — Customers">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Customer Directory & Accounts
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Retail buyers, distributors, and finished product dispatch history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Add Customer Client
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Total Customers
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {customers.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Registered buyers & stores</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Business Accounts
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {customers.filter((c) => c.customerType === "Business").length}
          </p>
          <p className="text-[11px] text-muted-foreground">Retail chains & brands</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Distributors
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {customers.filter((c) => c.customerType === "Distributor").length}
          </p>
          <p className="text-[11px] text-muted-foreground">Regional wholesale distributors</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Active Accounts
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">
            {customers.filter((c) => c.status === "Active").length}
          </p>
          <p className="text-[11px] text-success font-medium">Regular dispatch recipients</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search customer, city, contact…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Code</th>
              <th className="px-4 py-2.5 font-medium">Customer Name</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Contact Person</th>
              <th className="px-4 py-2.5 font-medium">City</th>
              <th className="px-4 py-2.5 text-right font-medium">Dispatches</th>
              <th className="px-4 py-2.5 font-medium">Last Order</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers
              .filter(
                (c) =>
                  !searchQuery ||
                  c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.city.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((cus) => (
                <tr key={cus.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                    {cus.customerCode}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {cus.customerName}
                    {cus.gstNumber && (
                      <p className="text-[10px] text-muted-foreground">GST: {cus.gstNumber}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{cus.customerType}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <p className="font-medium text-foreground">{cus.contactPerson}</p>
                    <p className="text-[11px]">{cus.phone}</p>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{cus.city}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                    {cus.ordersCount}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{cus.lastTransaction}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium ${
                        cus.status === "Active"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {cus.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setViewingCustomer(cus)}
                      className="rounded-sm border border-input bg-background p-1 text-muted-foreground hover:text-foreground"
                      title="View Customer Details & History"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* VIEW CUSTOMER DIALOG */}
      <Dialog open={Boolean(viewingCustomer)} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingCustomer?.customerName}</DialogTitle>
            <DialogDescription>
              Customer account details and finished goods dispatch history.
            </DialogDescription>
          </DialogHeader>

          {viewingCustomer && (
            <div className="space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-2 rounded-sm bg-accent/40 p-3 text-[12px]">
                <div>
                  <span className="text-muted-foreground">Code: </span>
                  <span className="font-mono font-bold text-foreground">
                    {viewingCustomer.customerCode}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">City: </span>
                  <span className="font-semibold text-foreground">{viewingCustomer.city}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact: </span>
                  <span className="font-medium text-foreground">
                    {viewingCustomer.contactPerson}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium text-foreground">{viewingCustomer.phone}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-bold text-foreground uppercase mb-1">
                  Finished Goods Dispatch History
                </h4>
                <div className="space-y-1">
                  {viewingCustomer.recentTransactions.map((tx, i) => (
                    <div
                      key={i}
                      className="flex justify-between rounded-sm border border-border px-2.5 py-1.5 text-[12px]"
                    >
                      <div>
                        <p className="font-medium text-foreground">{tx.items}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Ref: {tx.issueNumber} | {tx.date}
                        </p>
                      </div>
                      <span className="font-bold text-success">{tx.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setViewingCustomer(null)}
              className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD CUSTOMER DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer Client</DialogTitle>
            <DialogDescription>
              Register a retail store or wholesale distributor for finished goods dispatches.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Customer / Company Name</label>
              <input
                type="text"
                required
                placeholder="ABC Retail Footwear"
                value={newCus.customerName}
                onChange={(e) => setNewCus({ ...newCus, customerName: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Contact Person</label>
                <input
                  type="text"
                  placeholder="Vikram Singh"
                  value={newCus.contactPerson}
                  onChange={(e) => setNewCus({ ...newCus, contactPerson: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Phone</label>
                <input
                  type="text"
                  placeholder="98765 43210"
                  value={newCus.phone}
                  onChange={(e) => setNewCus({ ...newCus, phone: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">City</label>
                <input
                  type="text"
                  value={newCus.city}
                  onChange={(e) => setNewCus({ ...newCus, city: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">GST Number</label>
                <input
                  type="text"
                  placeholder="33ABCDE1234F1Z5"
                  value={newCus.gstNumber}
                  onChange={(e) => setNewCus({ ...newCus, gstNumber: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save Customer
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
