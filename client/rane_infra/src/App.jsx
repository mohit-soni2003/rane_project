import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Includes Popper

import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { useAuthStore } from "./store/authStore";
import Loader from "./component/animation/Loader.jsx";

import { ProtectedRoute, AdminRoute, ClientRoute, StaffRoute } from "./routes/guards.jsx";
import { publicRoutes } from "./routes/publicRoutes.jsx";
import { clientRoutes } from "./routes/clientRoutes.jsx";
import { adminRoutes } from "./routes/adminRoutes.jsx";
import { staffRoutes } from "./routes/staffRoutes.jsx";

import ClientLayout from "./Layout/ClientLayout";
import AdminLayout from "./Layout/AdminLayout";
import StaffLayout from "./Layout/StaffLayout.jsx";

function App() {
  const { checkAuth } = useAuthStore();
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
    return <div><Loader></Loader></div>; // Display loading message while waiting for auth check
  }

  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes}

        {/* ---------Client Route  */}
        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <ClientLayout />
              </ClientRoute>
            </ProtectedRoute>
          }
        >
          {clientRoutes}
        </Route>

        {/* ---------Admin Route ---------- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          {adminRoutes}
        </Route>

        {/* ---------Staff route------------ */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffRoute>
                <StaffLayout />
              </StaffRoute>
            </ProtectedRoute>
          }
        >
          {staffRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;