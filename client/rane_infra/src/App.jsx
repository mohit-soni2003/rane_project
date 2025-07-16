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
import { useAuthStore } from "./store/authStore";
import AdminLogin from "./assets/components/elements/AdminLogin";
import Spinner from "react-bootstrap/esm/Spinner";
import Maintainence from "./assets/components/unique_component/Maintainence";
import ForgotPass from "./assets/components/elements/ForgotPass";
import ResetPass from "./assets/components/elements/ResetPass";
import StaffDashboard from "./assets/components/elements/staff/StaffDashboard";

import ClientSidebar from "./component/sidebar/ClientSidebar";
import AdminSidebar from "./component/sidebar/AdminSidebar";
import StaffSidebar from "./component/sidebar/StaffSidebar";
import HomePageClient from "./pages/client/HomePageClient";
import ClientLayout from "./Layout/ClientLayout";




function App() {
  const { checkAuth, isAuthenticated, user, role } = useAuthStore();
  const [loading, setLoading] = useState(true); // State to track loading



  useEffect(() => {
    const authenticate = async () => {
      await checkAuth();
      setLoading(false);
      console.log("Authentication check completed");
    };

    authenticate();
  }, [checkAuth]);


  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><Spinner></Spinner></div>; // Display loading message while waiting for auth check
  }


  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      console.log("Redirecting to Signin...");
      return <Navigate to="/signin" replace />;
    }

    if (user && !user.isverified) {
      console.log("Redirecting to Verify Email...");
      return <Navigate to="/verify-email" replace />;
    }

    return children;
  };
  const AdminRoute = ({ children }) => {
    if (user && role =="admin") {
      console.log("You are admin user.");
      return children;
    }
    return <Navigate to="/" replace />;
  };
  const ClientRoute = ({ children }) => {
    if (user && role === "client") {
      console.log("You are client user.");
      return children;
    }
    return <Navigate to="/" replace />;
  };
  const StaffRoute = ({ children }) => {
    if (user && role === "staff") {
      console.log("You are staff user.");
      return children;
    }
    return <Navigate to="/" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<ClientLayout />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/maintain" element={<Maintainence />} />
        <Route path="/reset-password" element={<ForgotPass />} />
        <Route path="/reset-password-page/:id" element={<ResetPass />} />

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <UserDashboard />
              </ClientRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-bill"
          element={
            <ProtectedRoute>
              <BillbookForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>

          }
        />
        <Route
          path="/staff-dashboard"
          element={
            <ProtectedRoute>
              <StaffRoute>
                <AdminDashboard />
              </StaffRoute>
            </ProtectedRoute>

          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
