import Contact from "../models/contactModel.js";
import Subscriber from "../models/subscriberModel.js";

const validEmail = (value) => /^\S+@\S+\.\S+$/.test(value || "");

export const sendContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name?.trim() || !validEmail(email) || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: "Please provide all required contact fields" });
  }
  const contact = await Contact.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, message: "Your message has been received", id: contact.id });
};

export const subscribe = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ success: false, message: "Enter a valid email address" });
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  res.json({ success: true, message: "You are subscribed" });
};
