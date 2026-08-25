import { useContext, useEffect, useState } from "react";
import { BriefcaseBusiness, Camera, LoaderCircle, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AppContext } from "../../context/AppContext";
import { Card, ErrorState, Field, FormSection, PageIntro, inputClass } from "./AdminUI";

const AdminProfile = () => {
  const { admin, setAdmin, axios } = useContext(AppContext);
  const [form, setForm] = useState({ name: "", phone: "", title: "" });
  const [photo, setPhoto] = useState(null); const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(false);
  const setProfile = (profile) => { setAdmin(profile); setForm({ name: profile.name || "", phone: profile.phone || "", title: profile.title || "" }); };
  const load = async () => { try { setLoading(true); setError(false); const { data } = await axios.get("/api/auth/admin/profile"); if (!data.success) throw new Error(data.message); setProfile(data.admin); } catch { setError(true); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const choosePhoto = (event) => { const file = event.target.files?.[0]; if (!file) return; if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return toast.error("Choose a JPG, PNG, WebP, or GIF image"); if (file.size > 5 * 1024 * 1024) return toast.error("Profile picture must be 5 MB or smaller"); setPhoto(file); setPreview(URL.createObjectURL(file)); };
  const save = async (event) => { event.preventDefault(); try { setSaving(true); const body = new FormData(); Object.entries(form).forEach(([key, value]) => body.append(key, value)); if (photo) body.append("image", photo); const { data } = await axios.put("/api/auth/admin/profile", body); if (!data.success) throw new Error(data.message); setProfile(data.admin); setPhoto(null); setPreview(""); toast.success(data.message); } catch (requestError) { toast.error(requestError.response?.data?.message || requestError.message || "Unable to update profile"); } finally { setSaving(false); } };
  const initials = (form.name || "Administrator").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  if (error) return <Card><ErrorState onRetry={load}/></Card>;
  if (loading) return <div className="space-y-6"><div className="h-20 animate-pulse rounded-2xl bg-slate-200"/><div className="h-96 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200"/></div>;
  return <form onSubmit={save} className="mx-auto max-w-5xl space-y-6">
    <PageIntro eyebrow="Account settings" description="Keep the administrator identity, profile picture, and business contact information current."/>
    <Card className="overflow-hidden"><div className="h-36 bg-gradient-to-r from-slate-950 via-slate-800 to-orange-700"/><div className="px-6 pb-7 sm:px-8"><div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="group relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-3xl border-4 border-white bg-orange-500 text-white shadow-lg focus-within:ring-4 focus-within:ring-orange-200"><span className="grid size-full place-items-center text-2xl font-black">{preview || admin?.image ? <img src={preview || admin.image} alt="Admin profile" className="size-full object-cover"/> : initials}</span><span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/75 py-1.5 text-xs font-semibold opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"><Camera size={14}/>Change</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={choosePhoto} className="sr-only"/></label>
      <div className="pb-1"><h2 className="text-2xl font-bold text-slate-900">{form.name || "Administrator"}</h2><p className="text-sm text-slate-500">{form.title || "Restaurant Administrator"}</p><p className="mt-1 text-xs text-slate-400">Click the picture to upload · Maximum 5 MB</p></div><span className="ml-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"><ShieldCheck size={15}/>Authenticated admin</span>
    </div></div></Card>
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]"><FormSection title="Basic information" description="This information appears in the dashboard header and account menu."><div className="grid gap-5 sm:grid-cols-2">
      <Field label="Display name" required><span className="relative block"><UserRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={form.name} maxLength={80} onChange={(e) => setForm({...form,name:e.target.value})} required className={`${inputClass} pl-11`}/></span></Field>
      <Field label="Business title" required><span className="relative block"><BriefcaseBusiness size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={form.title} maxLength={80} onChange={(e) => setForm({...form,title:e.target.value})} required className={`${inputClass} pl-11`}/></span></Field>
      <Field label="Phone number"><span className="relative block"><Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input type="tel" value={form.phone} maxLength={30} onChange={(e) => setForm({...form,phone:e.target.value})} className={`${inputClass} pl-11`}/></span></Field>
      <Field label="Login email" hint="Managed through ADMIN_EMAIL."><span className="relative block"><Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/><input value={admin?.email || ""} disabled className={`${inputClass} pl-11`}/></span></Field>
    </div></FormSection><Card className="p-5"><h2 className="font-bold">Account access</h2><p className="mt-2 text-sm leading-6 text-slate-500">Profile changes do not modify authentication credentials.</p><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Role</dt><dd className="font-semibold">Administrator</dd></div><div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-semibold text-emerald-600">Active</dd></div></dl></Card></div>
    <div className="flex justify-end"><button disabled={saving} className="inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">{saving && <LoaderCircle size={18} className="animate-spin"/>}{saving ? "Saving changes" : "Save changes"}</button></div>
  </form>;
};
export default AdminProfile;
