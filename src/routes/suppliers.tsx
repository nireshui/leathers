import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Receipt,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { useFactoryStore } from "../lib/factoryStore";
import { INITIAL_SUPPLIERS, type SupplierRecord } from "../lib/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers & Vendors — Leather Factory" },
      {
        name: "description",
        content:
          "Manage leather tanneries, chemical suppliers, hardware vendors, and raw material purchase history.",
      },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const store = useFactoryStore();
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSupplier, setViewingSupplier] = useState<SupplierRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Supplier Form
  const [newSup, setNewSup] = useState({
    supplierCode: `SUP-${Math.floor(100 + Math.random() * 900)}`,
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    city: "Chennai",
    gstNumber: "",
    mainCategory: "Raw Leather" as const,
    itemsSuppliedList: "",
    notes: "",
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSup.supplierName) {
      toast.error("Supplier Name is required.");
      return;
    }

    const created: SupplierRecord = {
      id: `sup-${Date.now()}`,
      supplierCode: newSup.supplierCode,
      supplierName: newSup.supplierName,
      contactPerson: newSup.contactPerson || "Contact Person",
      phone: newSup.phone || "98765 43210",
      email: newSup.email || "vendor@example.com",
      city: newSup.city,
      gstNumber: newSup.gstNumber || "33ABCDE1234F1Z5",
      location: newSup.city,
      itemsSuppliedCount: 4,
      mainCategory: newSup.mainCategory,
      itemsSuppliedList: newSup.itemsSuppliedList || "Raw Hides & Supplies",
      status: "Active",
      notes: newSup.notes,
      materials: [
        {
          itemCode: "LF-001",
          itemName: "Full Grain Cow Leather",
          category: "Raw Leather",
          lastReceived: "18 Sep 2026",
          totalQuantity: "1,500 Sq.ft",
        },
      ],
    };

    setSuppliers([created, ...suppliers]);
    toast.success(`Supplier ${newSup.supplierName} added successfully.`);
    setIsAddOpen(false);
  };

  return (
    <AppLayout headerTitle="Purchasing — Suppliers">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Supplier Vendor Management
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Raw hide tanneries, chemical suppliers, hardware vendors, and material supply history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Add Supplier Vendor
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Total Vendors
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {suppliers.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Registered suppliers</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Raw Leather Tanneries
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">3</p>
          <p className="text-[11px] text-muted-foreground">Ranipet & Ambur tanneries</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Hardware & Components
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">2</p>
          <p className="text-[11px] text-muted-foreground">Buckles, zippers & thread suppliers</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Active Accounts
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">
            {suppliers.filter((s) => s.status === "Active").length}
          </p>
          <p className="text-[11px] text-success font-medium">Verified procurement partners</p>
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
            placeholder="Search supplier, contact, city…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* SUPPLIERS TABLE */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Code</th>
              <th className="px-4 py-2.5 font-medium">Supplier Name</th>
              <th className="px-4 py-2.5 font-medium">Main Category</th>
              <th className="px-4 py-2.5 font-medium">Contact Person</th>
              <th className="px-4 py-2.5 font-medium">City / Location</th>
              <th className="px-4 py-2.5 font-medium">Materials Supplied</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers
              .filter(
                (s) =>
                  !searchQuery ||
                  s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.city.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((sup) => (
                <tr key={sup.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                    {sup.supplierCode}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {sup.supplierName}
                    {sup.gstNumber && (
                      <p className="text-[10px] text-muted-foreground">GST: {sup.gstNumber}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{sup.mainCategory}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <p className="font-medium text-foreground">{sup.contactPerson}</p>
                    <p className="text-[11px]">{sup.phone}</p>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{sup.city}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{sup.itemsSuppliedList}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-medium ${
                        sup.status === "Active"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {sup.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setViewingSupplier(sup)}
                      className="rounded-sm border border-input bg-background p-1 text-muted-foreground hover:text-foreground"
                      title="View Supplier Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* VIEW SUPPLIER DIALOG */}
      <Dialog open={Boolean(viewingSupplier)} onOpenChange={() => setViewingSupplier(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingSupplier?.supplierName}</DialogTitle>
            <DialogDescription>Supplier vendor details and materials history.</DialogDescription>
          </DialogHeader>

          {viewingSupplier && (
            <div className="space-y-3 text-[13px]">
              <div className="grid grid-cols-2 gap-2 rounded-sm bg-accent/40 p-3 text-[12px]">
                <div>
                  <span className="text-muted-foreground">Code: </span>
                  <span className="font-mono font-bold text-foreground">
                    {viewingSupplier.supplierCode}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">City: </span>
                  <span className="font-semibold text-foreground">{viewingSupplier.city}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact: </span>
                  <span className="font-medium text-foreground">
                    {viewingSupplier.contactPerson}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-medium text-foreground">{viewingSupplier.phone}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-bold text-foreground uppercase mb-1">
                  Materials Supplied
                </h4>
                <div className="space-y-1">
                  {viewingSupplier.materials.map((m, i) => (
                    <div
                      key={i}
                      className="flex justify-between rounded-sm border border-border px-2.5 py-1.5 text-[12px]"
                    >
                      <span className="font-medium text-foreground">{m.itemName}</span>
                      <span className="text-muted-foreground">{m.totalQuantity} received</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setViewingSupplier(null)}
              className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD SUPPLIER DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Supplier Vendor</DialogTitle>
            <DialogDescription>
              Register a tannery or hardware vendor for raw materials procurement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Supplier Name</label>
              <input
                type="text"
                required
                placeholder="Apex Leather Tannery Pvt Ltd"
                value={newSup.supplierName}
                onChange={(e) => setNewSup({ ...newSup, supplierName: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Contact Person</label>
                <input
                  type="text"
                  placeholder="Rajesh Kumar"
                  value={newSup.contactPerson}
                  onChange={(e) => setNewSup({ ...newSup, contactPerson: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Phone</label>
                <input
                  type="text"
                  placeholder="98765 43210"
                  value={newSup.phone}
                  onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">City / Tannery Cluster</label>
                <input
                  type="text"
                  value={newSup.city}
                  onChange={(e) => setNewSup({ ...newSup, city: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">GST Number</label>
                <input
                  type="text"
                  placeholder="33ABCDE1234F1Z5"
                  value={newSup.gstNumber}
                  onChange={(e) => setNewSup({ ...newSup, gstNumber: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Materials Supplied</label>
              <input
                type="text"
                placeholder="Full Grain Cow Hides, Goat Skins, Wet Blue"
                value={newSup.itemsSuppliedList}
                onChange={(e) => setNewSup({ ...newSup, itemsSuppliedList: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
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
                Save Supplier
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
