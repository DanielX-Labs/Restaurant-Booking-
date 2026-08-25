import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const { axios } = useContext(AppContext);
  const [orders, setOrders] = useState([]);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/my-orders");
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchMyOrders();
    // The shared axios instance is stable for the lifetime of the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cancelOrder = async (orderId) => {
    const { data } = await axios.put(`/api/order/cancel/${orderId}`);
    if (data.success) {
      toast.success(data.message);
      fetchMyOrders();
    } else toast.error(data.message);
  };
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">You have no orders yet</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-md rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Order ID:
                  <span className="text-green-600">{order._id.slice(-6)}</span>
                </h3>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "Preparing"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-green-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  {" "}
                  <span className="font-medium">Address: </span>
                  {order.address}{" "}
                </p>
                <p>
                  <span className="font-medium">Payment:</span>{" "}
                  {order.paymentMethod}
                </p>
                <p><span className="font-medium">Payment status:</span> <span className={order.paymentStatus === "Paid" ? "text-green-600" : "text-amber-600"}>{order.paymentStatus}</span></p>
                <p className="break-all"><span className="font-medium">Payment reference:</span> {order.paymentReference}</p>
                <p>
                  <span className="font-medium">Total:</span> ₦{Number(order.totalAmount).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Items:</span>
                  {order.items.length} product(s)
                </p>
              </div>
              {order.status === "Pending" && (
                <button onClick={() => cancelOrder(order._id)} className="mt-3 text-red-600 hover:underline">Cancel order</button>
              )}
              <div className="mt-4 flex flex-wrap gap-3"><Link to={`/receipt/order/${order._id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">View Receipt</Link><Link to={`/receipt/order/${order._id}?print=1`} className="rounded-lg border px-3 py-2 text-sm font-semibold">Download Receipt</Link><Link to={`/receipt/order/${order._id}#qr`} className="rounded-lg border px-3 py-2 text-sm font-semibold">View QR Code</Link></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyOrders;
