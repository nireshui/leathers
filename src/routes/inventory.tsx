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
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  CATEGORIES,
  INITIAL_INVENTORY_ITEMS,
  LOCATIONS,
  STATUSES,
  calculateStockStatus,
  type Category,
  type InventoryItem,
  type Location,
  type StockStatus,
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

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Leather Factory" },
      {
        name: "description",
        content:
          "Current stock position for Leather Factory raw materials, chemicals, accessories, hardware, and finished goods.",
      },
    ],
  }),
  component: InventoryPage,
});

/* -------------------------------- Badges -------------------------------- */

function StatusBadge({ status }: { status: StockStatus }) {
  const styles = {
    "In Stock": "bg-success/10 text-success border-success/20",
    "Low Stock": "bg-warning/10 text-warning border-warning/20",
    "Out of Stock": "bg-destructive/10 text-destructive border-destructive/20",
  }[status];

  const Icon = {
    "In Stock": CheckCircle2,
    "Low Stock": AlertTriangle,
    "Out of Stock": XCircle,
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

function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // New item form state
  const [newItem, setNewItem] = useState<{
    itemCode: string;
    itemName: string;
    category: Category;
    unit: string;
    currentStock: string;
    minStock: string;
    location: Location;
    description: string;
  }>({
    itemCode: "",
    itemName: "",
    category: "Raw Leather",
    unit: "Sq.ft",
    currentStock: "",
    minStock: "",
    location: "Warehouse A",
    description: "",
  });

  // Calculate summary figures based on initial reference counts adjusted for user items
  const summary = useMemo(() => {
    // Base ERP metrics requested: Total 124, In Stock 108, Low/Out 16
    // We adjust dynamically relative to changes in the current list
    const addedCount = items.length - INITIAL_INVENTORY_ITEMS.length;

    let inStockCount = 108;
    let lowOrOutCount = 16;

    items.forEach((item, idx) => {
      if (idx >= INITIAL_INVENTORY_ITEMS.length) {
        if (item.status === "In Stock") inStockCount++;
        else lowOrOutCount++;
      }
    });

    const totalItems = 124 + addedCount;

    return {
      totalItems,
      inStock: inStockCount,
      lowOrOut: lowOrOutCount,
    };
  }, [items]);

  // Filtered items for table
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.itemCode.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

      const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus, selectedLocation]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    selectedLocation !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedLocation("all");
  };

  // Add Item Handler
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.itemCode || !newItem.itemName) {
      toast.error("Please fill in Item Code and Item Name.");
      return;
    }

    const currentStockNum = parseFloat(newItem.currentStock) || 0;
    const minStockNum = parseFloat(newItem.minStock) || 0;
    const computedStatus = calculateStockStatus(currentStockNum, minStockNum);

    const created: InventoryItem = {
      id: `item-${Date.now()}`,
      itemCode: newItem.itemCode.trim().toUpperCase(),
      itemName: newItem.itemName.trim(),
      category: newItem.category,
      unit: newItem.unit.trim() || "Units",
      currentStock: currentStockNum,
      minStock: minStockNum,
      status: computedStatus,
      location: newItem.location,
      description: newItem.description.trim() || undefined,
      lastUpdated: "Just now",
    };

    setItems((prev) => [created, ...prev]);
    setIsAddOpen(false);
    toast.success(`Item ${created.itemCode} (${created.itemName}) added successfully.`);

    // Reset form
    setNewItem({
      itemCode: "",
      itemName: "",
      category: "Raw Leather",
      unit: "Sq.ft",
      currentStock: "",
      minStock: "",
      location: "Warehouse A",
      description: "",
    });
  };

  // Edit Item Handler
  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const computedStatus = calculateStockStatus(editingItem.currentStock, editingItem.minStock);

    const updatedItem: InventoryItem = {
      ...editingItem,
      status: computedStatus,
      lastUpdated: "Just now",
    };

    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    setEditingItem(null);
    toast.success(`Item ${updatedItem.itemCode} updated successfully.`);
  };

  return (
    <AppLayout
      headerTitle="Inventory"
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
              placeholder="Search inventory…"
              className="h-8 w-56 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            />
          </label>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} strokeWidth={2} />
            Add Item
          </button>
        </div>
      }
    >
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total Items
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.totalItems}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Across all categories & locations
          </p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            In Stock
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-foreground">
            {summary.inStock}
          </p>
          <p className="mt-0.5 text-[11px] text-success">Adequate stock levels</p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Low / Out of Stock
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums leading-7 text-warning">
            {summary.lowOrOut}
          </p>
          <p className="mt-0.5 text-[11px] text-warning">Requires attention or reorder</p>
        </div>
      </div>

      {/* Filter Row & Inventory Table */}
      <section className="rounded-md border border-border bg-card">
        {/* Filters Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input (Mobile or integrated) */}
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

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
              {STATUSES.map((st) => (
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
              {LOCATIONS.map((loc) => (
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
            Showing <span className="font-semibold text-foreground">{filteredItems.length}</span>{" "}
            items
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">Item Code</th>
                <th className="px-4 py-2.5 font-semibold">Item Name</th>
                <th className="px-4 py-2.5 font-semibold">Category</th>
                <th className="px-4 py-2.5 font-semibold">Unit</th>
                <th className="px-4 py-2.5 text-right font-semibold">Current Stock</th>
                <th className="px-4 py-2.5 text-right font-semibold">Min. Stock</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Location</th>
                <th className="px-4 py-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Package size={24} className="text-muted-foreground/50" />
                      <p className="text-[13px] font-medium">
                        No items found matching your filters.
                      </p>
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
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-foreground">
                      {item.itemCode}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.itemName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {item.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {item.unit}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                      {item.currentStock.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {item.minStock.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {item.location}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingItem(item)}
                          title="View Details"
                          className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          title="Edit Item"
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
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => setViewingItem(item)}>
                              <Eye className="mr-2 size-3.5" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingItem(item)}>
                              <Pencil className="mr-2 size-3.5" /> Edit Position
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => {
                                setItems((prev) => prev.filter((i) => i.id !== item.id));
                                toast.success(`Item ${item.itemCode} removed.`);
                              }}
                            >
                              Remove Item
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

      {/* --------------------------- Add Item Modal --------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Add New Item
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Add a new inventory item to track current stock levels.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddItemSubmit} className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Item Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LF-005"
                  value={newItem.itemCode}
                  onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Category *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nappa Calfskin"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Unit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sq.ft / Kg"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={newItem.currentStock}
                  onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Minimum Stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Location *
              </label>
              <select
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value as Location })}
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
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Optional notes or specifications..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="mt-1 w-full rounded-sm border border-input bg-background p-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <DialogFooter className="pt-3">
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
                Add Item
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------- View Item Modal --------------------------- */}
      {viewingItem && (
        <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold text-foreground">
                  {viewingItem.itemCode}
                </DialogTitle>
                <StatusBadge status={viewingItem.status} />
              </div>
              <DialogDescription className="text-[13px]">{viewingItem.itemName}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-[13px]">
              <div className="grid grid-cols-2 gap-2 rounded-sm border border-border bg-muted/20 p-3">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">
                    Category
                  </p>
                  <p className="font-medium text-foreground">{viewingItem.category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">
                    Location
                  </p>
                  <p className="font-medium text-foreground">{viewingItem.location}</p>
                </div>
                <div className="mt-2">
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">
                    Current Stock
                  </p>
                  <p className="text-base font-semibold tabular-nums text-foreground">
                    {viewingItem.currentStock.toLocaleString()} {viewingItem.unit}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">
                    Min. Stock Threshold
                  </p>
                  <p className="text-base font-semibold tabular-nums text-muted-foreground">
                    {viewingItem.minStock.toLocaleString()} {viewingItem.unit}
                  </p>
                </div>
              </div>

              {viewingItem.description && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase font-medium">
                    Description
                  </p>
                  <p className="mt-0.5 rounded-sm border border-border bg-background p-2.5 text-[12px] text-foreground">
                    {viewingItem.description}
                  </p>
                </div>
              )}

              {viewingItem.lastUpdated && (
                <div className="text-[11px] text-muted-foreground">
                  Last updated: {viewingItem.lastUpdated}
                </div>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="h-8 rounded-sm border border-input bg-background px-3 text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingItem;
                  setViewingItem(null);
                  setEditingItem(target);
                }}
                className="h-8 rounded-sm bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Edit Item
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* -------------------------- Edit Item Modal --------------------------- */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-foreground">
                Edit Item Position
              </DialogTitle>
              <DialogDescription className="text-[13px]">
                Update current stock or minimum stock threshold for {editingItem.itemCode}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditItemSubmit} className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Item Code
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingItem.itemCode}
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-muted px-2.5 text-[13px] text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value as Category })
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
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.itemName}
                  onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                  className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingItem.currentStock}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        currentStock: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Min. Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingItem.minStock}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        minStock: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1 h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Location
                </label>
                <select
                  value={editingItem.location}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, location: e.target.value as Location })
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
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="mt-1 w-full rounded-sm border border-input bg-background p-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <DialogFooter className="pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
