import { useContext, useEffect, useState } from "react";
import { ArrowLeft, Download, LoaderCircle, QrCode } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const money = (value, currency = "NGN") => new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(value || 0);

const PaymentReceipt = () => {
  const { type, id } = useParams();
  const [params] = useSearchParams();
  const { axios } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`/api/payment/receipt/${type}/${id}`).then(({ data: response }) => {
      setData(response);
      if (params.get("print") === "1") setTimeout(() => window.print(), 250);
    }).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load receipt"));
  }, [axios, id, params, type]);

  if (error) return <main className="min-h-[60vh] grid place-items-center p-6"><div className="text-center"><h1 className="text-xl font-bold">Receipt unavailable</h1><p className="mt-2 text-slate-500">{error}</p><Link to={type === "order" ? "/my-orders" : "/my-bookings"} className="mt-5 inline-block text-orange-600">Return to dashboard</Link></div></main>;
  if (!data) return <div className="min-h-[60vh] grid place-items-center"><LoaderCircle className="animate-spin text-orange-500" /></div>;
  const { receipt, restaurant } = data;
  return <main className="receipt-page mx-auto max-w-4xl px-4 py-10">
    <div className="receipt-actions mb-5 flex flex-wrap justify-between gap-3">
      <Link to={type === "order" ? "/my-orders" : "/my-bookings"} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold"><ArrowLeft size={17}/>Back</Link>
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white"><Download size={17}/>Download / Print receipt</button>
    </div>
    <article className="receipt-sheet overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <header className="flex flex-col justify-between gap-5 bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
        <div><p className="text-sm font-semibold uppercase tracking-[.2em] text-orange-400">Restaurant payment slip</p><h1 className="mt-2 text-3xl font-bold">{restaurant.name}</h1><p className="mt-1 text-sm text-slate-300">{restaurant.address}</p>{restaurant.phone && <p className="text-sm text-slate-300">{restaurant.phone}</p>}</div>
        <div className="sm:text-right"><p className="text-xs uppercase text-slate-400">Receipt number</p><p className="font-mono font-bold">{receipt.receiptNumber}</p><p className="mt-2 text-xs text-slate-400">Generated</p><p className="text-sm">{new Date(receipt.createdAt).toLocaleString()}</p></div>
      </header>
      <div className="grid gap-8 p-6 md:grid-cols-[1fr_220px]">
        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><p className="receipt-label">Customer</p><p className="font-bold">{receipt.customer.name}</p><p className="text-sm text-slate-500">{receipt.customer.email}</p><p className="text-sm text-slate-500">{receipt.customer.phone}</p></div>
            <div><p className="receipt-label">{type === "order" ? "Order" : "Booking"} ID</p><p className="break-all font-mono text-sm">{receipt.id}</p><p className="receipt-label mt-3">Payment reference</p><p className="font-mono font-bold text-orange-600">{receipt.paymentReference}</p></div>
          </div>
          <div className="my-6 border-t border-slate-200" />
          {type === "order" ? <div><p className="receipt-label">Order items</p><div className="mt-2 divide-y">{receipt.details.items.map((item, index) => <div key={item._id || index} className="flex justify-between py-3"><span>{item.menuItem?.name || "Menu item"} × {item.quantity}</span><span>{money((item.menuItem?.price || 0) * item.quantity, restaurant.currency)}</span></div>)}</div><p className="mt-3 text-sm text-slate-500">Delivery address: {receipt.details.address}</p></div> : <div className="grid gap-4 sm:grid-cols-3"><div><p className="receipt-label">Reservation date</p><p className="font-semibold">{new Date(receipt.details.date).toLocaleDateString()}</p></div><div><p className="receipt-label">Time</p><p className="font-semibold">{receipt.details.time}</p></div><div><p className="receipt-label">Guests</p><p className="font-semibold">{receipt.details.guests}</p></div></div>}
          <div className="mt-6 rounded-2xl bg-slate-50 p-5"><div className="flex justify-between"><span>Payment method</span><b>Pay at Restaurant</b></div><div className="mt-3 flex justify-between"><span>Payment status</span><b className={receipt.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"}>{receipt.paymentStatus}</b></div><div className="mt-4 flex justify-between border-t pt-4 text-xl"><b>{receipt.paymentStatus === "Paid" ? "Amount paid" : "Amount due"}</b><b>{receipt.amount ? money(receipt.paymentAmount || receipt.amount, restaurant.currency) : "Set at restaurant"}</b></div>{receipt.paymentConfirmedAt && <p className="mt-2 text-right text-xs text-slate-500">Paid {new Date(receipt.paymentConfirmedAt).toLocaleString()}</p>}</div>
        </div>
        <aside id="qr" className="self-start rounded-2xl border p-4 text-center"><div className="mx-auto mb-2 grid size-9 place-items-center rounded-lg bg-orange-50 text-orange-600"><QrCode size={20}/></div><p className="text-sm font-bold">Payment QR code</p><img src={receipt.qrCode} alt={`QR code for ${receipt.paymentReference}`} className="mx-auto mt-3 size-44"/><p className="break-all text-xs text-slate-500">{receipt.paymentReference}</p></aside>
      </div>
      <footer className="border-t bg-orange-50 px-6 py-5 text-center text-sm font-semibold text-orange-900">Payment Instruction: Present this receipt or QR code at the restaurant to complete your payment.</footer>
    </article>
  </main>;
};

export default PaymentReceipt;
