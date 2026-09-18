import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  Boxes,
  FileBarChart2,
  FileSpreadsheet,
  Printer,
  Search,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { useFactoryStore } from "../lib/factoryStore";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Manufacturing Reports — Leather Factory" },
      {
        name: "description",
        content:
          "Comprehensive factory reports for raw materials, material consumption, production orders, finished goods, wastage, and stock ledgers.",
      },
    ],
  }),
  component: ReportsPage,
});

type ReportTab =
  | "inventory"
  | "incoming"
  | "consumption"
  | "production"
  | "finished"
  | "wastage"
  | "movements"
  | "low-stock";

function ReportsPage() {
  const store = useFactoryStore();
  const [activeTab, setActiveTab] = useState<ReportTab>("inventory");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppLayout headerTitle="Manufacturing Reports & Analytics">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Factory Manufacturing Reports
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Inventory valuation, raw material consumption, production efficiency, wastage logs, and stock audit ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-sm border border-input bg-background px-3 py-1.5 text-[13px] font-medium hover:bg-accent"
        >
          <Printer size={15} />
          Print / Export Report
        </button>
      </div>

      {/* Report Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-6 overflow-x-auto">
          {[
            { id: "inventory", label: "Inventory Report" },
            { id: "incoming", label: "Incoming Report" },
            { id: "consumption", label: "Material Consumption" },
            { id: "production", label: "Production Report" },
            { id: "finished", label: "Finished Goods Report" },
            { id: "wastage", label: "Wastage Report" },
            { id: "movements", label: "Stock Movement Report" },
            { id: "low-stock", label: "Low Stock Report" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ReportTab)}
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

      {/* ====================================================================== */}
      {/* REPORT 1: INVENTORY REPORT                                             */}
      {/* ====================================================================== */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <header className="border-b border-border px-4 py-3 bg-accent/20 flex justify-between">
              <h3 className="text-sm font-bold text-foreground">Raw Materials Inventory Valuation</h3>
            </header>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-accent/10 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Code</th>
                  <th className="px-4 py-2.5 font-medium">Material</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 text-right font-medium">Current Stock</th>
                  <th className="px-4 py-2.5 text-right font-medium">Avg Cost</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total Valuation</th>
                </tr>
              </thead>
              <tbody>
                {store.rawMaterials.map((rm) => (
                  <tr key={rm.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-mono text-foreground font-semibold">{rm.itemCode}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{rm.itemName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{rm.leatherType}</td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums">
                      {rm.currentStock.toLocaleString()} {rm.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">₹{rm.averageCost}</td>
                    <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                      ₹{(rm.currentStock * rm.averageCost).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* REPORT 2: INCOMING REPORT                                              */}
      {/* ====================================================================== */}
      {activeTab === "incoming" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">GRN #</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Material Received</th>
                <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">Warehouse Location</th>
              </tr>
            </thead>
            <tbody>
              {store.stockMovements
                .filter((m) => m.type === "Incoming")
                .map((mov) => (
                  <tr key={mov.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{mov.reference}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{mov.date}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{mov.itemName}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-success tabular-nums">
                      {mov.quantityDisplay}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{mov.location}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* REPORT 3: MATERIAL CONSUMPTION REPORT                                  */}
      {/* ====================================================================== */}
      {activeTab === "consumption" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Production Order</th>
                <th className="px-4 py-2.5 font-medium">Raw Material Consumed</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 text-right font-medium">Quantity Consumed</th>
                <th className="px-4 py-2.5 font-medium">Issued To</th>
              </tr>
            </thead>
            <tbody>
              {store.stockMovements
                .filter((m) => m.type === "Material Issue")
                .map((mov) => (
                  <tr key={mov.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 text-muted-foreground">{mov.date}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{mov.reference}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{mov.itemName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{mov.category}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-foreground tabular-nums">
                      {mov.quantityDisplay}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{mov.location}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* REPORT 4: PRODUCTION REPORT                                            */}
      {/* ====================================================================== */}
      {activeTab === "production" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Order #</th>
                <th className="px-4 py-2.5 font-medium">Product & Variant</th>
                <th className="px-4 py-2.5 text-right font-medium">Planned</th>
                <th className="px-4 py-2.5 text-right font-medium">Produced</th>
                <th className="px-4 py-2.5 text-right font-medium">Rejected</th>
                <th className="px-4 py-2.5 text-right font-medium">Wastage</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.productionOrders.map((o) => (
                <tr key={o.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{o.orderNumber}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {o.productName} ({o.variantName})
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{o.plannedQuantity}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-success tabular-nums">
                    {o.producedQuantity}
                  </td>
                  <td className="px-4 py-2.5 text-right text-destructive tabular-nums">
                    {o.rejectedQuantity}
                  </td>
                  <td className="px-4 py-2.5 text-right text-warning tabular-nums">
                    {o.wastageQuantity}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* REPORT 5: FINISHED GOODS REPORT                                        */}
      {/* ====================================================================== */}
      {activeTab === "finished" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">SKU</th>
                <th className="px-4 py-2.5 font-medium">Product Name</th>
                <th className="px-4 py-2.5 font-medium">Variant</th>
                <th className="px-4 py-2.5 text-right font-medium">Current Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Selling Price</th>
                <th className="px-4 py-2.5 text-right font-medium">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {store.finishedProducts.map((fp) => (
                <tr key={fp.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{fp.sku}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{fp.productName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fp.variantName}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                    {fp.currentStock} pairs
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    ₹{fp.sellingPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-foreground">
                    ₹{(fp.currentStock * fp.sellingPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* REPORT 6: WASTAGE REPORT                                               */}
      {/* ====================================================================== */}
      {activeTab === "wastage" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Wastage #</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Material / Item</th>
                <th className="px-4 py-2.5 font-medium">Reason</th>
                <th className="px-4 py-2.5 text-right font-medium">Quantity Lost</th>
                <th className="px-4 py-2.5 font-medium">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {store.wastageRecords.map((wst) => (
                <tr key={wst.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{wst.wastageNumber}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{wst.date}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{wst.itemName}</td>
                  <td className="px-4 py-2.5 text-warning font-medium">{wst.reason}</td>
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
      {/* REPORT 7: STOCK MOVEMENT LEDGER                                        */}
      {/* ====================================================================== */}
      {activeTab === "movements" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Movement ID</th>
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 text-right font-medium">Quantity</th>
                <th className="px-4 py-2.5 font-medium">Ref #</th>
              </tr>
            </thead>
            <tbody>
              {store.stockMovements.map((mov) => (
                <tr key={mov.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.date}</td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{mov.movementId}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{mov.itemName}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{mov.type}</td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums">{mov.quantityDisplay}</td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{mov.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====================================================================== */}
      {/* REPORT 8: LOW STOCK REPORT                                             */}
      {/* ====================================================================== */}
      {activeTab === "low-stock" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-warning/10 text-left text-[11px] uppercase tracking-wide text-warning">
                <th className="px-4 py-2.5 font-medium">Item Name</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 text-right font-medium">Current Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Min Threshold</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.rawMaterials
                .filter((m) => m.status === "Low Stock" || m.status === "Out of Stock")
                .map((m) => (
                  <tr key={m.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-medium text-foreground">{m.itemName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">Raw Material</td>
                    <td className="px-4 py-2.5 text-right font-bold text-warning tabular-nums">
                      {m.currentStock} {m.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                      {m.minStock} {m.unit}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-warning">{m.status}</td>
                  </tr>
                ))}
              {store.finishedProducts
                .filter((f) => f.status === "Low Stock" || f.status === "Out of Stock")
                .map((f) => (
                  <tr key={f.id} className="border-b border-border hover:bg-accent/40">
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {f.productName} ({f.variantName})
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">Finished Goods</td>
                    <td className="px-4 py-2.5 text-right font-bold text-warning tabular-nums">
                      {f.currentStock} pairs
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                      {f.minStock} pairs
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-warning">{f.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
