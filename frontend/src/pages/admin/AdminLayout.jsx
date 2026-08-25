import { useCallback, useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AppContext } from "../../context/AppContext";
import LogoutConfirmModal from "../../components/LogoutConfirmModal";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { getAdminPageTitle } from "./adminNavigation";

const AdminLayout = () => {
  const { admin, setAdmin, axios, navigate } = useContext(AppContext);
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("admin-sidebar-collapsed") === "true");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { localStorage.setItem("admin-sidebar-collapsed", String(collapsed)); }, [collapsed]);
  useEffect(() => setMobileOpen(false), [pathname]);
  const closeLogout = useCallback(() => !loggingOut && setLogoutOpen(false), [loggingOut]);

  const logout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      const { data } = await axios.post("/api/auth/logout");
      if (!data.success) throw new Error(data.message || "Logout failed");
      setAdmin(null);
      localStorage.removeItem("admin");
      toast.success(data.message);
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not log out");
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-dvh min-w-0 overflow-hidden bg-slate-50 text-slate-900">
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} collapsed={collapsed} onCollapsedChange={setCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader title={getAdminPageTitle(pathname)} admin={admin} onMenuOpen={() => setMobileOpen(true)} onLogoutRequest={() => setLogoutOpen(true)} />
        <main className="admin-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></div>
        </main>
      </div>
      <LogoutConfirmModal open={logoutOpen} loading={loggingOut} onCancel={closeLogout} onConfirm={logout} />
    </div>
  );
};
export default AdminLayout;
