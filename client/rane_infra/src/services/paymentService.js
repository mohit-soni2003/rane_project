import { backend_url } from "../store/keyStore";
export const postPaymentRequest = async (paymentData) => {
    try {
        const response = await fetch(`${backend_url}/post-payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentData)
        }); 

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create payment request");
        }

        return data; // Successfully created
    } catch (error) {
        throw error; // Let caller handle the error
    }
}; 
 