import { create } from "zustand";
import axios from "axios";

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
			const response = await fetch("http://localhost:3000/signup", {
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

			// Handle the response data (e.g., setting state)
			// set({ user: data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			// Handle errors
			console.error("Error signing up:", error.message);
			// set({ error: error.message, isLoading: false });
		} finally {
			// Reset the loading state
			set({ isLoading: false });
		}
	},
	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
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
			// set({ user: data.user, isAuthenticated: true, isLoading: false });
			return data;
		} catch (error) {
			// set({ error: error.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await fetch(`${API_URL}/check-auth`, {
				method: "GET",
				credentials: "include", // Ensures cookies are sent with the request if required
			});

			if (!response.ok) {
				throw new Error("Authentication check failed");
			}

			const data = await response.json();
			console.log(data)
			// set({ user: data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			// set({ error: null, isCheckingAuth: false, isAuthenticated: false });
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