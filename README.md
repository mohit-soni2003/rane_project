# Rane Project

Web application for **Rane & Sons**, developed with a client-server architecture.

## Tech Stack

- **Client:** JavaScript, HTML, CSS (likely React or similar framework)
- **Server:** JavaScript backend (Node.js/Express?)
- **Project Structure:** Separate `client/` and `server/` directories
- **Other:** Includes `Rane.png` used in README or application visuals

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Getting Started](#getting-started)  
- [Scripts](#scripts)  
- [Environment Variables](#environment-variables)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## Overview

`rane_project` is a full-stack application designed to serve the needs of **Rane & Sons**.  
It features distinct **client** and **server** modules, enabling separation of front-end and backend logic.

---

## Features

- Clean, component-based front-end (assumed React)
- RESTful API on the back-end
- Efficient, modular architecture with `client/` and `server/` directories
- Easily extensible and maintainable

---

## Getting Started

1. **Clone the repository:**
    ```bash
    git clone https://github.com/mohit-soni2003/rane_project.git
    cd rane_project
    ```

2. **Install dependencies:**

   - Client:
     ```bash
     cd client
     npm install
     ```
   - Server:
     ```bash
     cd ../server
     npm install
     ```

3. **Run locally:**

   - Start server:
     ```bash
     npm run dev
     ```
     (Or `npm start` if defined)

   - Start client:
     ```bash
     npm start
     ```

4. **Access the app:**
   Open `http://localhost:3000` (or the configured client port)

---

## Scripts

Assuming standard scripts are present, these commands are useful:

- **Client:**
  - `npm start` — launch frontend
  - `npm run build` — build production assets

- **Server:**
  - `npm run dev` — start server in dev mode (e.g. using nodemon)
  - `npm start` — launch production server
  - `npm test` — run backend tests (if any)

---

## Environment Variables

Create a `.env` file in the `server/` directory with contents like:


# Rane & Sons — Model Field Reference

A field-by-field summary of every Mongoose model in the backend, for quick lookup.

---

## Agreement (`agreementModel.js`)
Client-facing agreement/contract with e-signature and expiry-extension workflow.

| Field | Type | Notes |
|---|---|---|
| `agreementId` | String | Auto-generated readable ID (e.g. `AGR-xxxxx`); currently not used elsewhere |
| `title` | String, required | Agreement title |
| `description` | String | Optional description |
| `uploadedBy` | ObjectId → User, required | Staff/admin who uploaded it |
| `client` | ObjectId → User, required | Client the agreement is for |
| `fileUrl` | String, required | Link to the agreement file |
| `clientSignature.name` | String | Name typed at signing |
| `clientSignature.date` | Date | When signed |
| `clientSignature.ip` | String | IP address used to sign |
| `status` | enum, default `pending` | `pending / viewed / signed / rejected / expired` |
| `uploadedAt` | Date, default now | — |
| `viewedAt` | Date | Auto-stamped when status → `viewed` |
| `signedAt` | Date | Auto-stamped when status → `signed` |
| `expiryDate` | Date | — |
| `message` | String | — |
| `extensions[]` | Array | History of expiry extensions: `extendedBy`, `oldExpiryDate`, `newExpiryDate`, `reason`, `extendedAt` |
| `extensionRequest` | Object | Pending extension workflow: `requested`, `requestedBy`, `requestedAt`, `requestedExpiryDate`, `reason`, `status` (pending/approved/rejected), `reviewedBy`, `reviewedAt` |
| `createdAt` / `updatedAt` | Date | Auto (`timestamps: true`) |

---

## BaseSalary (`BaseSalaryModel.js`)
One fixed base-salary record per user.

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User, required, **unique** | One record per user |
| `amount` | Number, required | Base salary amount |
| `effectiveFrom` | Date, default now | — |
| `lastUpdated` | Date, default now | — |

---

## Bill (`billmodel.js`)
A submitted bill/invoice from a client, with payment and withdrawal tracking.

| Field | Type | Notes |
|---|---|---|
| `firmName` | String, required | Copied from user for redundancy |
| `workArea` | String, required | — |
| `loaNo` | String, required | Letter of Award number |
| `pdfurl` | String | Bill PDF link |
| `paymentStatus` | enum, default `Unpaid` | `Unpaid / Pending / Overdue / Paid / Sanctioned / Reject / Withdrawed` |
| `invoiceNo` | String | — |
| `amount` | String | Bill amount (stored as string) |
| `workDescription` | String | — |
| `paymentDate` | Date | — |
| `submittedAt` | Date, default now | — |
| `user` | ObjectId → User, required | Bill submitter |
| `paidby` | ObjectId → User | Admin who processed payment |
| `agreement` | ObjectId → Agreement | Linked agreement, if any |
| `withdrawStatus` | enum, default `None` | `None / Requested / Approved / Rejected` |
| `withdrawRequestedAt` | Date | — |
| `withdrawApprovedAt` | Date | — |
| `withdrawReason` | String | — |
| `remarks[]` | Array | `{ text, createdBy, createdAt }` — comment trail |

---

## Document (`documentmodel.js`)
An administrative document (LOA, PO, etc.) uploaded on behalf of a user.

| Field | Type | Notes |
|---|---|---|
| `docType` | enum, required | `LOA / SalesOrder / PurchaseOrder / PayIn / PayOut / Estimate / DeliveryChallan / Expense / BankReference / Other` |
| `documentCode` | String, required | e.g. LOA No., PO No. |
| `userId` | ObjectId → User, required | User the document is *for* |
| `uploadedBy` | ObjectId → User, required | Admin who uploaded it |
| `dateOfIssue` | Date, required | Entered manually by admin |
| `uploadDate` | Date, default now | — |
| `documentLink` | String, required | File URL |
| `remark` | String | Admin note |
| `status` | enum, default `pending` | `accepted / rejected / pending` |
| `statusUpdatedAt` | Date | When status last changed |
| `createdAt` / `updatedAt` | Date | Auto (`timestamps: true`) |

---

## FileForward (`fileForwardingModel.js`)
An internal document that gets forwarded between users with a full audit trail, category-specific sub-fields, and comments.

| Field | Type | Notes |
|---|---|---|
| `fileTitle` | String, required | — |
| `fileUrl` | String, required | — |
| `docType` | enum | `Proposal / Report / Quotation/Estimate / Contract / Invoices / Others` |
| `Department` | String | — |
| `invoiceSubFields.invoiceType` | enum | Only when `docType = Invoices`: `IR Invoice / Commercial Invoice / Return Invoice / Labour Invoice` |
| `contractSubFields.eAgreement` | enum | Only when `docType = Contract`: `Agreement Acceptance / Agreement Modification / Other` |
| `contractSubFields.generalContractAndLabour` | enum | `Labour / Goods and Supply` |
| `proposalSubFields.proposalType` | enum | Only when `docType = Proposal`: `New NS Item Proposal / Vetted NS Item Proposal / NS Under SORS / Previous NS Query` |
| `reportSubFields.employeeMeasurementBook` | enum | Only when `docType = Report`: `Recorded MB / Finalised MB / Pending MB` |
| `reportSubFields.employeeReport` | enum | `Document Report / Tender Report / Work Report / Other` |
| `uploadedBy` | ObjectId → User, required | — |
| `currentOwner` | ObjectId → User, required | Whoever currently holds the file |
| `description` | String, required | — |
| `status` | enum, default `pending` | `pending / in-review / approved / rejected` |
| `forwardingTrail[]` | Array | `{ forwardedBy, forwardedTo, note, action (forwarded/viewed/commented/approved/rejected), attachment, timestamp }` |
| `comments[]` | Array | `{ user, comment, timestamp }` |
| `createdAt` | Date, default now | — |

---

## Item (`item_model.js`)
A material/line-item under a project's Bill of Quantities.

| Field | Type | Notes |
|---|---|---|
| `project` | ObjectId → Project, required | Parent project |
| `itemNo` | String, required | — |
| `name` | String, required | — |
| `description` | String | — |
| `unit` | String | `Each / Meter / Set / Rmt / kg` (free text, not enforced by enum) |
| `railwayRate` | Number, default 0 | — |
| `ourRate` | Number, default 0 | — |
| `marketRate` | Number, default 0 | — |
| `quantity` | Number, default 0 | — |
| `installation` | Number, default 0 | — |
| `total` | Number, default 0 | Auto-calculated: `(ourRate × quantity) + installation` |
| `profitLossPercent` | Number, default 0 | Calculation logic not yet implemented |
| `createdBy` | ObjectId → User | — |
| `createdAt` / `updatedAt` | Date | Auto (`timestamps: true`) |

---

## MonthlySalary (`MonthlySalaryModel.js`)
One payroll record per user per month, with adjustments.

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User, required | — |
| `month` | String, required | Format `"YYYY-MM"` |
| `overtime[]` | Array | `{ date, amount, note }` |
| `advancePay[]` | Array | `{ date, amount, note }` |
| `leaveCuts[]` | Array | `{ date, amount, note }` — e.g. unpaid-leave deductions |
| `allowances.house/food/travel/medical/conveyance/special/dearness/other` | Number, default 0 each | — |
| `bonus` | Number, default 0 | — |
| `finalized` | Boolean, default false | Locks the record once payroll is run |
| `paidOn` | Date | — |
| `createdAt` | Date, default now | — |
| *Index* | — | Unique on `(user, month)` — one salary record per user per month |

---

## Notification (`notificationModel.js`)
In-app notification sent to a user.

| Field | Type | Notes |
|---|---|---|
| `title` | String, required | — |
| `message` | String, required | — |
| `type` | enum, required | `bill / payment / dfs / user / system / alert / agreement` |
| `priority` | enum, default `medium` | `low / medium / high / urgent` |
| `recipient` | ObjectId → User, required | Who receives it |
| `sender` | ObjectId → User, default null | Who triggered it, if applicable |
| `relatedId` | ObjectId, default null | ID of the related record (bill, payment, etc.) |
| `relatedModel` | enum, default null | `User / Bill / Payment / Document / FileForward / Notification / MonthlySalary / BaseSalary / Agreement` |
| `isRead` | Boolean, default false | — |
| `readAt` | Date, default null | — |
| `actionUrl` | String, default null | Where clicking the notification navigates to |
| `metadata` | Mixed, default `{}` | Free-form extra data |
| `createdAt` / `updatedAt` | Date | Auto (`timestamps: true`) |

---

## Payment (`paymentmodel.js`)
A payment/expense request raised by a user.

| Field | Type | Notes |
|---|---|---|
| `tender` | String | — |
| `amount` | String, required | Requested amount (stored as string) |
| `refMode` | String | — |
| `expenseNo` | String, default `"N/A"` | — |
| `description` | String | Entered by the requesting user |
| `remark` | String | — |
| `status` | String, default `"Pending"` | Free text, not an enum |
| `image` | String | Supporting image/receipt link |
| `submittedAt` | Date, default now | — |
| `user` | ObjectId → User, required | Requester |
| `paymentDate` | Date | Currently unused |
| `paymentType` | String | e.g. `IP` / `IPR` |
| `paymentMode` | String | e.g. `upi` / `bank_transfer` / `check` — how the user wants to be paid |

---

## PayNote (`paynoteModel.js`)
An internal payment sanction note tied to a bill.

| Field | Type | Notes |
|---|---|---|
| `payNoteNo` | String, required | — |
| `department` | enum, required | `Finance / Operations / Executives` |
| `bankName` | String | — |
| `bankAccountNo` | String | — |
| `ifscCode` | String | — |
| `invoiceNo` | String | — |
| `invoiceDate` | Date | — |
| `purpose` | String | — |
| `totalSanctionAmount` | Number | — |
| `modeOfPayment` | enum | `NEFT / RTGS / IMPS / UPI / IBFT / Cheque / Cash` |
| `pdfUrl` | String | — |
| `status` | enum, default `Draft` | `Draft / Pending / Approved / Rejected / Paid` |
| `createdAt` | Date, default now | — |
| `user` | ObjectId → User, required | Who created the pay note |
| `bill` | ObjectId → Bill | Associated bill, if any |

---

## Project (`projects_model.js`)
The central project record — tenders, financials, documents, approvals, and tasks.

| Field | Type | Notes |
|---|---|---|
| `projectId` | String, unique, required | Human-readable ID |
| `projectName` | String, required | — |
| `description` | String | — |
| `location.state/city/district/pincode/siteAddress` | String each | — |
| `documents[]` | Array (sub-schema) | `{ name, url, documentType (tender_document/loa/agreement/boq/drawings/nit), uploadedBy, uploadedAt }` |
| `projectType` | enum | `government / commercial / industrial / private / amc_work` |
| `tenderType` | enum | `open / limited / single / nomination` |
| `department` | enum | `indian_railway / municipal_corporation / central_government / state_government / smart_city / psu / defence / airport_authority / private_sector / others` |
| `contractType` | enum | `work / goods / supply` |
| `biddingType` | enum | `normal_tender / special_tender / limited_tender` |
| `expenditureType` | enum | `capital / revenue` |
| `rankingOrderForBid` | enum | `low_to_high / high_to_low` |
| `zone` | enum | Railway zone code (railway-only) |
| `subDepartment` | enum | Railway-only |
| `circle` | enum | `circle / zone / division` (railway-only) |
| `division` | String | Railway-only |
| `psuName` | enum | PSU-only: `ntpc / ongc / iocl / gail / bhel / sail / nhpc` |
| `financials.*` | Object | `pgAmount, actualPgAmount, tenderAmount, biddingPosition (below/above/at_par), biddingPercentage, actualBiddingAmount (auto-calc), pgMaturityDate, pgMaturityInterest, rateOfInterest, durationInDays, depositAccountNo, depositStartDate, penalty, penaltyTicketNo, recoveryAtContractEnd {billAmount, recoveryAmount, recoveryDesc, billNumber}` |
| `tasks[]` | [ObjectId → Task] | Tasks created under this project |
| `currentAuthority` | ObjectId → User | Who currently owns the approval |
| `nextAuthority` | ObjectId → User | Who it's being forwarded to |
| `status` | enum, default `draft` | `in_progress / draft / completed / not_allotted / L2 / L3 / pending` |
| `startDate` / `endDate` / `estimatedCompletionDate` | Date | — |
| `approvals[]` | Array (sub-schema) | `{ stage (ADMIN/CEO/CTO/CFO/COO/DIRECTOR/OTHER), actor, action (approved/returned/rejected/pending), remark, actedAt }` |
| `createdBy` | ObjectId → User, required | — |
| `createdAt` / `updatedAt` | Date | Auto (`timestamps: true`) |

---

## RecentActivity (`RecentActivityModel.js`)
An activity-feed / audit-log entry.

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User, required | Who performed the action |
| `actionType` | enum, default `other` | `login / logout / file_uploaded / file_forwarded / bill_submitted / payment_requested / payment_approved / salary_updated / document_uploaded / status_changed / system_action / other / agreement_signed / agreement_extension_requested / agreement_extension_approved / agreement_extension_rejected / withdraw_requested / withdraw_rejected / withdraw_approved` |
| `description` | String, required | Human-readable log line |
| `relatedModel` | enum, default null | `User / Bill / Payment / Document / FileForward / Notification / MonthlySalary / BaseSalary / Agreement / withdraw_requested` |
| `relatedId` | ObjectId, default null | — |
| `metadata` | Mixed, default `{}` | — |
| `actionUrl` | String, default null | — |
| `createdAt` | Date, default now | — |

---

## SorItem (`sorItem_model.js`)
Schedule-of-Rates catalog item (versioned reference pricing, not tied to a project).

| Field | Type | Notes |
|---|---|---|
| `item_number` | String, required | Supports formats like `"1"`, `"15.A"`, `"31.6"` |
| `schedule` | enum, required | `Fire Extinguishers / Fire Pipes / Sprinkler System / Fire Alarm System / Pumps & Accessories / Valves & Accessories / Hydrant System` |
| `description` | String, required | — |
| `unit` | String, required | `Each / Meter / Set / Rmt` |
| `rate_low` | Number, required | — |
| `rate_high` | Number, default null | `null` = fixed single rate; otherwise shown as a range |
| `version` | Number, default 1 | Increments per update |
| `is_latest` | Boolean, default true | Only one doc per `item_number` should be true at a time |
| `updated_by` | ObjectId → User, required | Must be an admin (enforced in route middleware, not the schema) |
| `updated_at` | Date, default now | — |
| `rate_display` | Virtual | Computed: `"₹100"` or `"₹100–120"` |
| `createdAt` / `updatedAt` | Date | Auto (`timestamps: true`) |

---

## Task (`task_model.js`)
A unit of work under a project, allotted to one or more users, each tracked individually.

| Field | Type | Notes |
|---|---|---|
| `project` | ObjectId → Project, required | Parent project |
| `relatedDocuments[]` | [ObjectId] | IDs referencing entries inside `project.documents[]` |
| `vertical` | enum | `COO / CFO / CEO` — optional team link |
| `title` | String, required | — |
| `description` | String | — |
| `priority` | enum, default `medium` | `low / medium / high / urgent` |
| `allottedTo[]` | Array (sub-schema), min 1 required | Per user: `{ user, status (pending/in_progress/submitted/completed/rejected), remark, images[] {name,url,uploadedAt}, submittedAt, completedAt (auto-stamped) }` |
| `allottedBy` | ObjectId → User, required | Who created/assigned the task |
| `startDate` | Date | — |
| `deadline` | Date, required | — |
| `status` | enum, default `pending` | Overall status: `pending / in_progress / submitted / completed / overdue / rejected` — set only by the authority, independent of each user's own status |
| `verifiedBy` | ObjectId → User | — |
| `verifiedAt` | Date | — |
| `completedAt` | Date | — |
| `statusHistory[]` | Array | `{ status, updatedBy, remark, updatedAt }` — audit trail of overall-status changes |
| `latestRemark` | String | Convenience mirror of the most recent remark, from any assignee or authority action |
| `createdAt` / `updatedAt` | Date | Auto (`timestamps: true`) |

---

## Transaction (`transaction.js`)
A record of an actual money movement (paying a bill, payment request, or salary).

| Field | Type | Notes |
|---|---|---|
| `billId` | ObjectId → Bill | — |
| `paymentId` | ObjectId → Payment | — |
| `userId` | ObjectId → User, required | Who the transaction is for |
| `paidBy` | ObjectId → User | Admin who processed it |
| `type` | enum | `bill / payment_request / salary` |
| `amount` | Number, required | — |
| `bankName` | String | — |
| `accNo` | String | — |
| `ifscCode` | String | — |
| `upiId` | String | — |
| `transactionDate` | Date, default now | — |

---

## User (`usermodel.js`)
The core account record for admins, staff, and clients.

| Field | Type | Notes |
|---|---|---|
| `name` | String, required | — |
| `email` | String, required, unique | — |
| `profile` | String | Base64 image, defaults to a placeholder avatar |
| `usertype` | String | Not used in v3.0 |
| `clientType` | String | Not used in v3.0 |
| `cid` | String, default `"N/A"` | Client ID |
| `phoneNo` | String | — |
| `address` | String | — |
| `firmName` | String | — |
| `gstno` | String | — |
| `idproof.aadhar.number/link` | String | + `lastUpdate` auto-stamped when either changes |
| `idproof.pan.number/link` | String | + `lastUpdate` auto-stamped when either changes |
| `idProofType` | String | Not used in v3.0 |
| `upi` | String | — |
| `bankName` | String | — |
| `ifscCode` | String | — |
| `accountNo` | String | — |
| `accountType` | enum, default `saving` | `saving / current` |
| `password` | String, required | Hashed password |
| `lastlogin` | Date, default now | — |
| `isverified` | Boolean, default false | — |
| `role` | String, default `"client"` | `client / admin / staff` (not enum-enforced) |
| `tag` | enum | `admin / ceo / cto / cfo / coo / director` |
| `resetPasswordToken` / `resetPasswordExpiresAt` | String / Date | Password-reset flow |
| `VerificationToken` / `VerificationTokenExpiresAt` | String / String | Email-verification flow |

