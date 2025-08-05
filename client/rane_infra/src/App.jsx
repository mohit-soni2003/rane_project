import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Includes Popper

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
import UploadBillPage from "./pages/client/UploadBillPage";
import MyBillPage from "./pages/client/MyBillPage";
import PaymentRequestPage from "./pages/client/PaymentRequestPage";
import SupportPage from "./pages/client/SupportPage";
import DocumentCategory from "./pages/client/DocumentCategory";
import Setting from "./pages/client/Setting";
import UploadDocumentPage from "./pages/client/UploadDocumentPage";
import SingleBillDetailsClient from "./pages/client/SingleBillDetailsClient.jsx";
import MyPaymentRequestPage from "./pages/client/MyPaymentRequestPage.jsx";
import ViewDocumentPage from "./pages/client/ViewDocumentPage.jsx";
import TrackMyAllDocument from "./pages/client/TrackMyAllDocument.jsx";
import SalaryPage from "./pages/admin/SalaryPage.jsx";

import AdminLayout from "./Layout/AdminLayout";
import HomePageAdmin from "./pages/admin/HomePageAdmin.jsx";
import AllBillPage from "./pages/admin/AllBillPage.jsx";
import PaymentRequestListAdmin from "./pages/admin/PaymentRequestListAdmin.jsx";
import PushDocumentAdminPage from "./pages/admin/PushDocumentAdminPage.jsx";
import ClientsListAdminPage from "./pages/admin/ClientsListAdminPage.jsx";
import ClientDetailAdminPage from "./pages/admin/ClientDetailAdminPage.jsx";
import SingleBillDetailAdminPage from "./pages/admin/SingleBillDetailAdminPage.jsx";
import SinglePRdetailAdminPAge from "./pages/admin/SinglePRdetailAdminPAge.jsx";
import DfsRequest from "./pages/admin/DfsRequest.jsx";
import SingleDfsRequestDetail from "./pages/admin/SingleDfsRequestDetail.jsx";
import ClientSalaryAll from "./pages/admin/ClientSalaryAll.jsx";
import SingleUSerSalaryDetailAdmin from "./pages/admin/SingleUSerSalaryDetailAdmin.jsx";
import AllUser from "./pages/admin/AllUser.jsx";
import AllDFSRequests from "./pages/admin/AllDFSRequests.jsx";

import StaffLayout from "./Layout/StaffLayout.jsx";
import HomePageStaff from "./pages/staff/HomePageStaff.jsx";


