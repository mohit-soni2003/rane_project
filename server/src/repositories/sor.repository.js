const SorItem = require("../models/sorItem.model");

// ─── helper: sort items by item_number numerically ─────────────────────────
const sortByItemNumber = (items) => {
  return items.sort((a, b) => parseFloat(a.item_number) - parseFloat(b.item_number));
};

// ─── get all latest items (for client / staff / admin default view) ─────────
const getAllLatestItems = async () => {
  const items = await SorItem.find({ is_latest: true })
    .populate("updated_by", "name email")
    .lean();
  return sortByItemNumber(items);
};

// ─── get latest items grouped by schedule ───────────────────────────────────
const getLatestItemsGrouped = async () => {
  const items = await getAllLatestItems();

  // group items by their schedule name
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.schedule]) acc[item.schedule] = [];
    acc[item.schedule].push(item);
    return acc;
  }, {});

  return grouped;
};

// ─── get full version history of one item ───────────────────────────────────
const getItemHistory = async (item_number) => {
  return await SorItem.find({ item_number })
    .populate("updated_by", "name email")
    .sort({ version: -1 }) // newest first
    .lean();
};

// ─── get all items history (admin view) ─────────────────────────────────────
const getAllItemsHistory = async () => {
  return await SorItem.find()
    .populate("updated_by", "name email")
    .sort({ item_number: 1, version: -1 })
    .lean();
};

// ─── get single latest item by item_number ───────────────────────────────────
const getLatestItem = async (item_number) => {
  return await SorItem.findOne({ item_number, is_latest: true }).lean();
};

// ─── create a brand new item (first time) ───────────────────────────────────
const createItem = async (data) => {
  const item = new SorItem(data);
  return await item.save();
};

// ─── archive current version before updating ────────────────────────────────
const archiveItem = async (item_number) => {
  return await SorItem.findOneAndUpdate(
    { item_number, is_latest: true },
    { is_latest: false },
    { new: true }
  );
};

// ─── delete latest item (keeps history intact) ──────────────────────────────
const deleteLatestItem = async (item_number) => {
  return await SorItem.findOneAndDelete({ item_number, is_latest: true });
};

module.exports = {
  getAllLatestItems,
  getLatestItemsGrouped,
  getItemHistory,
  getAllItemsHistory,
  getLatestItem,
  createItem,
  archiveItem,
  deleteLatestItem,
};