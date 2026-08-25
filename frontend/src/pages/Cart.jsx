import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { X } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const { cart, totalPrice, navigate, axios, fetchCartData } =
    useContext(AppContext);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-semibold text-gray-700">
          Your Cart is Empty
        </h2>
      </div>
    );
  }

  const removeFromCart = async (menuId) => {
    try {
      const { data } = await axios.delete(`/api/cart/remove/${menuId}`);
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updateQuantity = async (menuId, quantity) => {
    if (quantity < 1 || quantity > 99) return;
    const { data } = await axios.put(`/api/cart/quantity/${menuId}`, { quantity });
    if (data.success) fetchCartData();
    else toast.error(data.message);
  };

  return (
    <div className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Your Cart</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700">Item</th>
              <th className="py-3 px-4 text-left text-gray-700">Qty</th>
              <th className="py-3 px-4 text-left text-gray-700">Price</th>
              <th className="py-3 px-4 text-left text-gray-700">Total</th>
              <th className="py-3 px-4 text-left text-gray-700">Action</th>
            </tr>
          </thead>

          <tbody>
            {cart.items.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 flex items-center space-x-3">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <span className="font-medium text-gray-800">
                    {item.menuItem.name}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)} className="border rounded px-2">−</button>
                    {item.quantity}
                    <button aria-label="Increase quantity" onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)} className="border rounded px-2">+</button>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-gray-700">
                  ₦{Number(item.menuItem.price).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                  ₦{Number(item.menuItem.price * item.quantity).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                  <X onClick={() => removeFromCart(item.menuItem._id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6">
        <h3 className="text-xl font-semibold">
          Total: <span className="text-orange-600">₦{Number(totalPrice).toLocaleString()}</span>
        </h3>
        <button
          onClick={() => navigate("/checkout")}
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};
export default Cart;