import MaintainencePage from "./pages/MaintainencePage.jsx";
import UnderDevPage from "./pages/UnderDevPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";


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
    if (user && role == "admin") {
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/maintain" element={<Maintainence />} />
        <Route path="/reset-password" element={<ForgotPass />} />
        <Route path="/reset-password-page/:id" element={<ResetPass />} />



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
          <Route index element={<HomePageClient />} />
          <Route path="home" element={<HomePageClient />} />
          <Route path="upload-bill" element={<UploadBillPage />} />
          <Route path="my-bill" element={<MyBillPage />} />
          <Route path="bill/:id" element={<SingleBillDetailsClient />} />
          <Route path="payment-request" element={<PaymentRequestPage />} />
          <Route path="my-payment-request" element={<MyPaymentRequestPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="document/category" element={<DocumentCategory />} />
          <Route path="document/category/:docType" element={<ViewDocumentPage />} />
          <Route path="salary" element={<SalaryPage />} />
          <Route path="setting" element={<Setting />} />
          <Route path="upload-document" element={<UploadDocumentPage />} />
          <Route path="track-dfs/all" element={<TrackMyAllDocument />} />
          <Route path="under-dev" element={<UnderDevPage />} />
        </Route>


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
          <Route index element={<HomePageAdmin />} />
          <Route path="home" element={<HomePageAdmin />} />
          <Route path="bill" element={<AllBillPage />} />
          <Route path="bill/:id" element={<SingleBillDetailAdminPage />} />
          <Route path="payment-request" element={<PaymentRequestListAdmin />} />
          <Route path="payment-request/:id" element={<SinglePRdetailAdminPAge />} />
          <Route path="push-document/:cid" element={<PushDocumentAdminPage />} />
          <Route path="push-document" element={<PushDocumentAdminPage />} />
          <Route path="all-client" element={<ClientsListAdminPage />} />
          <Route path="client-detail/:id" element={<ClientDetailAdminPage />} />
          <Route path="dfsrequest" element={<DfsRequest />} />
          <Route path="dfsrequest/:id" element={<SingleDfsRequestDetail />} />
          <Route path="salary/all-client-list" element={<ClientSalaryAll />} />
          <Route path="salary-detail/:clientid/:currmonth" element={<SingleUSerSalaryDetailAdmin />} />
          <Route path="danger/all-user" element={<AllUser />} />
          <Route path="danger/all-dfs" element={<AllDFSRequests />} />
          <Route path="setting" element={<Setting />} />
          <Route path="under-dev" element={<UnderDevPage />} />
        </Route>
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
        {/* <Route
          path="/upload-bill"
          element={
            <ProtectedRoute>
              <BillbookForm />
            </ProtectedRoute>
          }
        /> */}
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









{/* <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomePageAdmin />} />
          <Route path="home" element={<HomePageAdmin />} />
          <Route path="bill" element={<AllBillPage />} />
          <Route path="bill/:id" element={<SingleBillDetailAdminPage />} />
          <Route path="payment-request" element={<PaymentRequestListAdmin />} />
          <Route path="payment-request/:id" element={<SinglePRdetailAdminPAge />} />
          <Route path="push-document/:cid" element={<PushDocumentAdminPage />} />
          <Route path="push-document" element={<PushDocumentAdminPage />} />
          <Route path="all-client" element={<ClientsListAdminPage />} />
          <Route path="client-detail/:id" element={<ClientDetailAdminPage />} />
          <Route path="dfsrequest" element={<DfsRequest />} />
          <Route path="dfsrequest/:id" element={<SingleDfsRequestDetail />} />
          <Route path="salary/all-client-list" element={<ClientSalaryAll />} />
          <Route path="salary-detail/:clientid/:currmonth" element={<SingleUSerSalaryDetailAdmin />} />
          <Route path="danger/all-user" element={<AllUser />} />
          <Route path="danger/all-dfs" element={<AllDFSRequests />} />

          <Route path="setting" element={<Setting />} />
          <Route path="under-dev" element={<UnderDevPage />} />
        </Route> */}

{/* <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<HomePageAdmin />} />
          <Route path="home" element={<HomePageStaff />} />
          <Route path="bill" element={<AllBillPage />} />
          <Route path="all-client" element={<ClientsListAdminPage />} />
          <Route path="payment-request" element={<PaymentRequestListAdmin />} />
          <Route path="request-payment" element={<PaymentRequestPage />} />
          <Route path="my-payment-request" element={<MyPaymentRequestPage />} />
          <Route path="dfsrequest" element={<DfsRequest />} />
          <Route path="upload-document" element={<UploadDocumentPage />} />
          <Route path="track-dfs/all" element={<TrackMyAllDocument />} />   { /*Track all document uploaded by the staff */}
{/* <Route path="push-document/:cid" element={<PushDocumentAdminPage />} />
          <Route path="push-document" element={<PushDocumentAdminPage />} />
          <Route path="salary" element={<SalaryPage />} />
          <Route path="setting" element={<Setting />} />
          <Route path="under-dev" element={<UnderDevPage />} /> */}
{/* </Route> */ }

{/* <Route path="/client" element={<ClientLayout />}>
          <Route index element={<HomePageClient />} />
          <Route path="home" element={<HomePageClient />} />
          <Route path="upload-bill" element={<UploadBillPage />} />
          <Route path="my-bill" element={<MyBillPage />} />
          <Route path="bill/:id" element={<SingleBillDetailsClient />} />
          <Route path="payment-request" element={<PaymentRequestPage />} />
          <Route path="my-payment-request" element={<MyPaymentRequestPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="document/category" element={<DocumentCategory />} />
          <Route path="document/category/:docType" element={< ViewDocumentPage/>} />
          <Route path="salary" element={<SalaryPage />} />
          <Route path="setting" element={<Setting />} />
          <Route path="upload-document" element={<UploadDocumentPage />} />
          <Route path="track-dfs/all" element={<TrackMyAllDocument />} />
          <Route path="under-dev" element={<UnderDevPage />} />

        </Route> */}
