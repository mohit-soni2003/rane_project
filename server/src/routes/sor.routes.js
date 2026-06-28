const express = require("express");
const router = express.Router();

const sorService = require("../services/Sor.service");
const verifyToken = require("../middleware/verifyToken");
const verifyRole = require("../middleware/verifyRole");

// ─── role shorthands for this module ─────────────────────────────────────────
const allUsers  = verifyRole("admin", "staff", "client");
const adminOnly = verifyRole("admin");

// ─────────────────────────────────────────────────────────────────────────────
// ALL LOGGED-IN USERS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/sor
// Returns all latest SOR items grouped by schedule
// Access: admin, staff, client
router.get("/", verifyToken, allUsers, async (req, res) => {
  try {
    const data = await sorService.getSorGrouped();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ONLY
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/sor/history
// Returns all items with all versions
// Access: admin only
router.get("/history", verifyToken, adminOnly, async (req, res) => {
  try {
    const data = await sorService.getAllHistory();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/sor/history/:item_number
// Returns full version history of one specific item
// Access: admin only
router.get("/history/:item_number", verifyToken, adminOnly, async (req, res) => {
  try {
    const { item_number } = req.params;
    const data = await sorService.getItemHistory(item_number);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/sor
// Add a brand new SOR item
// Access: admin only
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { item_number, schedule, description, unit, rate_low, rate_high } = req.body;

    if (!item_number || !schedule || !description || !unit || rate_low === undefined) {
      return res.status(400).json({
        success: false,
        message: "item_number, schedule, description, unit and rate_low are required.",
      });
    }

    const newItem = await sorService.addItem(
      { item_number, schedule, description, unit, rate_low, rate_high: rate_high ?? null },
      req.userId  // from verifyToken
    );

    return res.status(201).json({
      success: true,
      message: "SOR item added successfully.",
      data: newItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT /api/sor/:item_number
// Update an existing item — archives old version, creates new version
// Access: admin only
router.put("/:item_number", verifyToken, adminOnly, async (req, res) => {
  try {
    const { item_number } = req.params;
    const updateData = req.body;

    const updatedItem = await sorService.updateItem(item_number, updateData, req.userId);

    return res.status(200).json({
      success: true,
      message: `Item ${item_number} updated. New version created.`,
      data: updatedItem,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /api/sor/:item_number
// Deletes latest version. History is preserved.
// Access: admin only
router.delete("/:item_number", verifyToken, adminOnly, async (req, res) => {
  try {
    const { item_number } = req.params;
    const result = await sorService.deleteItem(item_number);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;