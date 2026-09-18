import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Factory,
  FileSpreadsheet,
  Layers,
  PackageCheck,
  Plus,
  Search,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  calculateProductionMaterialRequirement,
  completeProductionOrder,
  createProductionOrder,
  issueMaterialsForProduction,
  logWastage,
  saveBOM,
  saveProductCatalogItem,
  updateProductionStage,
  useFactoryStore,
  type BillOfMaterial,
  type MaterialRequirementCheck,
  type ProductCatalogItem,
  type ProductionOrder,
  type ProductionStage,
  type WastageRecord,
} from "../lib/factoryStore";
import { LOCATIONS } from "../lib/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/production")({
  head: () => ({
    meta: [
      { title: "Production & Manufacturing — Leather Factory" },
      {
        name: "description",
        content:
          "Manage products catalog, Bill of Materials (BOM), production orders, work in progress, and factory wastage.",
      },
    ],
  }),
  component: ProductionPage,
});

type TabType = "products" | "bom" | "orders" | "history" | "wastage";

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    Completed: "bg-success/10 text-success border-success/20",
    "In Production": "bg-primary/10 text-primary border-primary/20",
    "Quality Check": "bg-warning/10 text-warning border-warning/20",
    Planned: "bg-secondary text-secondary-foreground border-border",
    Draft: "bg-muted text-muted-foreground border-border",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 text-[11px] font-medium leading-4 ${
        tones[status] || "bg-secondary text-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function ProductionPage() {
  const store = useFactoryStore();

  // Search params tab or state
  const searchStr = typeof window !== "undefined" ? window.location.search : "";
  const initialTab: TabType = searchStr.includes("tab=bom")
    ? "bom"
    : searchStr.includes("tab=orders")
      ? "orders"
      : searchStr.includes("tab=history")
        ? "history"
        : searchStr.includes("tab=wastage")
          ? "wastage"
          : "products";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddBOMOpen, setIsAddBOMOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [isLogWastageOpen, setIsLogWastageOpen] = useState(false);

  // Active dialog records
  const [checkingOrder, setCheckingOrder] = useState<ProductionOrder | null>(null);
  const [completingOrder, setCompletingOrder] = useState<ProductionOrder | null>(null);

  // Complete order form
  const [producedQty, setProducedQty] = useState("");
  const [rejectedQty, setRejectedQty] = useState("0");
  const [wastageQty, setWastageQty] = useState("0");

  // New Production Order form
  const [newOrder, setNewOrder] = useState<{
    productId: string;
    variantId: string;
    plannedQuantity: string;
    expectedCompletion: string;
    notes: string;
  }>({
    productId: store.productsCatalog[0]?.id || "",
    variantId: store.productsCatalog[0]?.variants[0]?.id || "",
    plannedQuantity: "100",
    expectedCompletion: "20 Sep 2026",
    notes: "",
  });

  // New Wastage form
  const [newWastage, setNewWastage] = useState<{
    itemId: string;
    quantity: string;
    reason: WastageRecord["reason"];
    notes: string;
  }>({
    itemId: store.rawMaterials[0]?.id || "",
    quantity: "10",
    reason: "Leather Cutting Waste",
    notes: "",
  });

  // Calculate top KPI totals
  const stats = useMemo(() => {
    const activeOrders = store.productionOrders.filter((o) => o.status === "In Production").length;
    const plannedOrders = store.productionOrders.filter((o) => o.status === "Planned").length;
    const totalWipUnits = store.wipItems
      .filter((w) => w.status === "In Production")
      .reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      productsCount: store.productsCatalog.length,
      bomsCount: store.boms.length,
      activeOrders,
      plannedOrders,
      totalWipUnits,
      wastageCount: store.wastageRecords.length,
    };
  }, [store]);

  // Selected product for order creation preview
  const selectedProductForOrder = store.productsCatalog.find((p) => p.id === newOrder.productId);

  /* -------------------------------------------------------------------------- */
  /* HANDLERS                                                                   */
  /* -------------------------------------------------------------------------- */

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.productId || !newOrder.plannedQuantity) {
      toast.error("Please select product and enter planned quantity.");
      return;
    }

    const prod = store.productsCatalog.find((p) => p.id === newOrder.productId);
    const variant = prod?.variants.find((v) => v.id === newOrder.variantId);

    const qty = parseInt(newOrder.plannedQuantity, 10) || 100;

    createProductionOrder({
      productId: prod?.id,
      productCode: prod?.productCode,
      productName: prod?.productName,
      variantId: variant?.id,
      variantSku: variant?.sku,
      variantName: variant?.variantName,
      plannedQuantity: qty,
      expectedCompletion: newOrder.expectedCompletion,
      notes: newOrder.notes,
    });

    toast.success(`Production order created for ${qty} ${prod?.productName}`);
    setIsAddOrderOpen(false);
  };

  const handleIssueMaterials = (orderId: string) => {
    const res = issueMaterialsForProduction(orderId);
    if (res.success) {
      toast.success(res.message);
      setCheckingOrder(null);
    } else {
      toast.error(res.message);
    }
  };

  const handleCompleteOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingOrder) return;

    const pQty = parseInt(producedQty, 10) || 0;
    const rQty = parseInt(rejectedQty, 10) || 0;
    const wQty = parseInt(wastageQty, 10) || 0;

    if (pQty <= 0) {
      toast.error("Please enter a valid produced quantity.");
      return;
    }

    const res = completeProductionOrder({
      orderId: completingOrder.id,
      producedQty: pQty,
      rejectedQty: rQty,
      wastageQty: wQty,
    });

    if (res.success) {
      toast.success(res.message);
      setCompletingOrder(null);
    } else {
      toast.error(res.message);
    }
  };

  const handleLogWastageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = store.rawMaterials.find((m) => m.id === newWastage.itemId);
    if (!item) return;

    const qty = parseFloat(newWastage.quantity) || 1;

    logWastage({
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      materialCategory: "Raw Material",
      quantity: qty,
      unit: item.unit,
      reason: newWastage.reason,
      notes: newWastage.notes,
    });

    toast.success(`Wastage logged for ${qty} ${item.unit} of ${item.itemName}`);
    setIsLogWastageOpen(false);
  };

  return (
    <AppLayout headerTitle="Production & Manufacturing">
      {/* Top Header Summary Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Manufacturing Operations
          </h1>
          <p className="text-[13px] text-muted-foreground">
            BOM Recipes, Production Orders, Stage WIP, and Material Wastage Control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "orders" && (
            <button
              type="button"
              onClick={() => setIsAddOrderOpen(true)}
              className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Create Production Order
            </button>
          )}

          {activeTab === "wastage" && (
            <button
              type="button"
              onClick={() => setIsLogWastageOpen(true)}
              className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Log Factory Wastage
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            In Production Orders
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {stats.activeOrders}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {stats.totalWipUnits} total WIP units in shop floor
          </p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Planned Orders
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {stats.plannedOrders}
          </p>
          <p className="text-[11px] text-muted-foreground">Awaiting material issue</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Products Catalog
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {stats.productsCount}
          </p>
          <p className="text-[11px] text-muted-foreground">{stats.bomsCount} active BOM recipes</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Wastage Logs
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {stats.wastageCount}
          </p>
          <p className="text-[11px] text-warning">Recorded material rejections</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <div className="flex space-x-6">
          {[
            { id: "products", label: "Products Catalog" },
            { id: "bom", label: "Bill of Materials (BOM)" },
            { id: "orders", label: "Production Orders" },
            { id: "history", label: "Production History" },
            { id: "wastage", label: "Factory Wastage" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`border-b-2 py-2.5 text-[13px] font-medium transition-colors ${
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

      {/* SEARCH / FILTER BAR */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Filter orders, products, BOMs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {/* ====================================================================== */}
      {/* TAB 1: PRODUCTS CATALOG                                                */}
      {/* ====================================================================== */}
      {activeTab === "products" && (
        <div className="grid gap-4 md:grid-cols-2">
          {store.productsCatalog.map((product) => (
            <div
              key={product.id}
              className="rounded-md border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {product.productCode} — {product.category}
                  </span>
                  <h3 className="text-base font-bold text-foreground">{product.productName}</h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {product.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Base Selling Price</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    ₹{product.basePrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Costing Summary */}
              <div className="flex items-center justify-between rounded-sm bg-accent/40 px-3 py-2 text-[12px]">
                <div>
                  <span className="text-muted-foreground">Est. Production Cost: </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    ₹{product.estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Margin: </span>
                  <span className="font-semibold text-success tabular-nums">
                    ₹{(product.basePrice - product.estimatedCost).toLocaleString()} (
                    {Math.round(
                      ((product.basePrice - product.estimatedCost) / product.basePrice) * 100
                    )}
                    %)
                  </span>
                </div>
              </div>

              {/* Variants */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1.5">
                  Product Variants ({product.variants.length})
                </p>
                <div className="space-y-1">
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-sm border border-border/60 px-2.5 py-1.5 text-[12px] hover:bg-accent/30"
                    >
                      <div>
                        <span className="font-medium text-foreground">{v.variantName}</span>
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          (SKU: {v.sku})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          Cost: ₹{v.estimatedCost.toLocaleString()}
                        </span>
                        <span className="font-semibold text-foreground">
                          ₹{v.sellingPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 2: BILL OF MATERIALS (BOM)                                         */}
      {/* ====================================================================== */}
      {activeTab === "bom" && (
        <div className="space-y-4">
          {store.boms.map((bom) => (
            <div key={bom.id} className="rounded-md border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-accent/30 px-4 py-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    BOM Recipe: {bom.productName}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({bom.variantName || "All Variants"})
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Product Code: {bom.productCode} | SKU: {bom.variantSku || "BASE"} | Last updated:{" "}
                    {bom.updatedAt}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Total Production Cost / Pair</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    ₹{bom.totalEstimatedCost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* BOM Recipe Ingredients Table */}
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-accent/10 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Material / Component</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 text-right font-medium">Qty Req.</th>
                    <th className="px-4 py-2 text-right font-medium">Wastage %</th>
                    <th className="px-4 py-2 text-right font-medium">Eff. Requirement</th>
                    <th className="px-4 py-2 text-right font-medium">Unit Cost</th>
                    <th className="px-4 py-2 text-right font-medium">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.ingredients.map((ing, idx) => {
                    const effQty = (
                      ing.quantityRequired *
                      (1 + ing.wastagePercent / 100)
                    ).toFixed(2);
                    const totalCost = Math.round(parseFloat(effQty) * ing.unitCost);

                    return (
                      <tr key={idx} className="border-b border-border/50 hover:bg-accent/40">
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          {ing.itemName}
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            ({ing.itemCode})
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {ing.materialCategory}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {ing.quantityRequired} {ing.unit}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-warning">
                          {ing.wastagePercent}%
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                          {effQty} {ing.unit}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          ₹{ing.unitCost}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-foreground">
                          ₹{totalCost.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-accent/20 border-t border-border font-medium text-[12px]">
                    <td colSpan={6} className="px-4 py-2 text-right text-muted-foreground">
                      Material Cost: ₹{bom.totalMaterialCost.toLocaleString()} + Labor/Overhead: ₹
                      {bom.otherCost.toLocaleString()} =
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-foreground tabular-nums">
                      ₹{bom.totalEstimatedCost.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 3: PRODUCTION ORDERS                                               */}
      {/* ====================================================================== */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Order #</th>
                  <th className="px-4 py-2.5 font-medium">Product & Variant</th>
                  <th className="px-4 py-2.5 text-right font-medium">Planned Qty</th>
                  <th className="px-4 py-2.5 font-medium">Stage</th>
                  <th className="px-4 py-2.5 font-medium">Materials Issued</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.productionOrders
                  .filter((o) => o.status !== "Completed")
                  .map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-accent/40">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {order.orderNumber}
                        <p className="text-[10px] text-muted-foreground font-normal">
                          {order.productionDate}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{order.productName}</p>
                        <p className="text-[11px] text-muted-foreground">{order.variantName}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground">
                        {order.plannedQuantity} pairs
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground border border-border">
                          {order.currentStage}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.materialsIssued ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                            <CheckCircle2 size={13} /> Issued
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning">
                            <AlertTriangle size={13} /> Pending Issue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {!order.materialsIssued ? (
                          <button
                            type="button"
                            onClick={() => setCheckingOrder(order)}
                            className="rounded-sm bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            Check Materials & Issue
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCompletingOrder(order)}
                            className="rounded-sm bg-success px-2.5 py-1 text-[11px] font-medium text-success-foreground hover:bg-success/90"
                          >
                            Complete Production
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 4: PRODUCTION HISTORY                                              */}
      {/* ====================================================================== */}
      {activeTab === "history" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Order #</th>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 text-right font-medium">Planned</th>
                <th className="px-4 py-2.5 text-right font-medium">Produced</th>
                <th className="px-4 py-2.5 text-right font-medium">Rejected</th>
                <th className="px-4 py-2.5 text-right font-medium">Wastage</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.productionOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-medium text-foreground">{order.orderNumber}</td>
                  <td className="px-4 py-2.5">
                    {order.productName} ({order.variantName})
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{order.plannedQuantity}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-success tabular-nums">
                    {order.producedQuantity}
                  </td>
                  <td className="px-4 py-2.5 text-right text-destructive tabular-nums">
                    {order.rejectedQuantity}
                  </td>
                  <td className="px-4 py-2.5 text-right text-warning tabular-nums">
                    {order.wastageQuantity}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* TAB 5: FACTORY WASTAGE                                                 */}
      {/* ====================================================================== */}
      {activeTab === "wastage" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Log #</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Material / Product</th>
                <th className="px-4 py-2.5 font-medium">Reason</th>
                <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {store.wastageRecords.map((wst) => (
                <tr key={wst.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-medium text-foreground">{wst.wastageNumber}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{wst.date}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {wst.itemName}
                    {wst.productionOrderNumber && (
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        ({wst.productionOrderNumber})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-sm bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning border border-warning/20">
                      {wst.reason}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-destructive tabular-nums">
                    -{wst.quantity} {wst.unit}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{wst.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* DIALOG 1: MATERIAL AVAILABILITY CHECK & ISSUE                          */}
      {/* ====================================================================== */}
      <Dialog open={Boolean(checkingOrder)} onOpenChange={() => setCheckingOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Material Availability Check — {checkingOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Verify raw material & component availability before issuing stock to shop floor.
            </DialogDescription>
          </DialogHeader>

          {checkingOrder && (
            <div className="space-y-4 text-[13px]">
              <div className="rounded-sm bg-accent/40 p-3 flex justify-between">
                <div>
                  <p className="font-semibold text-foreground">{checkingOrder.productName}</p>
                  <p className="text-[12px] text-muted-foreground">{checkingOrder.variantName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Batch Quantity</p>
                  <p className="font-bold text-foreground">{checkingOrder.plannedQuantity} pairs</p>
                </div>
              </div>

              {/* Requirements Table */}
              <div className="rounded-sm border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Material</th>
                      <th className="px-3 py-2 text-right font-medium">Required</th>
                      <th className="px-3 py-2 text-right font-medium">Available</th>
                      <th className="px-3 py-2 text-right font-medium">Shortage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateProductionMaterialRequirement(
                      checkingOrder.productId,
                      checkingOrder.variantId,
                      checkingOrder.plannedQuantity
                    ).map((req, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-border/60 ${
                          req.hasShortage ? "bg-destructive/10" : ""
                        }`}
                      >
                        <td className="px-3 py-2 font-medium">
                          {req.itemName}
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            ({req.itemCode})
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">
                          {req.requiredQty} {req.unit}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                          {req.availableQty} {req.unit}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-bold tabular-nums ${
                            req.hasShortage ? "text-destructive" : "text-success"
                          }`}
                        >
                          {req.hasShortage ? `-${req.shortageQty} ${req.unit}` : "0 (Sufficient)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {calculateProductionMaterialRequirement(
                checkingOrder.productId,
                checkingOrder.variantId,
                checkingOrder.plannedQuantity
              ).some((r) => r.hasShortage) && (
                <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-destructive flex items-center gap-2 text-[12px]">
                  <AlertTriangle size={16} />
                  <span>
                    <strong>Material Shortage Detected:</strong> You cannot issue materials until
                    raw material inventory is replenished.
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setCheckingOrder(null)}
              className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => checkingOrder && handleIssueMaterials(checkingOrder.id)}
              disabled={
                checkingOrder
                  ? calculateProductionMaterialRequirement(
                      checkingOrder.productId,
                      checkingOrder.variantId,
                      checkingOrder.plannedQuantity
                    ).some((r) => r.hasShortage)
                  : false
              }
              className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Confirm & Issue Materials
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====================================================================== */}
      {/* DIALOG 2: COMPLETE PRODUCTION ORDER                                    */}
      {/* ====================================================================== */}
      <Dialog open={Boolean(completingOrder)} onOpenChange={() => setCompletingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Production Order</DialogTitle>
            <DialogDescription>
              Record completed output, rejections, and wastage to update Finished Goods inventory.
            </DialogDescription>
          </DialogHeader>

          {completingOrder && (
            <form onSubmit={handleCompleteOrderSubmit} className="space-y-3 text-[13px]">
              <div className="rounded-sm bg-accent/40 p-2.5 text-[12px]">
                <p className="font-semibold">{completingOrder.productName}</p>
                <p className="text-muted-foreground">{completingOrder.variantName}</p>
                <p className="mt-1 font-medium">Planned: {completingOrder.plannedQuantity} pairs</p>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Produced Quantity (Approved)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={producedQty || completingOrder.plannedQuantity.toString()}
                  onChange={(e) => setProducedQty(e.target.value)}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-destructive">
                    Rejected Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(e.target.value)}
                    className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-warning">
                    Leather Wastage (Sq.ft)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={wastageQty}
                    onChange={(e) => setWastageQty(e.target.value)}
                    className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingOrder(null)}
                  className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-success px-3 py-1.5 text-[13px] font-medium text-success-foreground hover:bg-success/90"
                >
                  Complete & Add to Stock
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ====================================================================== */}
      {/* DIALOG 3: CREATE PRODUCTION ORDER                                      */}
      {/* ====================================================================== */}
      <Dialog open={isAddOrderOpen} onOpenChange={setIsAddOrderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Production Order</DialogTitle>
            <DialogDescription>
              Schedule a manufacturing batch for finished leather goods.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Select Product</label>
              <select
                value={newOrder.productId}
                onChange={(e) => {
                  const pId = e.target.value;
                  const p = store.productsCatalog.find((x) => x.id === pId);
                  setNewOrder({
                    ...newOrder,
                    productId: pId,
                    variantId: p?.variants[0]?.id || "",
                  });
                }}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              >
                {store.productsCatalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productCode} — {p.productName} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {selectedProductForOrder && (
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Select Variant</label>
                <select
                  value={newOrder.variantId}
                  onChange={(e) => setNewOrder({ ...newOrder, variantId: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  {selectedProductForOrder.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.variantName} (SKU: {v.sku})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Planned Quantity (Pairs / Pcs)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newOrder.plannedQuantity}
                  onChange={(e) => setNewOrder({ ...newOrder, plannedQuantity: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Expected Completion</label>
                <input
                  type="text"
                  value={newOrder.expectedCompletion}
                  onChange={(e) => setNewOrder({ ...newOrder, expectedCompletion: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Notes / Instructions</label>
              <textarea
                rows={2}
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                placeholder="Special instructions for cutting or stitching section..."
                className="w-full rounded-sm border border-input bg-background p-2 text-[13px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddOrderOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create Order
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====================================================================== */}
      {/* DIALOG 4: LOG FACTORY WASTAGE                                          */}
      {/* ====================================================================== */}
      <Dialog open={isLogWastageOpen} onOpenChange={setIsLogWastageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Factory Wastage</DialogTitle>
            <DialogDescription>
              Record material cutting scrap, damaged hides, or defective components.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogWastageSubmit} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Raw Material</label>
              <select
                value={newWastage.itemId}
                onChange={(e) => setNewWastage({ ...newWastage, itemId: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              >
                {store.rawMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.itemCode} — {m.itemName} ({m.currentStock} {m.unit} avail)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Wastage Quantity</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={newWastage.quantity}
                  onChange={(e) => setNewWastage({ ...newWastage, quantity: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium">Reason</label>
                <select
                  value={newWastage.reason}
                  onChange={(e) =>
                    setNewWastage({
                      ...newWastage,
                      reason: e.target.value as WastageRecord["reason"],
                    })
                  }
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                >
                  <option value="Leather Cutting Waste">Leather Cutting Waste</option>
                  <option value="Damaged Leather">Damaged Leather</option>
                  <option value="Defective Sole / Component">Defective Sole / Component</option>
                  <option value="Broken Accessory">Broken Accessory</option>
                  <option value="Other Wastage">Other Wastage</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Notes</label>
              <textarea
                rows={2}
                value={newWastage.notes}
                onChange={(e) => setNewWastage({ ...newWastage, notes: e.target.value })}
                placeholder="Reason or defect details..."
                className="w-full rounded-sm border border-input bg-background p-2 text-[13px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsLogWastageOpen(false)}
                className="rounded-sm border border-input bg-background px-3 py-1.5 text-[13px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Log Wastage
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
