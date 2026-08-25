import { useContext, useState } from "react";
import { toast } from "sonner";
import { AppContext } from "../context/AppContext";
import PasswordInput from "../components/PasswordInput";

const Profile = () => {
  const { axios, user, setUser } = useContext(AppContext);
  const [form, setForm] = useState({ name: user?.name || "", currentPassword: "", newPassword: "" });
  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.put("/api/auth/profile", form);
      if (data.success) { setUser(data.user); toast.success(data.message); setForm({ ...form, currentPassword: "", newPassword: "" }); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.response?.data?.message || "Update failed"); }
  };
  return <form onSubmit={submit} className="max-w-lg mx-auto my-12 p-6 bg-white shadow rounded-xl space-y-4">
    <h1 className="text-2xl font-bold">My profile</h1>
    <input className="w-full border rounded p-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
    <input className="w-full border rounded p-3 bg-gray-50" value={user?.email || ""} disabled />
    <h2 className="font-semibold">Change password (optional)</h2>
    <PasswordInput className="w-full border rounded p-3" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} placeholder="Current password" autoComplete="current-password" />
    <PasswordInput minLength={8} className="w-full border rounded p-3" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="New password" autoComplete="new-password" />
    <button className="bg-orange-500 text-white px-5 py-3 rounded">Save changes</button>
  </form>;
};
export default Profile;
