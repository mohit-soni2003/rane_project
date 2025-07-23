import { backend_url } from "../store/keyStore";

// Upload Bill to the Server---- this is done by client

export const postBill = async (billData) => {
  try {
    const response = await fetch(`${backend_url}/post-bill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(billData), 
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to post bill");
    }

    return result; // { message, bill }
  } catch (error) {
    console.error("Error posting bill:", error.message);
    throw error;
  }
};
