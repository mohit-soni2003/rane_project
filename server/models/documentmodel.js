const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  docType: {
    type: String,
    required: true,
    enum: [
      'LOA',
      'SalesOrder',
      'PurchaseOrder',
      'PayIn',
      'PayOut',
      'Estimate',
      'DeliveryChallan',
      'Expense',
      'BankReference',
      'Other'
    ]
  },
  documentCode: { type: String, required: true },//LOA No , POA No 

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  dateOfIssue: { type: Date, required: true },
  uploadDate: { type: Date, default: Date.now },

  documentLink: { type: String, required: true },

  remark: { type: String },

  status: {
    type: String,
    enum: ['accepted', 'rejected', 'pending'],
    default: 'pending'
  },
  statusUpdatedAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
