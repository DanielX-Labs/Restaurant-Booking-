import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ title, admin, onMenuOpen, onLogoutRequest, actions }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const email = admin?.email || admin?.admin || "admin@example.com";
  const displayName = admin?.name || email.split("@")[0].replace(/[._-]/g, " ");
  const roleTitle = admin?.title || "Administrator";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const close = (event) => !profileRef.current?.contains(event.target) && setProfileOpen(false);
    const escape = (event) => event.key === "Escape" && setProfileOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onMenuOpen} aria-label="Open sidebar" className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-500 lg:hidden"><Menu size={21} /></button>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Admin dashboard</p><h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1></div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {actions && <div className="hidden sm:block">{actions}</div>}
          <div ref={profileRef} className="relative">
            <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-haspopup="menu" aria-expanded={profileOpen} className="flex items-center gap-2 rounded-2xl border border-transparent p-1.5 pr-2 transition hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-500 sm:gap-3 sm:pr-3">
              <span className="grid size-10 overflow-hidden place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white shadow-md">{admin?.image ? <img src={admin.image} alt="" className="size-full object-cover"/> : initials}</span>
              <span className="hidden max-w-40 text-left sm:block"><span className="block truncate text-sm font-semibold capitalize text-slate-800">{displayName}</span><span className="block truncate text-xs text-slate-500">{roleTitle}</span></span>
              <ChevronDown size={16} className={`hidden text-slate-400 transition-transform sm:block ${profileOpen ? "rotate-180" : ""}`} />
            </button>
            <div role="menu" className={`absolute right-0 top-[calc(100%+.65rem)] w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition duration-150 ${profileOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"}`}>
              <div className="border-b border-slate-100 px-3 py-3"><p className="truncate text-sm font-semibold capitalize text-slate-900">{displayName}</p><p className="truncate text-xs text-slate-500">{email}</p></div>
              <button role="menuitem" type="button" onClick={() => { setProfileOpen(false); navigate("/admin/profile"); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-500"><UserRound size={18} /> Profile</button>
              <button role="menuitem" type="button" onClick={() => { setProfileOpen(false); onLogoutRequest(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"><LogOut size={18} /> Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default AdminHeader;
