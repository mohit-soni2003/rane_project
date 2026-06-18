const sorRepository = require("../repositories/sor.repository");

// ─── get all latest SOR items grouped by schedule ───────────────────────────
// used by: client, staff, admin (default view)
const getSorGrouped = async () => {
  const grouped = await sorRepository.getLatestItemsGrouped();
  return grouped;
};

// ─── get full history of all items (admin only) ──────────────────────────────
const getAllHistory = async () => {
  return await sorRepository.getAllItemsHistory();
};

// ─── get version history of one specific item (admin only) ──────────────────
const getItemHistory = async (item_number) => {
  const history = await sorRepository.getItemHistory(item_number);

  if (!history || history.length === 0) {
    throw new Error(`No item found with item_number: ${item_number}`);
  }

  return history;
};

// ─── add a new SOR item (admin only) ────────────────────────────────────────
const addItem = async (itemData, adminId) => {
  // check if item_number already exists
  const existing = await sorRepository.getLatestItem(itemData.item_number);
  if (existing) {
    throw new Error(
      `Item number ${itemData.item_number} already exists. Use update instead.`
    );
  }

  const newItem = await sorRepository.createItem({
    ...itemData,
    version: 1,
    is_latest: true,
    updated_by: adminId,
    updated_at: new Date(),
  });

  return newItem;
};

// ─── update an existing SOR item — creates a new version (admin only) ────────
const updateItem = async (item_number, updateData, adminId) => {
  // check item exists
  const current = await sorRepository.getLatestItem(item_number);
  if (!current) {
    throw new Error(`Item number ${item_number} not found.`);
  }

  // step 1: archive the current version
  await sorRepository.archiveItem(item_number);

  // step 2: insert new version with incremented version number
  const updatedItem = await sorRepository.createItem({
    item_number,
    schedule: updateData.schedule ?? current.schedule,
    description: updateData.description ?? current.description,
    unit: updateData.unit ?? current.unit,
    rate_low: updateData.rate_low ?? current.rate_low,
    rate_high: updateData.rate_high !== undefined ? updateData.rate_high : current.rate_high,
    version: current.version + 1,
    is_latest: true,
    updated_by: adminId,
    updated_at: new Date(),
  });

  return updatedItem;
};

// ─── delete latest version of an item (admin only) ──────────────────────────
// history is preserved — only the latest doc is removed
const deleteItem = async (item_number) => {
  const existing = await sorRepository.getLatestItem(item_number);
  if (!existing) {
    throw new Error(`Item number ${item_number} not found.`);
  }

  await sorRepository.deleteLatestItem(item_number);

  // if a previous version exists, restore it as latest
  const history = await sorRepository.getItemHistory(item_number);
  if (history.length > 0) {
    await sorRepository.archiveItem(item_number); // safety — ensure none marked latest
    await sorRepository.createItem({
      ...history[0],
      _id: undefined,
      is_latest: true,
    });
  }

  return { message: `Item ${item_number} deleted successfully.` };
};

module.exports = {
  getSorGrouped,
  getAllHistory,
  getItemHistory,
  addItem,
  updateItem,
  deleteItem,
};