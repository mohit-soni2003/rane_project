import { backend_url } from "../store/keyStore";

/* =====================================================================
   CLIENT DASHBOARD SERVICES
   ===================================================================== */

export const getClientOverview = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/client/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // because using verifyToken
    });

    if (!response.ok) {
      throw new Error("Failed to fetch client overview");
    }

    const data = await response.json();
    console.log(data)
    return data; // { success, data: { billcnt, paidBillCnt, prcnt, paidPrCnt, signedAgreement, agreementcnt } }

  } catch (error) {
    console.error("Error fetching client overview:", error);
    return null;
  }
};


export const getClientBillOverview = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/client/bill-overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // required because verifyToken uses cookies
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bill overview");
    }

    const data = await response.json();
    return data; // { success, data: {...} }

  } catch (error) {
    console.error("Error fetching bill overview:", error);
    return null;
  }
};


/* =====================================================================
   ADMIN DASHBOARD SERVICES
   ===================================================================== */

// KPI strip — projects, pending approvals, outstanding bills, payouts, overdue tasks
export const getAdminOverview = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // because using verifyToken
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin overview");
    }

    const data = await response.json();
    return data; // { success, data: { totalProjects, activeProjects, pendingApprovalsTotal, pendingApprovals, outstandingBillAmount, outstandingBillCount, payoutsThisMonth, overdueTasks, totalTasks } }

  } catch (error) {
    console.error("Error fetching admin overview:", error);
    return null;
  }
};


// Bill status breakdown (all bills, admin-wide)
export const getAdminBillOverview = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/bill-overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin bill overview");
    }

    const data = await response.json();
    return data; // { success, data: { totalBills, counts: {...}, amounts: {...} } }

  } catch (error) {
    console.error("Error fetching admin bill overview:", error);
    return null;
  }
};


// Payment request status breakdown (counts + amounts)
export const getAdminPaymentOverview = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/payment-overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin payment overview");
    }

    const data = await response.json();
    return data; // { success, data: { totalPayments, totalAmount, counts, amounts, breakdown: [{status,count,amount}] } }

  } catch (error) {
    console.error("Error fetching admin payment overview:", error);
    return null;
  }
};


// Top-tile system counts (users, bills, payments, projects, tasks, DFS, agreements, SOR items, documents)
export const getAdminSystemCounts = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/system-counts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin system counts");
    }

    const data = await response.json();
    return data; // { success, data: { clientStaffCount, totalBills, totalPayments, totalProjects, totalTasks, totalDfs, totalAgreements, totalSorItems, totalDocuments } }

  } catch (error) {
    console.error("Error fetching admin system counts:", error);
    return null;
  }
};


// Task status breakdown (bar chart)
export const getAdminTaskStatus = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/task-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin task status");
    }

    const data = await response.json();
    return data; // { success, data: [{ status, count }, ...] }

  } catch (error) {
    console.error("Error fetching admin task status:", error);
    return null;
  }
};


// DFS (FileForward) status breakdown
export const getAdminDfsStatus = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/dfs-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin DFS status");
    }

    const data = await response.json();
    return data; // { success, data: [{ status, count }, ...] }

  } catch (error) {
    console.error("Error fetching admin DFS status:", error);
    return null;
  }
};


// Document status breakdown
export const getAdminDocumentStatus = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/document-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin document status");
    }

    const data = await response.json();
    return data; // { success, data: [{ status, count }, ...] }

  } catch (error) {
    console.error("Error fetching admin document status:", error);
    return null;
  }
};


// Notifications for the logged-in admin
export const getAdminNotifications = async (limit = 10) => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/notifications?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin notifications");
    }

    const data = await response.json();
    return data; // { success, data: { unreadCount, notifications: [{ id, title, message, type, priority, isRead, actionUrl, createdAt }, ...] } }

  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return null;
  }
};
// Cash flow trend — Transaction totals grouped by month + type
export const getAdminCashFlow = async (months = 6) => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/cash-flow?months=${months}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin cash flow");
    }

    const data = await response.json();
    return data; // { success, data: [{ month, bill, payment_request, salary }, ...] }

  } catch (error) {
    console.error("Error fetching admin cash flow:", error);
    return null;
  }
};


// Project status distribution + top projects by billed amount
export const getAdminProjectStatus = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/project-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin project status");
    }

    const data = await response.json();
    return data; // { success, data: { statusBreakdown: [{status,count}], topProjects: [{projectId,projectName,totalBilled}] } }

  } catch (error) {
    console.error("Error fetching admin project status:", error);
    return null;
  }
};


// Task load per staff member (open/active tasks only)
export const getAdminTaskLoad = async (limit = 8) => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/task-load?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin task load");
    }

    const data = await response.json();
    return data; // { success, data: [{ userId, name, tag, count }, ...] }

  } catch (error) {
    console.error("Error fetching admin task load:", error);
    return null;
  }
};


// PayNote pipeline — counts per stage
export const getAdminPaynotePipeline = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/paynote-pipeline`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin paynote pipeline");
    }

    const data = await response.json();
    return data; // { success, data: [{ stage, count }, ...] }

  } catch (error) {
    console.error("Error fetching admin paynote pipeline:", error);
    return null;
  }
};


// Approvals queue — everything currently waiting on an admin decision
export const getAdminApprovalsQueue = async (limit = 10) => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/approvals-queue?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin approvals queue");
    }

    const data = await response.json();
    return data; // { success, data: [{ type, refId, label, who, date }, ...] }

  } catch (error) {
    console.error("Error fetching admin approvals queue:", error);
    return null;
  }
};


// Recent activity feed
export const getAdminRecentActivity = async (limit = 15) => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/recent-activity?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin recent activity");
    }

    const data = await response.json();
    return data; // { success, data: [{ actionType, description, who, relatedModel, relatedId, actionUrl, createdAt }, ...] }

  } catch (error) {
    console.error("Error fetching admin recent activity:", error);
    return null;
  }
};


// Staff & payroll snapshot
export const getAdminPayrollSnapshot = async () => {
  try {
    const response = await fetch(`${backend_url}/dashboard/admin/payroll-snapshot`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin payroll snapshot");
    }

    const data = await response.json();
    return data; // { success, data: { totalStaff, tagBreakdown, currentMonth, monthlySalaryPendingFinalization, staffWithBaseSalarySet } }

  } catch (error) {
    console.error("Error fetching admin payroll snapshot:", error);
    return null;
  }
};