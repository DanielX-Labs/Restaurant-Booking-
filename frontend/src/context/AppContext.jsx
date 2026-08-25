import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// This module intentionally exports both the context and its provider.
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.defaults.withCredentials = true;
import { toast } from "sonner";
const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);

  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchCartData = async () => {
    try {
      const { data } = await axios.get("/api/cart/get");
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (cart?.items) {
      const total = cart.items.reduce(
        (sum, item) => sum + item.menuItem.price * item.quantity,
        0
      );
      setTotalPrice(total);
    }
  }, [cart]);
  const cartCount = cart?.items?.reduce(
    (acc, item) => acc + item.quantity,
    0
  ) || 0;
  // 🔹 Add to Cart function
  const addToCart = async (menuId) => {
    if (!user) {
      setAuthPrompt({ title: "Sign in to add items to your cart", description: "Please sign in or create an account to add menu items to your cart.", allowSignup: true });
      return;
    }
    try {
      const { data } = await axios.post("/api/cart/add", {
        menuId,
        quantity: 1,
      });
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
        sessionStorage.setItem("auth-return-to", `${window.location.pathname}${window.location.search}`);
        toast.error("Your session has expired. Please sign in again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Could not add this item to your cart");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/all");

      if (data.success) {
        setCategories(data.categories);
      } else {
        console.log("Failed to fetch categories");
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };
  const fetchMenus = async () => {
    try {
      const { data } = await axios.get("/api/menu/all");

      if (data.success) {
        setMenus(data.menuItems);
      } else {
        console.log("Failed to fetch menus");
      }
    } catch (error) {
      console.log("Error fetching menus:", error);
    }
  };

  const isAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth");
      if (data.success) {
        setUser(data.user);
        return true;
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  };

  const isAdminAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/admin/is-auth");
      if (data.success) setAdmin(data.admin);
    } catch {
      setAdmin(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenus();
    Promise.allSettled([isAuth().then((authenticated) => authenticated && fetchCartData()), isAdminAuth()])
      .finally(() => setAuthReady(true));
  }, []);
  const value = {
    navigate,
    loading,
    setLoading,
    user,
    setUser,
    axios,
    admin,
    authReady,
    authPrompt,
    requestAuth: setAuthPrompt,
    closeAuthPrompt: () => setAuthPrompt(null),
    setAdmin,
    categories,
    fetchCategories,
    menus,
    fetchMenus,
    addToCart,
    cartCount,
    cart,
    totalPrice,
    fetchCartData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
