import { backend_url } from "../store/keyStore";

// Upload or update base salary
export const uploadBaseSalary = async (user, amount) => {
  try {
    const res = await fetch(`${backend_url}/salary/base/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ensures cookie/JWT is sent
      body: JSON.stringify({ user, amount }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upload base salary");

    return data;
  } catch (error) {
    throw error;
  }
};

// Get base salary for a specific user
export const getBaseSalary = async (userId) => {
  try {
    const res = await fetch(`${backend_url}/salary/base/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch base salary");

    return data;
  } catch (error) {
    throw error;
  }
};


// ✅ Get monthly salary for a single user
export const getMonthlySalary = async (userId, month) => {
  try {
    const res = await fetch(`${backend_url}/salary/monthly/${month}/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch monthly salary");

    return data;
  } catch (error) {
    throw error;
  }
};
// ✅ Initialize monthly salary for a user
export const initMonthlySalary = async (user, month) => {
  try {
    const res = await fetch(`${backend_url}/salary/monthly/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // sends JWT cookie if using auth
      body: JSON.stringify({ user, month }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to initialize monthly salary");

    return data;
  } catch (error) {
    throw error;
  }
};
export const updateMonthlySalary = async (userId, month, payload) => {
  const res = await fetch(`${backend_url}/salary/monthly/${month}/update/${userId}`, {
    method: "PUT", // ✅ Changed from PATCH to PUT
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update salary");
  return data.salary; // ✅ Return updated salary only
};
// ✅ Finalize monthly salary for a user
export const finalizeMonthlySalary = async (userId, month) => {
  try {
    const res = await fetch(`${backend_url}/salary/monthly/${month}/finalize/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // send cookies if using JWT auth
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to finalize salary");

    return data.salary; // return the updated salary data
  } catch (error) {
    throw error;
  }
};