import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Home from "./assets/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./assets/components/elements/Signup";
import Signin from "./assets/components/elements/Signin";
import VerifyEmail from "./assets/components/elements/VerifyEmail";
import BillbookForm from "./assets/components/elements/BillbookForm";
import AdminDashboard from "./assets/components/elements/dashboard/AdminDashboard";
import UserDashboard from "./assets/components/elements/dashboard/UserDashboard";
import { useAuthStore } from "./assets/components/store/authStore";

function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true); // State to track loading

  useEffect(() => {
    const authenticate = async () => {
      await checkAuth(); // Call checkAuth asynchronously
      setLoading(false); // Set loading to false once checkAuth is done
      console.log("Authentication check completed");
    };

    authenticate(); // Invoke the async function
  }, [checkAuth]);

  // Block rendering of routes until authentication check is complete
  if (loading) {
    return <div>Loading...</div>; // Display loading message while waiting for auth check
  }

  // ProtectedRoute component to handle user authorization
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      console.log("Redirecting to Signin...");
      return <Navigate to="/signin" replace />; // Redirect to signin if not authenticated
    }

    if (user && !user.isverified) {
      console.log("Redirecting to Verify Email...");
      return <Navigate to="/verify-email" replace />; // Redirect to verify email if user is not verified
    }

    return children; // Render protected route if user is authenticated and verified
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/upload-bill" element={<BillbookForm />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
