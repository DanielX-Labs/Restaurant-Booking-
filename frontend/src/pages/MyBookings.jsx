import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const formatBookingTime = (time) => {
  if (!time) return "—";
  const [hours, minutes = "00"] = time.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return time;
  return new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", hour12: true })
    .format(new Date(2000, 0, 1, hours, minutes));
};

const MyBookings = () => {
  const { axios } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get("/api/booking/my-bookings");
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchBookings();
    // The shared axios instance is stable for the lifetime of the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cancelBooking = async (bookingId) => {
    const { data } = await axios.put(`/api/booking/cancel/${bookingId}`);
    if (data.success) {
      toast.success(data.message);
      fetchBookings();
    } else toast.error(data.message);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">My Bookings</h2>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white shadow-md rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {booking.name}
              </h3>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  booking.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : booking.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
              <p>
                <span className="font-medium">Phone:</span> {booking.phone}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(booking.date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Time:</span> {formatBookingTime(booking.time)}
              </p>
              <p>
                <span className="font-medium">Guests:</span>{" "}
                {booking.numberOfPeople}
              </p>
              <p><span className="font-medium">Payment:</span> Pay at Restaurant</p>
              <p><span className="font-medium">Payment status:</span> <span className={booking.paymentStatus === "Paid" ? "text-green-600" : "text-amber-600"}>{booking.paymentStatus}</span></p>
              <p className="break-all"><span className="font-medium">Payment reference:</span> {booking.paymentReference}</p>
              {booking.note && (
                <div className="mt-3 text-gray-700">
                  <span className="font-medium">Note:</span> {booking.note}
                </div>
              )}
              <div className="mt-3 text-gray-500 text-sm">
                Booked on:
                {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              {booking.status !== "Cancelled" && (
                <button onClick={() => cancelBooking(booking._id)} className="mt-3 text-red-600 hover:underline">
                  Cancel booking
                </button>
              )}
              <div className="sm:col-span-2 flex flex-wrap gap-3"><Link to={`/receipt/booking/${booking._id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">View Receipt</Link><Link to={`/receipt/booking/${booking._id}?print=1`} className="rounded-lg border px-3 py-2 text-sm font-semibold">Download Receipt</Link><Link to={`/receipt/booking/${booking._id}#qr`} className="rounded-lg border px-3 py-2 text-sm font-semibold">View QR Code</Link></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MyBookings;
