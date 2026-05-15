import { NavLink } from "react-router-dom";
import CommunityBanner from "../CommunityBanner/CommunityBanner";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pos", label: "POS" },
  { to: "/produk", label: "Produk" },
  { to: "/mitra", label: "Mitra" },
  { to: "/invoice", label: "Invoice" },
  { to: "/pengaturan", label: "Pengaturan" },
];

function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">GrosirKit</p>
            <h1 className="text-lg font-semibold text-slate-900">POS Grosir & Mitra</h1>
          </div>
          <nav className="hidden gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-brand-100 text-brand-900" : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-10 pt-5 sm:px-6">
        <CommunityBanner placement="top" />
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-4 text-sm text-slate-600 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>GrosirKit MVP (Phase 1)</p>
          <CommunityBanner placement="footer" compact />
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-2 lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-1">
          {navItems.slice(0, 6).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-md px-2 py-2 text-center text-xs font-medium",
                  isActive ? "bg-brand-100 text-brand-900" : "text-slate-600",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default AppShell;
