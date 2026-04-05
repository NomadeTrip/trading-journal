/**
 * Layout — Trading Journal Pro
 * Design: Swiss International Style — sidebar oscuro (#111827) + contenido blanco
 * Sidebar fijo izquierdo con navegación vertical + botón de logout + selector de tema
 */

import { useState } from "react";
import { Link, useLocation, useRouter } from "wouter";
import {
  CalendarDays,
  LayoutDashboard,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useJournal } from "@/contexts/JournalContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import Footer from "./Footer";
import { signOut } from "@/services/authService";
import { toast } from "sonner";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Calendario",
    path: "/",
    icon: <CalendarDays size={20} />,
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { getYearMetrics } = useJournal();
  const { theme, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  // Note: Layout muestra solo la cuenta por defecto en sidebar
  // El selector de cuenta está en Calendar y Dashboard
  const yearMetrics = getYearMetrics("default-account", currentYear);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err);
      toast.error(err?.message || "Error al cerrar sesión");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-[#111827] flex flex-col z-40 transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-white/10 px-4 shrink-0",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
                <TrendingUp size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none tracking-tight">
                  Bastian Trader
                </p>
                <p className="text-emerald-400 text-xs font-medium tracking-widest uppercase">
                  Journal
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
              <TrendingUp size={15} className="text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location === "/" || location === ""
                : location.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group cursor-pointer",
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-white",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-emerald-400" : "text-gray-400 group-hover:text-white"
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Year stats mini */}
        {!collapsed && (
          <div className="mx-3 mb-3 rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2">
              {currentYear}
            </p>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">Winrate</span>
              <span className={cn(
                "text-xs font-bold font-mono",
                yearMetrics.winrate >= 50 ? "text-emerald-400" : "text-red-400"
              )}>
                {yearMetrics.winrate.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">P&L</span>
              <span className={cn(
                "text-xs font-bold font-mono",
                yearMetrics.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {yearMetrics.totalProfit >= 0 ? "+" : ""}
                ${Math.abs(yearMetrics.totalProfit).toFixed(0)}
              </span>
            </div>
          </div>
        )}

        {/* Bottom section - Status + Theme + Logout */}
        <div className="border-t border-white/10 p-2 space-y-1">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all cursor-pointer",
              collapsed && "justify-center px-2"
            )}
          >
            <Activity size={18} />
            {!collapsed && <span className="text-sm font-medium">Estado: Activo</span>}
          </div>

          {/* Theme toggle button */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all cursor-pointer",
                collapsed && "justify-center px-2"
              )}
              title={theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              {!collapsed && (
                <span className="text-sm font-medium">
                  {theme === "light" ? "Tema Oscuro" : "Tema Claro"}
                </span>
              )}
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              collapsed && "justify-center px-2"
            )}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            {!collapsed && (
              <span className="text-sm font-medium">
                {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
              </span>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-md"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content + Footer */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out flex flex-col min-h-screen bg-[#F8F9FB] dark:bg-gray-950",
          collapsed ? "ml-16" : "ml-56"
        )}
      >
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}