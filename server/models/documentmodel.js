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

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // user for whom document uploaded
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, //admin id who upload document

  dateOfIssue: { type: Date, required: true },  // enter manually by admin
  uploadDate: { type: Date, default: Date.now },

  documentLink: { type: String, required: true },

  remark: { type: String }, // enter by admin

  status: {
    type: String,
    enum: ['accepted', 'rejected', 'pending'],
    default: 'pending'
  },
  statusUpdatedAt: {   // when status changes
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
