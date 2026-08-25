import { Banknote, BookOpenCheck, CirclePlus, Grid2X2, LayoutDashboard, ListTree, PackagePlus, ShoppingBag } from "lucide-react";

export const adminNavigation = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/add-category", label: "Add Category", icon: CirclePlus },
  { path: "/admin/add-menu", label: "Add Menu Item", icon: PackagePlus },
  { path: "/admin/categories", label: "All Categories", icon: ListTree },
  { path: "/admin/menus", label: "All Menu Items", icon: Grid2X2 },
  { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { path: "/admin/bookings", label: "Bookings", icon: BookOpenCheck },
  { path: "/admin/payments", label: "Payments", icon: Banknote },
];

export const getAdminPageTitle = (pathname) => adminNavigation.find(({ path }) => path === pathname)?.label || (pathname === "/admin/profile" ? "Profile" : "Admin Dashboard");
