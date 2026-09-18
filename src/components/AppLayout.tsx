import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Factory,
  FileBarChart2,
  FolderKanban,
  Layers,
  LayoutDashboard,
  PackageCheck,
  PackageSearch,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

interface NavGroup {
  label: string;
  icon: any;
  href?: string;
  subItems?: { label: string; href: string; search?: Record<string, string> }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Inventory",
    icon: Boxes,
    href: "/inventory",
    subItems: [
      { label: "Raw Materials", href: "/inventory", search: { tab: "raw-materials" } },
      { label: "Components & Accessories", href: "/inventory", search: { tab: "components" } },
      { label: "Work in Progress", href: "/inventory", search: { tab: "wip" } },
      { label: "Finished Products", href: "/inventory", search: { tab: "finished" } },
      { label: "Stock Movements", href: "/stock-movements" },
      { label: "Stock Adjustment", href: "/inventory", search: { tab: "adjustment" } },
      { label: "Stock Transfer", href: "/inventory", search: { tab: "transfer" } },
    ],
  },
  {
    label: "Purchasing",
    icon: ShoppingCart,
    subItems: [
      { label: "Incoming Stock", href: "/incoming" },
      { label: "Suppliers", href: "/suppliers" },
    ],
  },
  {
    label: "Production",
    icon: Factory,
    href: "/production",
    subItems: [
      { label: "Products", href: "/production", search: { tab: "products" } },
      { label: "Bill of Materials", href: "/production", search: { tab: "bom" } },
      { label: "Production Orders", href: "/production", search: { tab: "orders" } },
      { label: "Production History", href: "/production", search: { tab: "history" } },
      { label: "Wastage", href: "/production", search: { tab: "wastage" } },
    ],
  },
  {
    label: "Sales / Dispatch",
    icon: ArrowUpFromLine,
    subItems: [
      { label: "Customers", href: "/customers" },
      { label: "Outgoing / Dispatch", href: "/outgoing" },
    ],
  },
  {
    label: "Reports",
    icon: FileBarChart2,
    href: "/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

interface AppLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerRightContent?: ReactNode;
}

export function AppLayout({
  children,
  headerTitle = "Factory Management System",
  headerRightContent,
}: AppLayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentSearch = routerState.location.searchStr || "";

  // Auto-expand sections that match current path
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Inventory: currentPath.startsWith("/inventory") || currentPath.startsWith("/stock-movements"),
    Purchasing: currentPath.startsWith("/incoming") || currentPath.startsWith("/suppliers"),
    Production: currentPath.startsWith("/production"),
    "Sales / Dispatch": currentPath.startsWith("/customers") || currentPath.startsWith("/outgoing"),
  });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <Link
          to="/"
          className="flex items-center gap-2.5 border-b border-border px-4 py-3.5 hover:bg-accent/50 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-[11px] font-bold text-primary-foreground">
            LF
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-foreground">Leather Factory</p>
            <p className="text-[11px] text-muted-foreground">Manufacturing & Inventory</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            const hasSub = Boolean(group.subItems && group.subItems.length > 0);
            const isOpen = openSections[group.label];

            // Check parent active status
            const isGroupActive =
              group.href && group.href === "/"
                ? currentPath === "/"
                : group.subItems
                  ? group.subItems.some((s) => currentPath.startsWith(s.href))
                  : group.href
                    ? currentPath.startsWith(group.href)
                    : false;

            if (!hasSub) {
              return (
                <Link
                  key={group.label}
                  to={group.href!}
                  className={`flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors ${
                    isGroupActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  <span>{group.label}</span>
                </Link>
              );
            }

            return (
              <div key={group.label} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSection(group.label)}
                  className={`flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-[13px] transition-colors ${
                    isGroupActive
                      ? "bg-primary/5 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={15} strokeWidth={1.8} />
                    <span>{group.label}</span>
                  </span>
                  <ChevronRight
                    size={14}
                    className={`text-muted-foreground transition-transform duration-150 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isOpen && group.subItems && (
                  <div className="ml-5 space-y-0.5 border-l border-border/60 pl-2">
                    {group.subItems.map((sub) => {
                      let isSubActive = false;

                      if (sub.search?.tab) {
                        isSubActive =
                          currentPath === sub.href && currentSearch.includes(`tab=${sub.search.tab}`);
                      } else {
                        isSubActive =
                          currentPath === sub.href &&
                          (!currentSearch || !currentSearch.includes("tab="));
                      }

                      return (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          search={sub.search}
                          className={`block rounded-sm px-2 py-1 text-[12px] transition-colors ${
                            isSubActive
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] font-medium text-foreground">Unit 4 — Chennai Factory</p>
          <p className="text-[10px] text-muted-foreground">Finished Product Tannery & Workshop</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-13 items-center gap-4 border-b border-border bg-card px-6 py-3">
          <h1 className="text-sm font-semibold text-foreground">{headerTitle}</h1>

          <div className="ml-auto flex items-center gap-3">
            {headerRightContent || (
              <label className="relative hidden sm:block">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  placeholder="Search materials, products, orders…"
                  className="h-8 w-64 rounded-sm border border-input bg-background pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
            )}

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Bell size={15} strokeWidth={1.8} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-sm px-1 py-1 hover:bg-accent transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">
                RG
              </span>
              <span className="hidden text-[13px] font-medium text-foreground lg:block">
                R. Geetha
              </span>
              <ChevronDown size={13} className="hidden text-muted-foreground lg:block" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-6 py-5">{children}</main>
      </div>
    </div>
  );
}

