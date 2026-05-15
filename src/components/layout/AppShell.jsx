import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pos", label: "POS", icon: ShoppingCart },
  { to: "/produk", label: "Produk", icon: Package },
  { to: "/mitra", label: "Mitra", icon: Users },
  { to: "/invoice", label: "Invoice", icon: FileText },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
];

const pageMeta = {
  "/dashboard": { title: "Dashboard", subtitle: "Ringkasan bisnis" },
  "/pos": { title: "Point of Sale", subtitle: "Order cepat" },
  "/produk": { title: "Produk", subtitle: "Katalog & stok" },
  "/mitra": { title: "Mitra", subtitle: "Pelanggan & tier" },
  "/invoice": { title: "Invoice", subtitle: "Riwayat transaksi" },
  "/pengaturan": { title: "Pengaturan", subtitle: "Konfigurasi aplikasi" },
};

function AppShell({ children }) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const mobileNavRef = useRef(null);
  const location = useLocation();

  const primaryMobileItems = navItems.slice(0, 4);
  const secondaryMobileItems = navItems.slice(4);
  const isPOSRoute = location.pathname.startsWith("/pos");

  const activeMeta = useMemo(() => pageMeta[location.pathname] || pageMeta["/dashboard"], [location.pathname]);

  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMoreMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {!isPOSRoute ? (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">GrosirKit</p>
              <h1 className="text-base font-semibold text-slate-900">{activeMeta.title}</h1>
              <p className="text-xs text-slate-500">{activeMeta.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <nav className="hidden items-center gap-1 lg:flex">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                        isActive ? "bg-brand-100 text-brand-900" : "text-slate-600 hover:bg-slate-100",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <NavLink
                to="/pengaturan"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                aria-label="Buka pengaturan"
              >
                <Settings size={16} />
              </NavLink>
            </div>
          </div>
        </header>
      ) : null}

      <main className={isPOSRoute ? "px-0 pb-0 pt-0" : "mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-28 pt-4"}>{children}</main>

      <nav
        ref={mobileNavRef}
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-2 backdrop-blur lg:hidden"
      >
        <div className="mx-auto w-full max-w-md">
          {isMoreMenuOpen && secondaryMobileItems.length > 0 ? (
            <div id="mobile-overflow-menu" className="mb-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-md">
              {secondaryMobileItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMoreMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                      isActive ? "bg-brand-100 text-brand-900" : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")
                  }
                >
                  <item.icon size={16} absoluteStrokeWidth />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-5 gap-1">
            {primaryMobileItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] font-medium leading-none",
                    isActive ? "bg-brand-100 text-brand-900" : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                <item.icon size={18} absoluteStrokeWidth />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {secondaryMobileItems.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen((open) => !open)}
                aria-expanded={isMoreMenuOpen}
                aria-controls="mobile-overflow-menu"
                className={[
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[11px] font-medium leading-none",
                  isMoreMenuOpen ? "bg-brand-100 text-brand-900" : "text-slate-600 hover:bg-slate-100",
                ].join(" ")}
              >
                <MoreHorizontal size={18} absoluteStrokeWidth />
                <span>Lainnya</span>
              </button>
            ) : null}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default AppShell;
