import Cart from "../models/cartModel.js";
import Menu from "../models/menuModel.js";
export const addToCart = async (req, res) => {
  try {
    const { menuId, quantity } = req.body;
    const { id } = req.user;
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 99) {
      return res.status(400).json({ message: "Quantity must be an integer between 1 and 99", success: false });
    }
    const menuItem = await Menu.findById(menuId);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });
    if (!menuItem.isAvailable) return res.status(400).json({ message: "This item is unavailable", success: false });

    let cart = await Cart.findOne({ user: id });
    if (!cart) {
      cart = new Cart({ user: id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.menuItem.toString() === menuId
    );

    if (existingItem) {
      existingItem.quantity = Math.min(99, existingItem.quantity + parsedQuantity);
    } else {
      cart.items.push({ menuItem: menuId, quantity: parsedQuantity });
    }

    await cart.save();
    res
      .status(200)
      .json({ message: "Item added to cart", success: true, cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const { id } = req.user;
    const cart = await Cart.findOne({ user: id }).populate("items.menuItem");
    if (!cart) return res.status(200).json({ cart: { items: [] }, success: true });
    res.status(200).json({ cart, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.user;
    const { menuId } = req.params;

    const cart = await Cart.findOne({ user: id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(
      (item) => item.menuItem.toString() !== menuId
    );
    await cart.save();
    res.status(200).json({ message: "Item removed from cart", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateCartQuantity = async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return res.status(400).json({ success: false, message: "Quantity must be between 1 and 99" });
  }
  const cart = await Cart.findOne({ user: req.user.id });
  const item = cart?.items.find((entry) => entry.menuItem.toString() === req.params.menuId);
  if (!item) return res.status(404).json({ success: false, message: "Cart item not found" });
  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, message: "Cart updated" });
};
