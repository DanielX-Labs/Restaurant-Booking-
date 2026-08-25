import { ChevronLeft, ChevronRight, PanelLeftClose, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { adminNavigation } from "./adminNavigation";

const AdminSidebar = ({ mobileOpen, onMobileClose, collapsed, onCollapsedChange }) => (
  <>
    <button type="button" aria-label="Close navigation overlay" onClick={onMobileClose} className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden ${mobileOpen ? "visible opacity-100" : "invisible opacity-0"}`} />
    <aside aria-label="Admin navigation" className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-slate-200 shadow-2xl transition-[transform,width] duration-300 lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-20" : "lg:w-72"}`}>
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-5">
        <NavLink to="/admin" onClick={onMobileClose} className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-orange-400">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-black text-white shadow-lg shadow-orange-950/40">R</span>
          <span className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}><span className="block truncate text-base font-bold text-white">Restaurant</span><span className="block truncate text-xs text-slate-400">Admin workspace</span></span>
        </NavLink>
        <button type="button" onClick={onMobileClose} aria-label="Close sidebar" className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-orange-400 lg:hidden"><X size={20} /></button>
      </div>
      <nav className="admin-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
        <p className={`mb-3 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-500 ${collapsed ? "lg:text-center" : ""}`}>{collapsed ? <span className="hidden lg:inline">•••</span> : "Workspace"}</p>
        <ul className="space-y-1.5">
          {adminNavigation.map((item) => {
            const NavigationIcon = item.icon;
            return (
            <li key={item.path} className="group relative">
              <NavLink to={item.path} end={item.path === "/admin"} onClick={onMobileClose} title={collapsed ? item.label : undefined} className={({ isActive }) => `flex h-12 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-orange-400 ${collapsed ? "lg:justify-center" : ""} ${isActive ? "bg-orange-500 text-white shadow-lg shadow-orange-950/30" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>
                <NavigationIcon size={20} className="shrink-0" /><span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
              </NavLink>
              {collapsed && <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+.75rem)] top-1/2 z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100 group-focus-within:opacity-100 lg:block">{item.label}</span>}
            </li>
          )})}
        </ul>
      </nav>
      <div className="hidden border-t border-slate-800 p-3 lg:block">
        <button type="button" onClick={() => onCollapsedChange(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} className={`flex w-full items-center rounded-xl p-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-orange-400 ${collapsed ? "justify-center" : "justify-between"}`}>
          <span className={`flex items-center gap-3 ${collapsed ? "hidden" : ""}`}><PanelLeftClose size={19} /> Collapse sidebar</span>{collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
        </button>
      </div>
    </aside>
  </>
);
export default AdminSidebar;
