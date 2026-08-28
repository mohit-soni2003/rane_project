import { Route } from "react-router-dom";

import Signup from "../pages/common/Signup.jsx";
import Signin from "../pages/common/Signin.jsx";
import VerifyEmail from "../pages/common/VerifyEmail.jsx";
import AdminLogin from "../assets/components/elements/AdminLogin";
import Maintainence from "../assets/components/unique_component/Maintainence";
import ForgotPass from "../pages/common/ForgotPass.jsx";
import ResetPass from "../assets/components/elements/ResetPass";
import LandingPage from "../pages/LandingPage.jsx";

// Routes that need no auth at all — same paths/elements as before,
// just lifted out of App.jsx.
export const publicRoutes = (
    <>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/maintain" element={<Maintainence />} />
        <Route path="/reset-password" element={<ForgotPass />} />
        <Route path="/reset-password-page/:id" element={<ResetPass />} />
    </>
);