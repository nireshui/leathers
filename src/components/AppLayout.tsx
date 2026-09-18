import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Bell,
  Boxes,
  ChevronDown,
  FileBarChart2,
  LayoutDashboard,
  Search,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Inventory", icon: Boxes, href: "/inventory" },
  { label: "Incoming", icon: ArrowDownToLine, href: "/incoming" },
  { label: "Outgoing", icon: ArrowUpFromLine, href: "/outgoing" },
  { label: "Stock Movements", icon: ArrowLeftRight, href: "/stock-movements" },
  { label: "Suppliers", icon: Truck, href: "/suppliers" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Reports", icon: FileBarChart2, href: "/reports" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface AppLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerRightContent?: ReactNode;
}

export function AppLayout({
  children,
  headerTitle = "Inventory Dashboard",
  headerRightContent,
}: AppLayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
        <Link
          to="/"
          className="flex items-center gap-2.5 border-b border-border px-4 py-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-[11px] font-bold text-primary-foreground">
            LF
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-foreground">Leather Factory</p>
            <p className="text-[11px] text-muted-foreground">Inventory System</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const isActive =
              href !== "#" && (href === "/" ? currentPath === "/" : currentPath.startsWith(href));

            if (href === "#") {
              return (
                <span
                  key={label}
                  className="flex cursor-not-allowed items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] text-muted-foreground/60 hover:bg-transparent"
                  title="Coming soon"
                >
                  <Icon size={15} strokeWidth={1.8} />
                  {label}
                </span>
              );
            }

            return (
              <Link
                key={label}
                to={href}
                className={`flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] text-muted-foreground">Unit 4 — Chennai Plant</p>
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
                  placeholder="Search items, references…"
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
