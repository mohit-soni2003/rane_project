// services/dfsService.js
import { backend_url } from "../store/keyStore";

export const uploadDocument = async ({
    fileTitle,
    fileUrl,
    docType,
    Department,
    description
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
                description
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

// This give the all dfs requests assigned to the logged in user . 
export const getMyRequests = async () => {
    const res = await fetch(`${backend_url}/dfs/my-requests`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch documents.");
    return data.files;
};
// This give the all user whose role is either admin or staff 
export const getAllUsers = async () => {
    const res = await fetch(`${backend_url}/dfs/all-users`, {
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch users.");
    return data.users;
};
// this route is to forward the document from done user to another 
export const forwardDocument = async (fileId, forwardData) => {
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
// get all the detaisl of particula dfs by the id of DFS model . Id is dfs document id
export const getFileById = async (id) => {
  try {
    const res = await fetch(`${backend_url}/dfs/file/${id}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch file details.");
    }

    return data.file;
  } catch (error) {
    console.error("❌ Error in getFileById service:", error);
    throw error;
  }
};