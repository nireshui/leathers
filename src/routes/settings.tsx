import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Boxes,
  MapPin,
  FolderTree,
  Hash,
  Users,
  Save,
  Plus,
  Pencil,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  INITIAL_CATEGORIES_SETTINGS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_INVENTORY_SETTINGS,
  INITIAL_LOCATIONS_SETTINGS,
  INITIAL_NUMBERING_SETTINGS,
  INITIAL_USERS_SETTINGS,
  type CategorySetting,
  type CompanySetting,
  type InventorySetting,
  type LocationSetting,
  type NumberingSetting,
  type UserSetting,
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

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Leather Factory" },
      {
        name: "description",
        content:
          "Configure factory information, stock parameters, storage locations, material categories, document auto-numbering prefixes, and system user roles.",
      },
    ],
  }),
  component: SettingsPage,
});

type SettingsTab =
  | "company"
  | "inventory"
  | "locations"
  | "categories"
  | "numbering"
  | "users";

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");

  // State
  const [company, setCompany] = useState<CompanySetting>(INITIAL_COMPANY_SETTINGS);
  const [inventory, setInventory] = useState<InventorySetting>(
    INITIAL_INVENTORY_SETTINGS
  );
  const [locations, setLocations] = useState<LocationSetting[]>(
    INITIAL_LOCATIONS_SETTINGS
  );
  const [categories, setCategories] = useState<CategorySetting[]>(
    INITIAL_CATEGORIES_SETTINGS
  );
  const [numbering, setNumbering] = useState<NumberingSetting[]>(
    INITIAL_NUMBERING_SETTINGS
  );
  const [users, setUsers] = useState<UserSetting[]>(INITIAL_USERS_SETTINGS);

  // Modals State
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationSetting | null>(null);
  const [newLocation, setNewLocation] = useState({ location: "", description: "" });

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategorySetting | null>(null);
  const [newCategory, setNewCategory] = useState({ category: "", description: "" });

  const [editingNumbering, setEditingNumbering] = useState<NumberingSetting | null>(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSetting | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff" as "Admin" | "Inventory Manager" | "Staff",
    status: "Active" as "Active" | "Inactive",
  });

  // Save Handlers
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Company profile settings saved successfully.");
  };

  const handleSaveInventory = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Inventory operational settings updated successfully.");
  };

  /* ---------------- Locations Handlers ---------------- */
  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.location.trim()) return;
    const item: LocationSetting = {
      id: `loc-${Date.now()}`,
      location: newLocation.location.trim(),
      description: newLocation.description.trim() || "Storage location",
      status: "Active",
    };
    setLocations([...locations, item]);
    setNewLocation({ location: "", description: "" });
    setIsAddLocationOpen(false);
    toast.success(`Storage location "${item.location}" added.`);
  };

  const handleUpdateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    setLocations(
      locations.map((l) => (l.id === editingLocation.id ? editingLocation : l))
    );
    setEditingLocation(null);
    toast.success(`Location updated successfully.`);
  };

  const handleToggleLocationStatus = (loc: LocationSetting) => {
    const nextSt = loc.status === "Active" ? "Inactive" : "Active";
    setLocations(
      locations.map((l) => (l.id === loc.id ? { ...l, status: nextSt } : l))
    );
    toast.info(`Location "${loc.location}" set to ${nextSt}.`);
  };

  /* ---------------- Categories Handlers ---------------- */
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.category.trim()) return;
    const item: CategorySetting = {
      id: `cat-${Date.now()}`,
      category: newCategory.category.trim(),
      description: newCategory.description.trim() || "Item category",
      itemsCount: 0,
      status: "Active",
    };
    setCategories([...categories, item]);
    setNewCategory({ category: "", description: "" });
    setIsAddCategoryOpen(false);
    toast.success(`Category "${item.category}" added.`);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setCategories(
      categories.map((c) => (c.id === editingCategory.id ? editingCategory : c))
    );
    setEditingCategory(null);
    toast.success("Category updated successfully.");
  };

  const handleToggleCategoryStatus = (cat: CategorySetting) => {
    const nextSt = cat.status === "Active" ? "Inactive" : "Active";
    setCategories(
      categories.map((c) => (c.id === cat.id ? { ...c, status: nextSt } : c))
    );
    toast.info(`Category "${cat.category}" set to ${nextSt}.`);
  };

  /* ---------------- Numbering Handlers ---------------- */
  const handleUpdateNumbering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNumbering) return;
    const cleanPrefix = editingNumbering.prefix.trim().toUpperCase();
    const updated: NumberingSetting = {
      ...editingNumbering,
      prefix: cleanPrefix,
      example: `${cleanPrefix}-00001`,
    };
    setNumbering(numbering.map((n) => (n.id === updated.id ? updated : n)));
    setEditingNumbering(null);
    toast.success(`Prefix updated to ${cleanPrefix}. Example: ${updated.example}`);
  };

  /* ---------------- Users Handlers ---------------- */
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    const item: UserSetting = {
      id: `usr-${Date.now()}`,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      phone: newUser.phone.trim() || "—",
      role: newUser.role,
      status: newUser.status,
      lastLogin: "Never",
    };
    setUsers([...users, item]);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "Staff",
      status: "Active",
    });
    setIsAddUserOpen(false);
    toast.success(`User ${item.name} (${item.role}) added successfully.`);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
    toast.success(`User ${editingUser.name} updated.`);
  };

  const handleToggleUserStatus = (usr: UserSetting) => {
    const nextSt = usr.status === "Active" ? "Inactive" : "Active";
    setUsers(users.map((u) => (u.id === usr.id ? { ...u, status: nextSt } : u)));
    toast.info(`User ${usr.name} set to ${nextSt}.`);
  };

  return (
    <AppLayout headerTitle="Settings">
      <div className="flex flex-col gap-4 md:flex-row text-xs">
        {/* Sidebar Tabs */}
        <aside className="w-full shrink-0 md:w-52">
          <div className="rounded-sm border border-border bg-card p-1.5 shadow-xs space-y-0.5">
            <button
              onClick={() => setActiveTab("company")}
              className={`w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-left font-medium transition-colors ${
                activeTab === "company"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Building2 size={15} />
              <span>Company</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-left font-medium transition-colors ${
                activeTab === "inventory"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Boxes size={15} />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab("locations")}
              className={`w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-left font-medium transition-colors ${
                activeTab === "locations"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <MapPin size={15} />
              <span>Locations</span>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-left font-medium transition-colors ${
                activeTab === "categories"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <FolderTree size={15} />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab("numbering")}
              className={`w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-left font-medium transition-colors ${
                activeTab === "numbering"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Hash size={15} />
              <span>Numbering</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-left font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Users size={15} />
              <span>Users</span>
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 min-w-0">
          {/* ---------------- 1. COMPANY SETTINGS ---------------- */}
          {activeTab === "company" && (
            <div className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Company Settings
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  General factory identity, contact numbers, address, and tax registration.
                </p>
              </div>

              <form onSubmit={handleSaveCompany} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Factory / Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={company.factoryName}
                      onChange={(e) =>
                        setCompany({ ...company, factoryName: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={company.phone}
                      onChange={(e) =>
                        setCompany({ ...company, phone: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 font-mono focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={company.email}
                      onChange={(e) =>
                        setCompany({ ...company, email: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Factory Address
                    </label>
                    <input
                      type="text"
                      value={company.address}
                      onChange={(e) =>
                        setCompany({ ...company, address: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={company.city}
                      onChange={(e) =>
                        setCompany({ ...company, city: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={company.state}
                      onChange={(e) =>
                        setCompany({ ...company, state: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={company.gstNumber}
                      onChange={(e) =>
                        setCompany({
                          ...company,
                          gstNumber: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 font-mono uppercase focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Save size={13} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------- 2. INVENTORY SETTINGS ---------------- */}
          {activeTab === "inventory" && (
            <div className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Inventory Settings
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Operational parameters, valuation methodology, and default thresholds.
                </p>
              </div>

              <form onSubmit={handleSaveInventory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Default Measurement Unit
                    </label>
                    <select
                      value={inventory.defaultUnit}
                      onChange={(e) =>
                        setInventory({ ...inventory, defaultUnit: e.target.value })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                    >
                      <option value="Sq.ft">Sq.ft (Square Feet)</option>
                      <option value="Kg">Kg (Kilograms)</option>
                      <option value="Ltr">Ltr (Liters)</option>
                      <option value="Pcs">Pcs (Pieces)</option>
                      <option value="Box">Box</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      disabled
                      value={inventory.currency}
                      className="w-full rounded-sm border border-input bg-muted/40 px-2.5 py-1.5 text-muted-foreground font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Default Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      value={inventory.defaultMinStock}
                      onChange={(e) =>
                        setInventory({
                          ...inventory,
                          defaultMinStock: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 font-mono focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-foreground mb-1">
                      Stock Valuation Method
                    </label>
                    <select
                      value={inventory.stockValuationMethod}
                      onChange={(e) =>
                        setInventory({
                          ...inventory,
                          stockValuationMethod: e.target.value as
                            | "Average Cost"
                            | "FIFO",
                        })
                      }
                      className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                    >
                      <option value="FIFO">FIFO (First-In, First-Out)</option>
                      <option value="Average Cost">Average Cost</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inventory.allowNegativeStock}
                        onChange={(e) =>
                          setInventory({
                            ...inventory,
                            allowNegativeStock: e.target.checked,
                          })
                        }
                        className="rounded-xs border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-medium text-foreground block">
                          Allow Negative Stock
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          Permit outgoing dispatches even if current recorded quantity is 0.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-sm bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Save size={13} />
                    <span>Save Inventory Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------------- 3. LOCATIONS SETTINGS ---------------- */}
          {activeTab === "locations" && (
            <div className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Storage Locations
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Manage factory warehouses, stores, and plant processing units.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddLocationOpen(true)}
                  className="flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus size={14} />
                  <span>+ Add Location</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-sm border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-3 py-2.5">Location</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {locations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-accent/40">
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {loc.location}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {loc.description}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-medium ${
                              loc.status === "Active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {loc.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-sm p-1 hover:bg-accent text-muted-foreground hover:text-foreground">
                              <MoreVertical size={14} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 text-xs">
                              <DropdownMenuItem
                                onClick={() => setEditingLocation({ ...loc })}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil size={13} />
                                <span>Edit Location</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleLocationStatus(loc)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {loc.status === "Active" ? (
                                  <>
                                    <ToggleLeft size={13} />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight size={13} className="text-success" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- 4. CATEGORIES SETTINGS ---------------- */}
          {activeTab === "categories" && (
            <div className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Inventory Categories
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Manage raw materials, semi-finished crusts, chemicals, hardware & accessories categories.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus size={14} />
                  <span>+ Add Category</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-sm border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-3 py-2.5">Category</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5 text-right">Items</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-accent/40">
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {cat.category}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">
                          {cat.description}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-medium text-foreground">
                          {cat.itemsCount}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-medium ${
                              cat.status === "Active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-sm p-1 hover:bg-accent text-muted-foreground hover:text-foreground">
                              <MoreVertical size={14} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 text-xs">
                              <DropdownMenuItem
                                onClick={() => setEditingCategory({ ...cat })}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil size={13} />
                                <span>Edit Category</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleCategoryStatus(cat)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {cat.status === "Active" ? (
                                  <>
                                    <ToggleLeft size={13} />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight size={13} className="text-success" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- 5. NUMBERING SETTINGS ---------------- */}
          {activeTab === "numbering" && (
            <div className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Automatic Numbering Settings
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Configure prefix codes for automatic document and item code generation.
                </p>
              </div>

              <div className="overflow-hidden rounded-sm border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-3 py-2.5">Document / Entity</th>
                      <th className="px-3 py-2.5">Current Prefix</th>
                      <th className="px-3 py-2.5">Example Number</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {numbering.map((num) => (
                      <tr key={num.id} className="hover:bg-accent/40">
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {num.entity}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-primary">
                          {num.prefix}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-muted-foreground">
                          {num.example}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => setEditingNumbering({ ...num })}
                            className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <Pencil size={12} />
                            <span>Change Prefix</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- 6. USERS SETTINGS ---------------- */}
          {activeTab === "users" && (
            <div className="rounded-sm border border-border bg-card p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    User Management
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Manage factory storekeepers, inventory managers, and admin access accounts.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus size={14} />
                  <span>+ Add User</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-sm border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">Role</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Last Login</th>
                      <th className="px-3 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-accent/40">
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {usr.name}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground font-mono text-[11px]">
                          {usr.email}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center rounded-sm bg-accent border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {usr.role}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-medium ${
                              usr.status === "Active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {usr.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground text-[11px]">
                          {usr.lastLogin}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-sm p-1 hover:bg-accent text-muted-foreground hover:text-foreground">
                              <MoreVertical size={14} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 text-xs">
                              <DropdownMenuItem
                                onClick={() => setEditingUser({ ...usr })}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil size={13} />
                                <span>Edit User</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleUserStatus(usr)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {usr.status === "Active" ? (
                                  <>
                                    <ToggleLeft size={13} />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight size={13} className="text-success" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* Add Location Modal */}
      <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden text-xs">
          <form onSubmit={handleAddLocation}>
            <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
              <DialogTitle className="text-sm font-semibold text-foreground">
                Add Storage Location
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Location Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemical Store B"
                  value={newLocation.location}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, location: e.target.value })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short location description..."
                  value={newLocation.description}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddLocationOpen(false)}
                className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add Location
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Location Modal */}
      {editingLocation && (
        <Dialog
          open={!!editingLocation}
          onOpenChange={() => setEditingLocation(null)}
        >
          <DialogContent className="max-w-md p-0 overflow-hidden text-xs">
            <form onSubmit={handleUpdateLocation}>
              <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
                <DialogTitle className="text-sm font-semibold text-foreground">
                  Edit Location — {editingLocation.location}
                </DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLocation.location}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        location: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingLocation.description}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLocation(null)}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
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

      {/* Add Category Modal */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden text-xs">
          <form onSubmit={handleAddCategory}>
            <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
              <DialogTitle className="text-sm font-semibold text-foreground">
                Add Inventory Category
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Category Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dyes & Finishes"
                  value={newCategory.category}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, category: e.target.value })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Category description..."
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(false)}
                className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add Category
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      {editingCategory && (
        <Dialog
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
        >
          <DialogContent className="max-w-md p-0 overflow-hidden text-xs">
            <form onSubmit={handleUpdateCategory}>
              <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
                <DialogTitle className="text-sm font-semibold text-foreground">
                  Edit Category — {editingCategory.category}
                </DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.category}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingCategory.description}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
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

      {/* Edit Prefix Modal */}
      {editingNumbering && (
        <Dialog
          open={!!editingNumbering}
          onOpenChange={() => setEditingNumbering(null)}
        >
          <DialogContent className="max-w-md p-0 overflow-hidden text-xs">
            <form onSubmit={handleUpdateNumbering}>
              <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
                <DialogTitle className="text-sm font-semibold text-foreground">
                  Change Prefix — {editingNumbering.entity}
                </DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Prefix Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IN"
                    value={editingNumbering.prefix}
                    onChange={(e) =>
                      setEditingNumbering({
                        ...editingNumbering,
                        prefix: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 font-mono uppercase focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="rounded-sm bg-muted/30 border border-border p-2.5 text-[11px]">
                  <span className="text-muted-foreground block">
                    Live Example Number:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {editingNumbering.prefix.trim().toUpperCase() || "PREFIX"}-00001
                  </span>
                </div>
              </div>
              <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNumbering(null)}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save Prefix
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden text-xs">
          <form onSubmit={handleAddUser}>
            <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
              <DialogTitle className="text-sm font-semibold text-foreground">
                Add System User
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R. Geetha"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. geetha@leatherfactory.in"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 98765 43210"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 font-mono focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      role: e.target.value as
                        | "Admin"
                        | "Inventory Manager"
                        | "Staff",
                    })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={newUser.status}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      status: e.target.value as "Active" | "Inactive",
                    })
                  }
                  className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Save User
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      {editingUser && (
        <Dialog
          open={!!editingUser}
          onOpenChange={() => setEditingUser(null)}
        >
          <DialogContent className="max-w-md p-0 overflow-hidden text-xs">
            <form onSubmit={handleUpdateUser}>
              <DialogHeader className="border-b border-border px-4 py-3 bg-muted/20">
                <DialogTitle className="text-sm font-semibold text-foreground">
                  Edit User — {editingUser.name}
                </DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value as
                          | "Admin"
                          | "Inventory Manager"
                          | "Staff",
                      })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        status: e.target.value as "Active" | "Inactive",
                      })
                    }
                    className="w-full rounded-sm border border-input bg-background px-2.5 py-1.5 focus:border-primary focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="border-t border-border px-4 py-2.5 bg-muted/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
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
    </AppLayout>
  );
}
