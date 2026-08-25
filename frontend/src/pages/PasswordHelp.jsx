import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AppContext } from "../context/AppContext";
import PasswordInput from "../components/PasswordInput";

export const ForgotPassword = () => {
  const { axios } = useContext(AppContext); const [email, setEmail] = useState("");
  const submit = async (e) => { e.preventDefault(); const { data } = await axios.post("/api/auth/forgot-password", { email }); toast[data.success ? "success" : "error"](data.message); };
  return <form onSubmit={submit} className="max-w-md mx-auto my-16 p-6 shadow rounded space-y-4"><h1 className="text-2xl font-bold">Reset password</h1><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded" placeholder="Email"/><button className="bg-orange-500 text-white px-5 py-3 rounded">Send reset link</button></form>;
};

export const ResetPassword = () => {
  const { token } = useParams(); const { axios, navigate } = useContext(AppContext); const [password, setPassword] = useState("");
  const submit = async (e) => { e.preventDefault(); try { const { data } = await axios.post(`/api/auth/reset-password/${token}`, { password }); toast[data.success ? "success" : "error"](data.message); if (data.success) navigate("/login"); } catch (error) { toast.error(error.response?.data?.message || "Reset failed"); } };
  return <form onSubmit={submit} className="max-w-md mx-auto my-16 p-6 shadow rounded space-y-4"><h1 className="text-2xl font-bold">Choose a new password</h1><PasswordInput minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded" placeholder="New password" autoComplete="new-password"/><button className="bg-orange-500 text-white px-5 py-3 rounded">Reset password</button></form>;
};

export const VerifyEmail = () => {
  const { token } = useParams(); const { axios } = useContext(AppContext); const [message, setMessage] = useState("Verifying…");
  useEffect(() => { axios.get(`/api/auth/verify-email/${token}`).then(({ data }) => setMessage(data.message)).catch((error) => setMessage(error.response?.data?.message || "Verification failed")); }, [axios, token]);
  return <div className="min-h-[50vh] grid place-items-center text-xl">{message}</div>;
};
