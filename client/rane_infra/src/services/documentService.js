import { backend_url } from "../store/keyStore";

export const pushDocument = async (formData) => {
  try {
    const response = await fetch(`${backend_url}/admin/document/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ✅ Important: include cookies/session
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to push document.');
    }

    return data;
  } catch (error) {
    console.error('Error in pushDocument:', error);
    throw error;
  }
};
