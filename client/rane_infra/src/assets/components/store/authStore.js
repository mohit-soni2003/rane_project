import { create } from "zustand";
import axios from "axios"

const API_URL = "http://localhost:3000";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: false,
	isLoading: false,
	isCheckingAuth: true,
	message: null,

	signup: async (email, password, name) => {
		// Set loading state and clear errors
		set({ isLoading: true, error: null });

		try {
			// Send the POST request using fetch
			const response = await fetch(`${API_URL}/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password, name }),
				credentials: "include", // Ensures cookies are included in cross-origin requests
				withCredntials: true,
			});

			// Check if the response is okay
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Error signing up");
			}

			// Parse the JSON response
			const data = await response.json();
			console.log(data);
			if (data.message) {
				set({ user: data.user, isLoading: false });
			}
			else {
				set({ error: data.error, isLoading: false });
			}
		} catch (error) {
			console.error("Error signing up:", error.message);
		} finally {
			// Reset the loading state
			set({ isLoading: false });
		}
	},
	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`${API_URL}/signin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
				credentials: "include", // Ensures cookies are sent with the request
			});

			const datal = await response.json();

			if (datal.message) {
				console.log("1")
				set({
					isAuthenticated: true,
					user: datal.user,
					error: null,
					isLoading: false,
				});
			} else {
				set({
					error: datal.error || "Login failed",
					isLoading: false,
				});
			}
		} catch (error) {
			set({ error: error.message || "Error logging in", isLoading: false });
			throw error;
		}

	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
		}
	},
	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`${API_URL}/verify-email`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ code }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Error verifying email");
			}

			const data = await response.json();
			console.log(data)
			if (data.message) {
				set({ user: data.user, isLoading: false });
			}
			else {
				set({ error: data.error, isLoading: false });
			}

			set({ isAuthenticated: true, isLoading: false });
			return data;
		} catch (error) {
			set({ isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null ,isLoading:true });
		try {
			const response = await fetch(`${API_URL}/check-auth`, {
				method: "GET",
				credentials: "include", // Send cookies if needed
			});

			if (!response.ok) {
				throw new Error("Authentication check failed");
			}

			const data1 = await response.json();
			// console.log("Response JSON:", data1);

			if (data1.user) {
				set({ user: data1.user, isAuthenticated: true, isCheckingAuth: false ,isLoading:false});
				console.log("User set successfully:", data1.user);
			} else {
				set({ isAuthenticated: false, isCheckingAuth: false, error: data1.error,isLoading:false });
				console.log("No user found in response");
			}
		} catch (error) {
			console.error("Error during authentication check:", error);
			// set({ error, isCheckingAuth: false, isAuthenticated: false });
		}
	},

	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},
}));