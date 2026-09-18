import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  FilterX,
  Layers,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  executeStockAdjustment,
  executeStockTransfer,
  saveComponent,
  saveFinishedProduct,
  saveRawMaterial,
  useFactoryStore,
  type ComponentItem,
  type FinishedProductItem,
  type LeatherType,
  type RawMaterialGrade,
  type RawMaterialItem,
} from "../lib/factoryStore";
import { LOCATIONS, type Location } from "../lib/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Categorized Inventory — Leather Factory" },
      {
        name: "description",
        content:
          "Manage Raw Materials, Components & Accessories, Work In Progress (WIP), Finished Products, Stock Adjustments, and Transfers.",
      },
    ],
  }),
  component: InventoryPage,
});

type InventoryTab =
  | "raw-materials"
  | "components"
  | "wip"
  | "finished"
  | "movements"
  | "adjustment"
  | "transfer";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "In Stock": "bg-success/10 text-success border-success/20",
    "Low Stock": "bg-warning/10 text-warning border-warning/20",
    "Out of Stock": "bg-destructive/10 text-destructive border-destructive/20",
    "In Production": "bg-primary/10 text-primary border-primary/20",
    Completed: "bg-success/10 text-success border-success/20",
  };

  const Icon = {
    "In Stock": CheckCircle2,
    "Low Stock": AlertTriangle,
    "Out of Stock": XCircle,
    "In Production": Boxes,
    Completed: CheckCircle2,
  }[status] || Package;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-medium leading-4 ${
        styles[status] || "bg-secondary text-secondary-foreground"
      }`}
    >
      <Icon size={12} strokeWidth={2} />
      {status}
    </span>
  );
}

function InventoryPage() {
  const store = useFactoryStore();

  // Tab detection from search string
  const searchStr = typeof window !== "undefined" ? window.location.search : "";
  const initialTab: InventoryTab = searchStr.includes("tab=components")
    ? "components"
    : searchStr.includes("tab=wip")
      ? "wip"
      : searchStr.includes("tab=finished")
        ? "finished"
        : searchStr.includes("tab=movements")
          ? "movements"
          : searchStr.includes("tab=adjustment")
            ? "adjustment"
            : searchStr.includes("tab=transfer")
              ? "transfer"
              : "raw-materials";

  const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Dialog States
  const [isAddRMOpen, setIsAddRMOpen] = useState(false);
  const [isAddCmpOpen, setIsAddCmpOpen] = useState(false);
  const [isAddFpOpen, setIsAddFpOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    itemId: store.rawMaterials[0]?.id || "",
    category: "Raw Material",
    quantity: "50",
    fromLocation: "Main Warehouse" as Location,
    toLocation: "Production Store" as Location,
    reason: "Issued to shop floor",
  });

  // Adjustment Form State
  const [adjustmentForm, setAdjustmentForm] = useState({
    itemId: store.rawMaterials[0]?.id || "",
    category: "Raw Material",
    systemStock: store.rawMaterials[0]?.currentStock || 0,
    physicalStock: (store.rawMaterials[0]?.currentStock || 0).toString(),
    reason: "Physical Count" as const,
    notes: "",
  });

  // New Raw Material Form State
  const [newRM, setNewRM] = useState<{
    itemCode: string;
    itemName: string;
    leatherType: LeatherType;
    grade: RawMaterialGrade;
    color: string;
    thickness: string;
    unit: string;
    currentStock: string;
    minStock: string;
    location: Location;
    averageCost: string;
    description: string;
  }>({
    itemCode: "",
    itemName: "",
    leatherType: "Cow Leather",
    grade: "Grade A",
    color: "Black",
    thickness: "1.2 - 1.4 mm",
    unit: "Sq.ft",
    currentStock: "1000",
    minStock: "300",
    location: "Main Warehouse",
    averageCost: "110",
    description: "",
  });

  // New Component Form State
  const [newCmp, setNewCmp] = useState<{
    itemCode: string;
    itemName: string;
    category: "Component" | "Accessory";
    unit: string;
    currentStock: string;
    minStock: string;
    location: Location;
    cost: string;
    supplierName: string;
    description: string;
  }>({
    itemCode: "",
    itemName: "",
    category: "Component",
    unit: "Piece",
    currentStock: "500",
    minStock: "100",
    location: "Production Store",
    cost: "50",
    supplierName: "Precision Hardware Co",
    description: "",
  });

  // New Finished Product Form State
  const [newFp, setNewFp] = useState<{
    sku: string;
    productName: string;
    productType: FinishedProductItem["productType"];
    variantName: string;
    size: string;
    color: string;
    material: string;
    currentStock: string;
    minStock: string;
    sellingPrice: string;
    productionCost: string;
    location: Location;
    description: string;
  }>({
    sku: "",
    productName: "",
    productType: "Shoes",
    variantName: "Black / Size 8",
    size: "8",
    color: "Black",
    material: "Full Grain Cow Leather",
    currentStock: "50",
    minStock: "15",
    sellingPrice: "3800",
    productionCost: "1850",
    location: "Finished Goods",
    description: "",
  });

  /* -------------------------------------------------------------------------- */
  /* COMPUTED METRICS                                                           */
  /* -------------------------------------------------------------------------- */
  const metrics = useMemo(() => {
    const totalRMStock = store.rawMaterials.reduce((a, b) => a + b.currentStock, 0);
    const lowRMCount = store.rawMaterials.filter((m) => m.status === "Low Stock" || m.status === "Out of Stock").length;
    const totalCmpStock = store.components.reduce((a, b) => a + b.currentStock, 0);
    const totalWipCount = store.wipItems.reduce((a, b) => a + b.quantity, 0);
    const totalFpStock = store.finishedProducts.reduce((a, b) => a + b.currentStock, 0);

    return {
      totalRMStock,
      lowRMCount,
      totalCmpStock,
      totalWipCount,
      totalFpStock,
    };
  }, [store]);

  /* -------------------------------------------------------------------------- */
  /* FORM SUBMIT HANDLERS                                                       */
  /* -------------------------------------------------------------------------- */

  const handleAddRM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRM.itemName || !newRM.currentStock) {
      toast.error("Please enter material name and current stock.");
      return;
    }

    saveRawMaterial({
      itemCode: newRM.itemCode || `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: newRM.itemName,
      leatherType: newRM.leatherType,
      grade: newRM.grade,
      color: newRM.color,
      thickness: newRM.thickness,
      unit: newRM.unit,
      currentStock: parseFloat(newRM.currentStock) || 0,
      minStock: parseFloat(newRM.minStock) || 100,
      location: newRM.location,
      averageCost: parseFloat(newRM.averageCost) || 100,
      description: newRM.description,
    });

    toast.success(`Raw material ${newRM.itemName} saved.`);
    setIsAddRMOpen(false);
  };

  const handleAddCmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCmp.itemName || !newCmp.currentStock) {
      toast.error("Please enter component name and stock.");
      return;
    }

    saveComponent({
      itemCode: newCmp.itemCode || `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: newCmp.itemName,
      category: newCmp.category,
      unit: newCmp.unit,
      currentStock: parseFloat(newCmp.currentStock) || 0,
      minStock: parseFloat(newCmp.minStock) || 50,
      location: newCmp.location,
      cost: parseFloat(newCmp.cost) || 50,
      supplierName: newCmp.supplierName,
      description: newCmp.description,
    });

    toast.success(`Component ${newCmp.itemName} saved.`);
    setIsAddCmpOpen(false);
  };

  const handleAddFp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFp.productName || !newFp.currentStock) {
      toast.error("Please enter product name and stock.");
      return;
    }

    saveFinishedProduct({
      sku: newFp.sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
      productName: newFp.productName,
      productType: newFp.productType,
      variantName: newFp.variantName,
      size: newFp.size,
      color: newFp.color,
      material: newFp.material,
      currentStock: parseInt(newFp.currentStock, 10) || 0,
      minStock: parseInt(newFp.minStock, 10) || 15,
      sellingPrice: parseFloat(newFp.sellingPrice) || 2000,
      productionCost: parseFloat(newFp.productionCost) || 1000,
      location: newFp.location,
      description: newFp.description,
    });

    toast.success(`Finished product ${newFp.productName} saved.`);
    setIsAddFpOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item =
      store.rawMaterials.find((m) => m.id === transferForm.itemId) ||
      store.components.find((c) => c.id === transferForm.itemId);

    if (!item) return;

    const qty = parseFloat(transferForm.quantity) || 0;
    if (qty <= 0) {
      toast.error("Enter a valid transfer quantity.");
      return;
    }

    const res = executeStockTransfer({
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      quantity: qty,
      unit: item.unit,
      fromLocation: transferForm.fromLocation,
      toLocation: transferForm.toLocation,
      reason: transferForm.reason,
    });

    if (res.success) {
      toast.success(res.message);
      setIsTransferOpen(false);
    }
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item =
      store.rawMaterials.find((m) => m.id === adjustmentForm.itemId) ||
      store.components.find((c) => c.id === adjustmentForm.itemId) ||
      store.finishedProducts.find((f) => f.id === adjustmentForm.itemId);

    if (!item) return;

    const phys = parseFloat(adjustmentForm.physicalStock);
    if (isNaN(phys)) {
      toast.error("Enter a valid physical stock number.");
      return;
    }

    const itemCode = "itemCode" in item ? item.itemCode : (item as any).sku;

    const res = executeStockAdjustment({
      itemId: item.id,
      itemCode,
      itemName: item.itemName,
      category: item.category,
      systemStock: item.currentStock,
      physicalStock: phys,
      unit: item.unit || "Unit",
      reason: adjustmentForm.reason,
      notes: adjustmentForm.notes,
    });

    if (res.success) {
      toast.success(res.message);
      setIsAdjustmentOpen(false);
    }
  };

  return (
    <AppLayout headerTitle="Categorized Inventory Management">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Factory Inventory Categories
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Raw materials, components, WIP, finished goods, movements, and stock reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "raw-materials" && (
            <button
              type="button"
              onClick={() => setIsAddRMOpen(true)}
              className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Add Raw Material
            </button>
          )}

          {activeTab === "components" && (
            <button
              type="button"
              onClick={() => setIsAddCmpOpen(true)}
              className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Add Component
            </button>
          )}

          {activeTab === "finished" && (
            <button
              type="button"
              onClick={() => setIsAddFpOpen(true)}
              className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Add Finished Product
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-1.5 text-[13px] font-medium hover:bg-accent"
          >
            <ArrowLeftRight size={15} />
            Stock Transfer
          </button>

          <button
            type="button"
            onClick={() => setIsAdjustmentOpen(true)}
            className="flex items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-1.5 text-[13px] font-medium hover:bg-accent"
          >
            <RotateCcw size={15} />
            Stock Adjustment
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Raw Material Stock
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {metrics.totalRMStock.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">Sq.ft</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Across {store.rawMaterials.length} leather types</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Components & Hardware
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {metrics.totalCmpStock.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">units</span>
          </p>
          <p className="text-[11px] text-muted-foreground">{store.components.length} accessory items</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Work In Progress (WIP)
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {metrics.totalWipCount.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">units</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Active on shop floor</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Finished Goods Stock
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {metrics.totalFpStock.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">pairs/pcs</span>
          </p>
          <p className="text-[11px] text-muted-foreground">Ready for customer dispatch</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-6 overflow-x-auto">
          {[
            { id: "raw-materials", label: `Raw Materials (${store.rawMaterials.length})` },
            { id: "components", label: `Components & Accessories (${store.components.length})` },
            { id: "wip", label: `Work in Progress (${store.wipItems.length})` },
            { id: "finished", label: `Finished Products (${store.finishedProducts.length})` },
            { id: "movements", label: `Stock Movements (${store.stockMovements.length})` },
            { id: "adjustment", label: `Adjustments (${store.stockAdjustments.length})` },
            { id: "transfer", label: `Transfers (${store.stockTransfers.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as InventoryTab)}
              className={`whitespace-nowrap border-b-2 py-2.5 text-[13px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
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
            placeholder="Search code, name, location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-8 rounded-sm border border-input bg-background px-2.5 text-[12px]"
          >
            <option value="all">All Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* TAB 1: RAW MATERIALS INVENTORY                                         */}
      {/* ====================================================================== */}
      {activeTab === "raw-materials" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Item Code</th>
                <th className="px-4 py-2.5 font-medium">Material Name</th>
                <th className="px-4 py-2.5 font-medium">Leather Type & Grade</th>
                <th className="px-4 py-2.5 font-medium">Color / Thickness</th>
                <th className="px-4 py-2.5 text-right font-medium">Current Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Min Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Avg Cost</th>
                <th className="px-4 py-2.5 font-medium">Location</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.rawMaterials
                .filter(
                  (m) =>
                    (!searchQuery ||
                      m.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      m.itemCode.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (selectedLocation === "all" || m.location === selectedLocation)
                )
                .map((rm) => (
                  <tr key={rm.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                      {rm.itemCode}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {rm.itemName}
                      {rm.batchLot && (
                        <p className="text-[10px] text-muted-foreground">Lot: {rm.batchLot}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-foreground">{rm.leatherType}</span>
                      <span className="ml-1 text-[11px] text-muted-foreground">({rm.grade})</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {rm.color} / {rm.thickness}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                      {rm.currentStock.toLocaleString()} {rm.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {rm.minStock} {rm.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                      ₹{rm.averageCost}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{rm.location}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={rm.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: COMPONENTS & ACCESSORIES                                        */}
      {/* ====================================================================== */}
      {activeTab === "components" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Item Code</th>
                <th className="px-4 py-2.5 font-medium">Component / Accessory</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 text-right font-medium">Current Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Min Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Cost / Unit</th>
                <th className="px-4 py-2.5 font-medium">Supplier</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.components
                .filter(
                  (c) =>
                    (!searchQuery ||
                      c.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.itemCode.toLowerCase().includes(searchQuery.toLowerCase())) &&
                    (selectedLocation === "all" || c.location === selectedLocation)
                )
                .map((cmp) => (
                  <tr key={cmp.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                      {cmp.itemCode}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{cmp.itemName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{cmp.category}</td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                      {cmp.currentStock.toLocaleString()} {cmp.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {cmp.minStock} {cmp.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                      ₹{cmp.cost}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {cmp.supplierName || "Default Supplier"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={cmp.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 3: WORK IN PROGRESS (WIP)                                          */}
      {/* ====================================================================== */}
      {activeTab === "wip" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">WIP Code</th>
                <th className="px-4 py-2.5 font-medium">Product & Variant</th>
                <th className="px-4 py-2.5 font-medium">Production Order</th>
                <th className="px-4 py-2.5 font-medium">Manufacturing Stage</th>
                <th className="px-4 py-2.5 text-right font-medium">Batch Qty</th>
                <th className="px-4 py-2.5 text-right font-medium">Progress</th>
                <th className="px-4 py-2.5 font-medium">Location</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.wipItems.map((wip) => (
                <tr key={wip.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">
                    {wip.wipCode}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{wip.productName}</p>
                    <p className="text-[11px] text-muted-foreground">{wip.variantName}</p>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">
                    {wip.productionOrderNumber}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {wip.stage}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                    {wip.quantity} {wip.unit}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-muted-foreground">
                    {wip.completedQuantity} / {wip.quantity} ({Math.round((wip.completedQuantity / wip.quantity) * 100)}%)
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{wip.currentLocation}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={wip.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 4: FINISHED PRODUCTS                                               */}
      {/* ====================================================================== */}
      {activeTab === "finished" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">SKU</th>
                <th className="px-4 py-2.5 font-medium">Product Name</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Variant (Size/Color)</th>
                <th className="px-4 py-2.5 text-right font-medium">Current Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Min Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Selling Price</th>
                <th className="px-4 py-2.5 text-right font-medium">Prod Cost</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.finishedProducts
                .filter(
                  (fp) =>
                    !searchQuery ||
                    fp.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    fp.sku.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((fp) => (
                  <tr key={fp.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{fp.sku}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{fp.productName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fp.productType}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{fp.variantName}</td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                      {fp.currentStock} pairs
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {fp.minStock} pairs
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold text-foreground">
                      ₹{fp.sellingPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      ₹{fp.productionCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={fp.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 5: STOCK MOVEMENTS LEDGER                                          */}
      {/* ====================================================================== */}
      {activeTab === "movements" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Date & Time</th>
                <th className="px-4 py-2.5 font-medium">Movement ID</th>
                <th className="px-4 py-2.5 font-medium">Item / Product</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Movement Type</th>
                <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
                <th className="px-4 py-2.5 text-right font-medium">New Balance</th>
                <th className="px-4 py-2.5 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {store.stockMovements.map((mov) => (
                <tr key={mov.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                    {mov.dateTime || mov.date}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{mov.movementId}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {mov.itemName}
                    <span className="ml-1 text-[10px] text-muted-foreground">({mov.itemCode})</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.category}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {mov.type}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-bold tabular-nums ${
                      mov.quantity >= 0 ? "text-success" : "text-foreground"
                    }`}
                  >
                    {mov.quantityDisplay}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">
                    {mov.balanceDisplay}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{mov.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 6: STOCK ADJUSTMENT HISTORY                                        */}
      {/* ====================================================================== */}
      {activeTab === "adjustment" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Adjustment #</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Item Name</th>
                <th className="px-4 py-2.5 text-right font-medium">System Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Physical Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Difference</th>
                <th className="px-4 py-2.5 font-medium">Reason</th>
                <th className="px-4 py-2.5 font-medium">User</th>
              </tr>
            </thead>
            <tbody>
              {store.stockAdjustments.map((adj) => (
                <tr key={adj.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-medium text-foreground">
                    {adj.adjustmentNumber}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{adj.date}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{adj.itemName}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {adj.systemStock} {adj.unit}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {adj.physicalStock} {adj.unit}
                  </td>
                  <td
                    className={`px-4 py-2.5 text-right font-bold tabular-nums ${
                      adj.difference >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {adj.difference >= 0 ? `+${adj.difference}` : adj.difference} {adj.unit}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{adj.reason}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{adj.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 7: STOCK TRANSFER HISTORY                                          */}
      {/* ====================================================================== */}
      {activeTab === "transfer" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Transfer #</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">From Location</th>
                <th className="px-4 py-2.5 font-medium">To Location</th>
                <th className="px-4 py-2.5 font-medium">Reason</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.stockTransfers.map((trf) => (
                <tr key={trf.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-medium text-foreground">
                    {trf.transferNumber}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{trf.date}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{trf.itemName}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {trf.quantity} {trf.unit}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{trf.fromLocation}</td>
                  <td className="px-4 py-2.5 font-medium text-primary">{trf.toLocation}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{trf.reason}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={trf.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* DIALOG 1: ADD RAW MATERIAL                                             */}
      {/* ====================================================================== */}
      <Dialog open={isAddRMOpen} onOpenChange={setIsAddRMOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Raw Material</DialogTitle>
            <DialogDescription>
              Register a raw leather hide or tanner skin batch into raw material inventory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRM} className="space-y-3 text-[13px]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Item Code</label>
                <input
                  type="text"
                  placeholder="RM-LEATH-007"
                  value={newRM.itemCode}
                  onChange={(e) => setNewRM({ ...newRM, itemCode: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Leather Type</label>
                <select
                  value={newRM.leatherType}
                  onChange={(e) => setNewRM({ ...newRM, leatherType: e.target.value as LeatherType })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  <option value="Cow Leather">Cow Leather</option>
                  <option value="Buffalo Leather">Buffalo Leather</option>
                  <option value="Goat Leather">Goat Leather</option>
                  <option value="Suede Leather">Suede Leather</option>
                  <option value="Synthetic Leather">Synthetic Leather</option>
                  <option value="PU Leather">PU Leather</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Material Name</label>
              <input
                type="text"
                required
                placeholder="Full Grain Cowhide Crust - Cognac"
                value={newRM.itemName}
                onChange={(e) => setNewRM({ ...newRM, itemName: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Grade</label>
                <select
                  value={newRM.grade}
                  onChange={(e) => setNewRM({ ...newRM, grade: e.target.value as RawMaterialGrade })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="Grade C">Grade C</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Color</label>
                <input
                  type="text"
                  value={newRM.color}
                  onChange={(e) => setNewRM({ ...newRM, color: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Thickness</label>
                <input
                  type="text"
                  value={newRM.thickness}
                  onChange={(e) => setNewRM({ ...newRM, thickness: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Unit</label>
                <select
                  value={newRM.unit}
                  onChange={(e) => setNewRM({ ...newRM, unit: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  <option value="Sq.ft">Sq.ft</option>
                  <option value="Sq.m">Sq.m</option>
                  <option value="Kg">Kg</option>
                  <option value="Meter">Meter</option>
                  <option value="Roll">Roll</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Initial Stock</label>
                <input
                  type="number"
                  required
                  value={newRM.currentStock}
                  onChange={(e) => setNewRM({ ...newRM, currentStock: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Min Stock Alert</label>
                <input
                  type="number"
                  value={newRM.minStock}
                  onChange={(e) => setNewRM({ ...newRM, minStock: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Average Cost (₹)</label>
                <input
                  type="number"
                  value={newRM.averageCost}
                  onChange={(e) => setNewRM({ ...newRM, averageCost: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Warehouse Location</label>
                <select
                  value={newRM.location}
                  onChange={(e) => setNewRM({ ...newRM, location: e.target.value as Location })}
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

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddRMOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save Material
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====================================================================== */}
      {/* DIALOG 2: STOCK TRANSFER                                               */}
      {/* ====================================================================== */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Transfer</DialogTitle>
            <DialogDescription>
              Move stock between warehouse, production store, and workshop units.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTransferSubmit} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Item to Transfer</label>
              <select
                value={transferForm.itemId}
                onChange={(e) => setTransferForm({ ...transferForm, itemId: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              >
                <optgroup label="Raw Materials">
                  {store.rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.itemCode} — {m.itemName} ({m.currentStock} {m.unit})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Components">
                  {store.components.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.itemCode} — {c.itemName} ({c.currentStock} {c.unit})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Quantity to Transfer</label>
              <input
                type="number"
                required
                min="1"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">From Location</label>
                <select
                  value={transferForm.fromLocation}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, fromLocation: e.target.value as Location })
                  }
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">To Location</label>
                <select
                  value={transferForm.toLocation}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, toLocation: e.target.value as Location })
                  }
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
              <label className="text-[12px] font-medium">Reason / Transfer Ref</label>
              <input
                type="text"
                value={transferForm.reason}
                onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsTransferOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Execute Transfer
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====================================================================== */}
      {/* DIALOG 3: STOCK ADJUSTMENT                                             */}
      {/* ====================================================================== */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Stock Audit Adjustment</DialogTitle>
            <DialogDescription>
              Reconcile physical stock count against system recorded balance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdjustmentSubmit} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Item to Adjust</label>
              <select
                value={adjustmentForm.itemId}
                onChange={(e) => {
                  const id = e.target.value;
                  const item =
                    store.rawMaterials.find((m) => m.id === id) ||
                    store.components.find((c) => c.id === id) ||
                    store.finishedProducts.find((f) => f.id === id);

                  setAdjustmentForm({
                    ...adjustmentForm,
                    itemId: id,
                    systemStock: item ? item.currentStock : 0,
                    physicalStock: (item ? item.currentStock : 0).toString(),
                  });
                }}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              >
                <optgroup label="Raw Materials">
                  {store.rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.itemCode} — {m.itemName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Components">
                  {store.components.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.itemCode} — {c.itemName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Finished Products">
                  {store.finishedProducts.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.sku} — {f.productName} ({f.variantName})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">System Record</label>
                <input
                  type="text"
                  disabled
                  value={adjustmentForm.systemStock}
                  className="h-8 w-full rounded-sm border border-input bg-accent/50 px-2.5 text-[13px] text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium font-semibold text-primary">
                  Physical Audit Count
                </label>
                <input
                  type="number"
                  required
                  value={adjustmentForm.physicalStock}
                  onChange={(e) =>
                    setAdjustmentForm({ ...adjustmentForm, physicalStock: e.target.value })
                  }
                  className="h-8 w-full rounded-sm border border-primary bg-background px-2.5 text-[13px] font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Reason for Difference</label>
              <select
                value={adjustmentForm.reason}
                onChange={(e) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    reason: e.target.value as any,
                  })
                }
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              >
                <option value="Physical Count">Physical Count</option>
                <option value="Damage">Damage</option>
                <option value="Missing Stock">Missing Stock</option>
                <option value="Data Correction">Data Correction</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Notes</label>
              <input
                type="text"
                placeholder="Audit reference or notes..."
                value={adjustmentForm.notes}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsAdjustmentOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save Stock Adjustment
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
