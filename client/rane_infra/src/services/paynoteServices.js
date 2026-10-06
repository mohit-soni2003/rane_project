import { backend_url } from "../store/keyStore";

export const createPayNote = async (payNoteData) => {
  try {
    const response = await fetch(`${backend_url}/paynote/create-paynote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(payNoteData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create paynote");
    }

    return result;
  } catch (error) {
    console.error("Error creating paynote:", error.message);
    throw error;
  }
};

export const getPayNotesByBill = async (billId) => {
  try {
    const response = await fetch(`${backend_url}/paynote/by-bill/${billId}`, {
      method: "GET",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch paynotes");
    }

    return result;
  } catch (error) {
    console.error("Error fetching paynotes by bill:", error.message);
    throw error;
  }
};
