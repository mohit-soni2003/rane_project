import { backend_url } from "../store/keyStore";

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


 