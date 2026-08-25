import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LockIcon, MailIcon, User2Icon } from "lucide-react";
import { toast } from "sonner";
import { AppContext } from "../context/AppContext";
import PasswordInput from "../components/PasswordInput";
const Signup = () => {
  const { navigate, axios, loading, setLoading } = useContext(AppContext);
  // state for input value
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // handle change input value
  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/register", formData);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100svh-76px)] overflow-hidden bg-slate-950 px-4 py-16 flex items-center justify-center before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,.22),transparent_40%)]">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-white p-8 text-center shadow-2xl sm:p-10"
      >
        <h1 className="text-zinc-900 dark:text-white text-3xl mt-10 font-medium">
          Register
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 pb-6">
          Please sign up to continue
        </p>

        <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
          {/* User Icon */}
          <User2Icon className="text-orange-500" />
          <input
            type="text"
            placeholder="Name"
            className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full"
            name="name"
            value={formData.name}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
          {/* Mail Icon */}
          <MailIcon className="text-orange-500" />
          <input
            type="email"
            placeholder="Email id"
            className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full"
            name="email"
            value={formData.email}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="flex items-center mt-4 w-full bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
          {/* Lock Icon */}
          <LockIcon className="text-orange-500" />
          <PasswordInput
            placeholder="Password"
            wrapperClassName="h-full flex-1"
            className="h-full w-full bg-transparent text-sm text-zinc-600 outline-none placeholder:text-zinc-500"
            name="password"
            value={formData.password}
            onChange={onChangeHandler}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-orange-500 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 mb-11">
          Already have an account?
          <Link to={"/login"} className="text-indigo-500 dark:text-indigo-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
