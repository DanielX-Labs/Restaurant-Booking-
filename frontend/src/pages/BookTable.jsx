import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
const BookTable = () => {
  const { axios, navigate, user, requestAuth } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfPeople: "",
    date: "",
    time: "",
    note: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => { if (!user) requestAuth({ title: "Sign in to book a table", description: "Please sign in to your account to reserve a table." }); }, [requestAuth, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { requestAuth({ title: "Sign in to book a table", description: "Please sign in to your account to reserve a table." }); return; }
    try {
      const { data } = await axios.post("/api/booking/create", formData);
      if (data.success) {
        toast.success(data.message);
        navigate(`/receipt/booking/${data.booking._id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) return requestAuth({ title: "Sign in to book a table", description: "Your session has expired. Please sign in again to reserve a table." });
      toast.error(error.response?.data?.message || "Unable to create your reservation");
    }
  };
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Book a Table</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="You Name"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
          <input
            type="number"
            name="numberOfPeople"
            value={formData.numberOfPeople}
            onChange={handleChange}
            placeholder="Number of Guests"
            min="1"
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Special Requests (optional)"
          rows="3"
          className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
        ></textarea>

        <button
          type="submit"
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
};
export default BookTable;
