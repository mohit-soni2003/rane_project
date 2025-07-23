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
 
// this route is for admin to view all service 


export const getAllPayments = async () => {
  try {
    const res = await fetch(`${backend_url}/allpayment`, {
      method: 'GET',
      credentials: 'include', // include cookies if you're using auth
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch payments');
    }

    return data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};


// this route if for admin to view the particual payment details 

export const getPaymentRequestById = async (id) => {    //id is of particual pamwent
  try {
    const res = await fetch(`${backend_url}/payment/${id}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch payment details');
    }

    return data;
  } catch (err) {
    console.error('Error fetching payment request by ID:', err.message);
    throw err;
  }
};