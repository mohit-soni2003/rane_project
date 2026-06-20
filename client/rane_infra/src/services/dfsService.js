// services/dfsService.js
import { backend_url } from "../store/keyStore";

export const uploadDocument = async ({
    fileTitle,
    fileUrl,
    docType,
    Department,
    description,
    // ── Invoice sub-fields ──
    invoiceType,
    // ── Contract sub-fields ──
    eAgreement,
    generalContractAndLabour,
    // ── Proposal sub-fields ──
    proposalType,
    // ── Report sub-fields ──
    employeeMeasurementBook,
    employeeReport,
}) => {
    try {
        const res = await fetch(`${backend_url}/dfs/upload-document`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileTitle,
                fileUrl,
                docType,
                Department,
                description,
                // ── sub-fields (backend ignores undefined values) ──
                invoiceType,
                eAgreement,
                generalContractAndLabour,
                proposalType,
                employeeMeasurementBook,
                employeeReport,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload document metadata');

        return data;
    } catch (err) {
        console.error('Backend Upload Error:', err);
        throw err;
    }
};


// ── All services below are unchanged ─────────────────────────────────────────

export const getMyRequests = async () => {
    const res = await fetch(`${backend_url}/dfs/my-requests`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch documents.");
    return data.files;
};

export const getAllUsers = async () => {
    const res = await fetch(`${backend_url}/dfs/all-users`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch users.");
    return data.users;
};

export const forwardDocument = async (fileId, forwardData) => {
    console.log(forwardData)
    const res = await fetch(`${backend_url}/dfs/forward/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(forwardData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to forward document.");
    return result;
};

export const forwardDocumentToStaff = async (fileId, forwardData) => {
    console.log(forwardData)
    const res = await fetch(`${backend_url}/dfs/forward/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(forwardData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to forward document.");
    return result;
};

export const getFileById = async (id) => {
  try {
    const res = await fetch(`${backend_url}/dfs/file/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch file details.");
    return data.file;
  } catch (error) {
    console.error("❌ Error in getFileById service:", error);
    throw error;
  }
};

export const getMyUploadedFiles = async () => {
  try {
    const res = await fetch(`${backend_url}/dfs/my-files`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch your uploaded files.");
    return data.files;
  } catch (err) {
    console.error("Error in getMyUploadedFiles:", err);
    throw err;
  }
};

export const getAllDfsRequests = async () => {
  try {
    const res = await fetch(`${backend_url}/dfs/files`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch all DFS requests.");
    return data;
  } catch (err) {
    console.error("Error in getAllDfsRequests:", err);
    throw err;
  }
};

export const deleteDfsFile = async (fileId) => {
  try {
    const res = await fetch(`${backend_url}/dfs/file/${fileId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete DFS file.");
    return data;
  } catch (err) {
    console.error("Error in deleteDfsFile:", err);
    throw err;
  }
};