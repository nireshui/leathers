import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Boxes,
  Building2,
  CheckCircle2,
  FolderTree,
  Hash,
  MapPin,
  Pencil,
  Plus,
  Save,
  Users,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import {
  INITIAL_CATEGORIES_SETTINGS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_INVENTORY_SETTINGS,
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
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Leather Factory" },
      {
        name: "description",
        content:
          "Configure factory information, stock parameters, manufacturing shop floor locations, material categories, document auto-numbering prefixes, and system user roles.",
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

const MANUFACTURING_LOCATIONS: LocationSetting[] = [
  {
    id: "loc-1",
    location: "Raw Material Warehouse",
    description: "Primary warehouse for storing raw cow, goat, and buffalo hides.",
    status: "Active",
  },
  {
    id: "loc-2",
    location: "Production Store",
    description: "In-factory buffer store for current work-in-progress materials.",
    status: "Active",
  },
  {
    id: "loc-3",
    location: "Cutting Section",
    description: "Shop floor section where leather panels and uppers are die cut.",
    status: "Active",
  },
  {
    id: "loc-4",
    location: "Stitching Section",
    description: "Assembly floor for upper stitching, bag sewing, and belt crafting.",
    status: "Active",
  },
  {
    id: "loc-5",
    location: "Finishing Section",
    description: "Edge painting, buffing, polishing, and sole lasting unit.",
    status: "Active",
  },
  {
    id: "loc-6",
    location: "Quality Check",
    description: "Final QA inspection and defect checking zone.",
    status: "Active",
  },
  {
    id: "loc-7",
    location: "Finished Goods Warehouse",
    description: "Boxed finished shoes, bags, belts, and wallets ready for dispatch.",
    status: "Active",
  },
];

const MANUFACTURING_NUMBERING: NumberingSetting[] = [
  { id: "num-1", entity: "Production Order", prefix: "PROD", example: "PROD-00001" },
  { id: "num-2", entity: "Work in Progress (WIP)", prefix: "WIP", example: "WIP-00001" },
  { id: "num-3", entity: "Wastage Log", prefix: "WST", example: "WST-00001" },
  { id: "num-4", entity: "Stock Movement", prefix: "MOV", example: "MOV-00001" },
  { id: "num-5", entity: "Stock Transfer", prefix: "TRF", example: "TRF-00001" },
  { id: "num-6", entity: "Stock Adjustment", prefix: "ADJ", example: "ADJ-00001" },
  { id: "num-7", entity: "Incoming GRN", prefix: "IN", example: "IN-00001" },
  { id: "num-8", entity: "Outgoing Dispatch", prefix: "OUT", example: "OUT-00001" },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");

  const [company, setCompany] = useState<CompanySetting>({
    ...INITIAL_COMPANY_SETTINGS,
    factoryName: "Leather Product Manufacturing Factory (Unit 4 — Chennai)",
  });
  const [inventory, setInventory] = useState<InventorySetting>(INITIAL_INVENTORY_SETTINGS);
  const [locations, setLocations] = useState<LocationSetting[]>(MANUFACTURING_LOCATIONS);
  const [categories, setCategories] = useState<CategorySetting[]>(INITIAL_CATEGORIES_SETTINGS);
  const [numbering, setNumbering] = useState<NumberingSetting[]>(MANUFACTURING_NUMBERING);
  const [users, setUsers] = useState<UserSetting[]>(INITIAL_USERS_SETTINGS);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Factory settings updated successfully.");
  };

  return (
    <AppLayout headerTitle="Factory Settings & Configuration">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Factory Settings & Configurations
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Manage factory profile, shop floor locations, auto-numbering prefixes, and user permissions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-6 overflow-x-auto">
          {[
            { id: "company", label: "Factory Profile" },
            { id: "inventory", label: "Inventory Rules" },
            { id: "locations", label: "Shop Floor Locations" },
            { id: "numbering", label: "Auto-Numbering" },
            { id: "users", label: "Users & Roles" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
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

      {/* TAB 1: FACTORY PROFILE */}
      {activeTab === "company" && (
        <div className="max-w-2xl rounded-md border border-border bg-card p-4">
          <form onSubmit={handleSaveCompany} className="space-y-4 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium">Factory Name</label>
              <input
                type="text"
                value={company.factoryName}
                onChange={(e) => setCompany({ ...company, factoryName: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Phone</label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-medium">Email</label>
                <input
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium">Address</label>
              <input
                type="text"
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium">City</label>
                <input
                  type="text"
                  value={company.city}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-medium">State</label>
                <input
                  type="text"
                  value={company.state}
                  onChange={(e) => setCompany({ ...company, state: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] font-medium">GST Number</label>
                <input
                  type="text"
                  value={company.gstNumber}
                  onChange={(e) => setCompany({ ...company, gstNumber: e.target.value })}
                  className="h-8 w-full rounded-sm border border-input bg-background px-2.5 text-[13px]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-sm bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SHOP FLOOR LOCATIONS */}
      {activeTab === "locations" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Location Name</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-semibold text-foreground">{loc.location}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{loc.description}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 rounded-sm bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success border border-success/20">
                      {loc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: AUTO-NUMBERING */}
      {activeTab === "numbering" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Entity / Module</th>
                <th className="px-4 py-2.5 font-medium">Prefix</th>
                <th className="px-4 py-2.5 font-medium">Example Format</th>
              </tr>
            </thead>
            <tbody>
              {numbering.map((num) => (
                <tr key={num.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-semibold text-foreground">{num.entity}</td>
                  <td className="px-4 py-2.5 font-mono text-primary font-bold">{num.prefix}</td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{num.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: USERS & ROLES */}
      {activeTab === "users" && (
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-accent/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-semibold text-foreground">{u.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{u.role}</td>
                  <td className="px-4 py-2.5 text-success font-medium">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
