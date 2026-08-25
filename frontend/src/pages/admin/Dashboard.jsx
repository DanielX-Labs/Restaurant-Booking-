import { useContext, useEffect, useState } from "react";
import { CalendarDays, CircleDollarSign, LayoutGrid, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { Card, EmptyState, ErrorState, KPICard, PageIntro, StatusBadge, TableSkeleton } from "./AdminUI";
import { formatNaira } from "../../utils/currency";

const Dashboard = () => {
  const { axios, menus } = useContext(AppContext);
  const [data, setData] = useState({ orders: [], bookings: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const load = async () => { try { setLoading(true); setError(false); const [orders, bookings] = await Promise.all([axios.get("/api/order/orders"), axios.get("/api/booking/bookings")]); setData({ orders: orders.data.orders || [], bookings: bookings.data.bookings || [] }); } catch { setError(true); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const revenue = data.orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const pending = data.orders.filter((order) => order.status === "Pending").length + data.bookings.filter((booking) => booking.status === "Pending").length;
  return <div className="space-y-6">
    <PageIntro eyebrow="Business overview" description="Monitor today’s operational picture, recent customer activity, and items that need attention." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><KPICard label="Menu items" value={menus.length} helper="Published catalog items" icon={LayoutGrid}/><KPICard label="Total orders" value={data.orders.length} helper="All customer orders" icon={ShoppingBag} loading={loading}/><KPICard label="Total bookings" value={data.bookings.length} helper="All table reservations" icon={CalendarDays} loading={loading}/><KPICard label="Recorded revenue" value={formatNaira(revenue)} helper={`${pending} pending action${pending === 1 ? "" : "s"}`} icon={CircleDollarSign} loading={loading}/></div>
    {error ? <Card><ErrorState onRetry={load}/></Card> : <div className="grid gap-6 xl:grid-cols-2">
      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 className="font-bold">Recent orders</h2><p className="text-sm text-slate-500">Latest customer purchases</p></div><Link to="/admin/orders" className="text-sm font-semibold text-orange-600">View all</Link></div>{loading ? <TableSkeleton columns={3}/> : data.orders.length === 0 ? <EmptyState title="No orders yet" description="Customer orders will appear here."/> : <div className="divide-y divide-slate-100">{data.orders.slice(0, 5).map((order) => <div key={order._id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{order.user?.name || "Customer"}</p><p className="text-xs text-slate-500">#{order._id.slice(-6).toUpperCase()}</p></div><p className="text-sm font-bold">{formatNaira(order.totalAmount)}</p><StatusBadge status={order.status}/></div>)}</div>}</Card>
      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 className="font-bold">Upcoming bookings</h2><p className="text-sm text-slate-500">Latest reservation requests</p></div><Link to="/admin/bookings" className="text-sm font-semibold text-orange-600">View all</Link></div>{loading ? <TableSkeleton columns={3}/> : data.bookings.length === 0 ? <EmptyState title="No bookings yet" description="Table reservations will appear here."/> : <div className="divide-y divide-slate-100">{data.bookings.slice(0, 5).map((booking) => <div key={booking._id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{booking.name}</p><p className="text-xs text-slate-500">{new Date(booking.date).toLocaleDateString()} · {booking.time}</p></div><p className="text-sm text-slate-600">{booking.numberOfPeople} guests</p><StatusBadge status={booking.status}/></div>)}</div>}</Card>
    </div>}
  </div>;
};
export default Dashboard;
