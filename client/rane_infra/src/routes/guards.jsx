import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Each guard reads the auth store itself, so any page can import and use
// these directly without App.jsx having to thread props through.

export function ProtectedRoute({ children }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        console.log("Redirecting to Signin...");
        return <Navigate to="/signin" replace />;
    }

    if (user && !user.isverified) {
        console.log("Redirecting to Verify Email...");
        return <Navigate to="/verify-email" replace />;
    }

    return children;
}

export function AdminRoute({ children }) {
    const { user, role } = useAuthStore();

    if (user && role === "admin") {
        console.log("You are admin user.");
        return children;
    }
    return <Navigate to="/" replace />;
}

export function ClientRoute({ children }) {
    const { user, role } = useAuthStore();

    if (user && role === "client") {
        console.log("You are client user.");
        return children;
    }
    return <Navigate to="/" replace />;
}

export function StaffRoute({ children }) {
    const { user, role } = useAuthStore();

    if (user && role === "staff") {
        console.log("You are staff user.");
        return children;
    }
    return <Navigate to="/" replace />;
}