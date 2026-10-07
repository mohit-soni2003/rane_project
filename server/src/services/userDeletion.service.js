const User = require("../models/usermodel");
const Bill = require("../models/billmodel");
const Payment = require("../models/paymentmodel");
const Transaction = require("../models/transaction");
const PayNote = require("../models/paynoteModel");
const BaseSalary = require("../models/BaseSalaryModel");
const MonthlySalary = require("../models/MonthlySalaryModel");
const Document = require("../models/documentmodel");
const Agreement = require("../models/agreementModel");
const FileForward = require("../models/fileForwardingModel");
const Notification = require("../models/notificationModel");
const RecentActivity = require("../models/RecentActivityModel");
const ProjectPermission = require("../models/projectPermissionModel");
const Task = require("../models/task.model");
const Project = require("../models/projects.model");
const Item = require("../models/item.model");

// ─────────────────────────────────────────────────────────────────────────────
// deleteUserCascade(userId)
//
// Removes a user and everything that belongs to them:
//   • their bills, payment requests, agreements, paynotes, salary records,
//     documents, DFS files and transactions
//   • everything generated from those records (notifications, recent activity,
//     transactions and paynotes of their bills, transactions of their payments…)
//   • their notifications (sent or received), activity and project permissions
//
// Records that belong to OTHER people but merely mention this user are kept, and the
// mention is removed where the schema allows it (e.g. "paid by", "assigned to",
// "granted by"). History fields that are required by the schema (who created a
// project/task, who uploaded a document for someone else, approval history) are left
// as they are so other users' records are not damaged.
//
// The user document itself is deleted last, so if a step fails the user still exists
// and the delete can simply be retried (every step is safe to repeat).
// Returns a summary of how much was removed / detached.
// ─────────────────────────────────────────────────────────────────────────────
async function deleteUserCascade(userId) {
  const summary = { deleted: {}, detached: {} };
  const addDeleted = (key, res) => { summary.deleted[key] = (summary.deleted[key] || 0) + (res?.deletedCount || 0); };
  const addDetached = (key, res) => { summary.detached[key] = (summary.detached[key] || 0) + (res?.modifiedCount || 0); };

  // ── 1. Find the records the user owns ──
  const [bills, payments, agreements, files, monthlySalaries, baseSalaries] = await Promise.all([
    Bill.find({ user: userId }).select("_id").lean(),
    Payment.find({ user: userId }).select("_id").lean(),
    Agreement.find({ client: userId }).select("_id").lean(),
    FileForward.find({ $or: [{ uploadedBy: userId }, { currentOwner: userId }] }).select("_id").lean(),
    MonthlySalary.find({ user: userId }).select("_id").lean(),
    BaseSalary.find({ user: userId }).select("_id").lean(),
  ]);
  const ids = (list) => list.map((d) => d._id);
  const billIds = ids(bills);
  const paymentIds = ids(payments);
  const agreementIds = ids(agreements);
  const fileIds = ids(files);
  const monthlyIds = ids(monthlySalaries);
  const baseIds = ids(baseSalaries);

  // ── 2. Notifications & recent activity linked to any of those records ──
  const linked = [
    { relatedModel: "Bill", relatedId: { $in: billIds } },
    { relatedModel: "Payment", relatedId: { $in: paymentIds } },
    { relatedModel: "Agreement", relatedId: { $in: agreementIds } },
    { relatedModel: "FileForward", relatedId: { $in: fileIds } },
    { relatedModel: "MonthlySalary", relatedId: { $in: monthlyIds } },
    { relatedModel: "BaseSalary", relatedId: { $in: baseIds } },
    { relatedModel: "User", relatedId: userId },
  ];
  addDeleted("notifications", await Notification.deleteMany({
    $or: [...linked, { recipient: userId }, { sender: userId }],
  }));
  addDeleted("recentActivities", await RecentActivity.deleteMany({
    $or: [...linked, { user: userId }],
  }));

  // ── 3. Money records ──
  addDeleted("transactions", await Transaction.deleteMany({
    $or: [{ userId }, { billId: { $in: billIds } }, { paymentId: { $in: paymentIds } }],
  }));
  addDeleted("payNotes", await PayNote.deleteMany({
    $or: [{ user: userId }, { bill: { $in: billIds } }],
  }));
  addDeleted("monthlySalaries", await MonthlySalary.deleteMany({ user: userId }));
  addDeleted("baseSalaries", await BaseSalary.deleteMany({ user: userId }));

  // ── 4. The user's own bills, payment requests, agreements, documents and DFS files ──
  addDeleted("bills", await Bill.deleteMany({ user: userId }));
  addDeleted("payments", await Payment.deleteMany({ user: userId }));
  // bills of other users should never point at an agreement that no longer exists
  if (agreementIds.length) {
    addDetached("billsUnlinkedFromAgreements",
      await Bill.updateMany({ agreement: { $in: agreementIds } }, { $unset: { agreement: "" } }));
  }
  addDeleted("agreements", await Agreement.deleteMany({ client: userId }));
  addDeleted("documents", await Document.deleteMany({ userId }));
  addDeleted("dfsFiles", await FileForward.deleteMany({ _id: { $in: fileIds } }));

  // ── 5. Access rights ──
  addDeleted("projectPermissions", await ProjectPermission.deleteMany({ user: userId }));

  // ── 6. Take the user out of other people's records (where the schema allows) ──
  addDetached("projectPermissions(grantedBy)",
    await ProjectPermission.updateMany({ grantedBy: userId }, { $unset: { grantedBy: "" } }));
  addDetached("billsPaidBy", await Bill.updateMany({ paidby: userId }, { $unset: { paidby: "" } }));
  addDetached("billRemarks", await Bill.updateMany(
    { "remarks.createdBy": userId },
    { $unset: { "remarks.$[r].createdBy": "" } },
    { arrayFilters: [{ "r.createdBy": userId }] }
  ));
  addDetached("transactionsPaidBy", await Transaction.updateMany({ paidBy: userId }, { $unset: { paidBy: "" } }));
  addDetached("tasksUnassigned", await Task.updateMany(
    { "allottedTo.user": userId },
    { $pull: { allottedTo: { user: userId } } }
  ));
  addDetached("tasksVerifiedBy", await Task.updateMany({ verifiedBy: userId }, { $unset: { verifiedBy: "" } }));
  addDetached("projectsCurrentAuthority",
    await Project.updateMany({ currentAuthority: userId }, { $unset: { currentAuthority: "" } }));
  addDetached("projectsNextAuthority",
    await Project.updateMany({ nextAuthority: userId }, { $unset: { nextAuthority: "" } }));
  addDetached("itemsCreatedBy", await Item.updateMany({ createdBy: userId }, { $unset: { createdBy: "" } }));

  // ── 7. Finally the user ──
  const removed = await User.findByIdAndDelete(userId);
  summary.deleted.user = removed ? 1 : 0;

  return summary;
}

module.exports = { deleteUserCascade };
