import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import MenuDetails from "./pages/MenuDetails";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import BookTable from "./pages/BookTable";
import MyBookings from "./pages/MyBookings";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";
import Footer from "./components/Footer";
import AdminLayout from "./pages/admin/AdminLayout";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AddCategory from "./pages/admin/AddCategory";
import AddMenu from "./pages/admin/AddMenu";
import Categories from "./pages/admin/Categories";
import Menus from "./pages/admin/Menus";
import Orders from "./pages/admin/Orders";
import Bookings from "./pages/admin/Bookings";
import Dashboard from "./pages/admin/Dashboard";
import Profile from "./pages/Profile";
import { ForgotPassword, ResetPassword, VerifyEmail } from "./pages/PasswordHelp";
import AdminProfile from "./pages/admin/AdminProfile";
import PaymentReceipt from "./pages/PaymentReceipt";
import Payments from "./pages/admin/Payments";
import AuthPromptModal from "./components/AuthPromptModal";
import ScrollToTop from "./components/ScrollToTop";
const App = () => {
  const location = useLocation();
  const adminPath = location.pathname.includes("admin");
  const { admin, user, authReady, authPrompt, closeAuthPrompt, navigate } = useContext(AppContext);
  if (!authReady) return <div className="min-h-screen grid place-items-center">Loading…</div>;
  return (
    <div>
      <Toaster position="top-right" richColors closeButton expand={false} duration={4200} toastOptions={{ className: "sonner-toast" }} />
      <ScrollToTop />
      {!adminPath && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu-details/:id" element={<MenuDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/book-table" element={<BookTable />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/receipt/:type/:id" element={user ? <PaymentReceipt /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={user ? <Profile /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="*" element={<div className="min-h-[50vh] grid place-items-center text-3xl font-bold">Page not found</div>} />

        {/* admin routes  */}
        <Route path="/admin" element={admin ? <AdminLayout /> : <AdminLogin />}>
          <Route index element={admin ? <Dashboard /> : <AdminLogin />} />
          <Route
            path="add-category"
            element={admin ? <AddCategory /> : <AdminLogin />}
          />
          <Route
            path="add-menu"
            element={admin ? <AddMenu /> : <AdminLogin />}
          />
          <Route
            path="categories"
            element={admin ? <Categories /> : <AdminLogin />}
          />
          <Route path="menus" element={admin ? <Menus /> : <AdminLogin />} />
          <Route path="orders" element={admin ? <Orders /> : <AdminLogin />} />
          <Route
            path="bookings"
            element={admin ? <Bookings /> : <AdminLogin />}
          />
          <Route path="profile" element={admin ? <AdminProfile /> : <AdminLogin />} />
          <Route path="payments" element={admin ? <Payments /> : <AdminLogin />} />
        </Route>
      </Routes>
      {!adminPath && <Footer />}
      <AuthPromptModal prompt={authPrompt} onClose={closeAuthPrompt} onSignIn={() => { sessionStorage.setItem("auth-return-to", `${location.pathname}${location.search}`); closeAuthPrompt(); navigate("/login"); }} onCreateAccount={() => { sessionStorage.setItem("auth-return-to", `${location.pathname}${location.search}`); closeAuthPrompt(); navigate("/signup"); }} />
    </div>
  );
};
export default App;
