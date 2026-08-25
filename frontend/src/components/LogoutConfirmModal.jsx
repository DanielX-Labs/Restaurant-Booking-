import { useEffect, useRef } from "react";
import { AlertTriangle, LoaderCircle, LogOut, X } from "lucide-react";

const LogoutConfirmModal = ({ open, loading, onCancel, onConfirm }) => {
  const cancelRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event) => event.key === "Escape" && !loading && onCancel();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && !loading && onCancel()}>
      <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-[fadeIn_.18s_ease-out]">
        <div className="flex items-start justify-between gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle size={24} /></div>
          <button type="button" onClick={onCancel} disabled={loading} aria-label="Close logout dialog" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-50"><X size={20} /></button>
        </div>
        <h2 id="logout-title" className="mt-5 text-xl font-bold text-slate-900">Are you sure you want to log out?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">You will need to sign in again to access your account.</p>
        <div className="mt-7 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={loading} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <><LoaderCircle size={17} className="animate-spin" /> Logging out</> : <><LogOut size={17} /> Logout</>}
          </button>
        </div>
      </div>
    </div>
  );
};
export default LogoutConfirmModal;
