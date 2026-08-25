import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "sonner";

const Checkout = () => {
  const { totalPrice, axios, navigate, fetchCartData, cart } = useContext(AppContext);
  const [address, setAddress] = useState("");

  const handleCheckout = async () => {
    if (!address) {
      toast.error("Please enter your address");
      return;
    }
    try {
      const { data } = await axios.post("/api/order/place", { address });
      if (data.success) {
        toast.success(data.message);
        await fetchCartData();
        navigate(`/receipt/order/${data.order._id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };
  return (
    <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white shadow-lg rounded-2xl">
      {/* LEFT SIDE - Address */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Delivery Address
        </h2>
        <textarea
          rows={5}
          value={address}
          placeholder="enter your full address"
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
        ></textarea>
      </div>

      {/* RIGHT SIDE - Order Summary */}
      <div className="flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Order Summary
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="flex justify-between text-lg font-medium text-gray-700">
              <span>Total Amount:</span>
              <span className="text-green-600 font-semibold">
                ₦{Number(totalPrice).toLocaleString()}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4"><h3 className="font-semibold text-orange-900">Pay at Restaurant</h3><p className="mt-1 text-sm text-orange-800">No online payment is required. After confirming, you will receive a receipt and QR code to present at the restaurant.</p></div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={!cart?.items?.length}
          className="mt-6 rounded-xl bg-orange-500 py-3 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};
export default Checkout;
