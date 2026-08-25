import { useContext, useEffect, useState } from "react";
import { Banknote, Search, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AppContext } from "../../context/AppContext";
import { Card, ConfirmActionModal, EmptyState, ErrorState, PageIntro, StatusBadge } from "./AdminUI";

const money = (value) => value ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value) : "Set at restaurant";
const Payments = () => {
  const { axios } = useContext(AppContext);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("reference") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const search = async (event) => {
    event?.preventDefault();
    if (query.trim().length < 2) return toast.error("Enter a payment reference, receipt, ID, or customer name");
    setLoading(true); setFailed(false);
    try { const { data } = await axios.get("/api/payment/search", { params: { q: query } }); setResults(data.results); }
    catch (error) { setFailed(true); toast.error(error.response?.data?.message || "Search failed"); }
    finally { setLoading(false); }
  };
  // Run the URL-seeded lookup once when the verification page opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (params.get("reference")) search(); }, []);
  const confirm = async () => {
    if (!selected || confirming) return;
    setConfirming(true);
    try { const { data } = await axios.put(`/api/payment/confirm/${selected.type}/${selected.id}`); toast.success(data.message); setResults((items) => items.map((item) => item.id === selected.id ? { ...item, ...data.payment } : item)); setSelected(null); }
    catch (error) { toast.error(error.response?.data?.message || "Payment confirmation failed"); }
    finally { setConfirming(false); }
  };
  return <div><PageIntro eyebrow="Physical payments" description="Scan with a keyboard QR scanner or search manually by QR value, reference, receipt number, order/booking ID, or customer." />
    <Card className="mb-5 p-4"><form onSubmit={search} className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Payment lookup</span><Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Scan QR or enter REST-2026-..., receipt, ID, customer" className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"/></label><button disabled={loading} className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Searching…" : "Verify payment"}</button></form></Card>
    {failed ? <Card><ErrorState onRetry={search}/></Card> : results.length === 0 ? <Card><EmptyState title="Find a payment" description="Payment records matching your lookup will appear here. QR codes contain only a secure lookup reference."/></Card> : <div className="grid gap-4">{results.map((item) => <Card key={`${item.type}-${item.id}`} className="p-5"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold uppercase">{item.type}</span><StatusBadge status={item.paymentStatus}/><StatusBadge status={item.status}/></div><h2 className="mt-3 text-lg font-bold">{item.customer.name}</h2><p className="mt-1 break-all font-mono text-sm text-orange-600">{item.paymentReference}</p><p className="mt-1 break-all text-xs text-slate-500">ID: {item.id} · Receipt: {item.receiptNumber}</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="sm:text-right"><p className="text-xs text-slate-500">Amount due</p><p className="text-xl font-bold">{money(item.amount)}</p><p className="text-xs text-slate-500">Pay at Restaurant</p></div>{item.paymentStatus === "Paid" ? <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700"><ShieldCheck size={18}/>Payment Already Confirmed</div> : <button onClick={() => setSelected(item)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white"><Banknote size={18}/>Confirm Payment</button>}</div></div></Card>)}</div>}
    <ConfirmActionModal open={Boolean(selected)} title="Confirm Payment" description={`Confirm that ${selected ? money(selected.amount) : "this amount"} has been physically received from this customer at the restaurant?`} confirmLabel="Confirm Payment" loading={confirming} onCancel={() => !confirming && setSelected(null)} onConfirm={confirm}/>
  </div>;
};
export default Payments;
