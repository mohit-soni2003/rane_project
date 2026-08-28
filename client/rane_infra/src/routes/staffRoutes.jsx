import { Route } from "react-router-dom";

import HomePageStaff from "../pages/staff/HomePageStaff.jsx";
import AllBillPage from "../pages/admin/AllBillPage.jsx";
import SingleBillDetailAdminPage from "../pages/admin/SingleBillDetailAdminPage.jsx";
import ClientsListAdminPage from "../pages/admin/ClientsListAdminPage.jsx";
import ClientDetailAdminPage from "../pages/admin/ClientDetailAdminPage.jsx";
import PaymentRequestListAdmin from "../pages/admin/PaymentRequestListAdmin.jsx";
import SinglePRdetailAdminPAge from "../pages/admin/SinglePRdetailAdminPAge.jsx";
import PaymentRequestPage from "../pages/client/PaymentRequestPage";
import MyPaymentRequestPage from "../pages/client/MyPaymentRequestPage.jsx";
import DfsRequest from "../pages/admin/DfsRequest.jsx";
import SingleDfsRequestDetail from "../pages/admin/SingleDfsRequestDetail.jsx";
import UploadDocumentPage from "../pages/client/UploadDocumentPage";
import TrackMyAllDocument from "../pages/client/TrackMyAllDocument.jsx";
import AllDocuments from "../pages/admin/AllDocuments.jsx";
import PushDocumentAdminPage from "../pages/admin/PushDocumentAdminPage.jsx";
import SalaryPage from "../pages/admin/SalaryPage.jsx";
import Setting from "../pages/client/Setting";
import UnderDevPage from "../pages/UnderDevPage.jsx";
import PendingProject from "../pages/admin/PendingProject.jsx"; // to be removed later
import SingleProjectDetail from "../pages/admin/SIngleProjectDetail.jsx";

// Child routes rendered inside StaffLayout — same paths/elements/order
// as before. This is exactly what used to sit inside the <Route path="/staff">
// block in App.jsx.
export const staffRoutes = (
    <>
        <Route index element={<HomePageStaff />} />
        <Route path="home" element={<HomePageStaff />} />
        <Route path="bill" element={<AllBillPage />} />
        <Route path="bill/:id" element={<SingleBillDetailAdminPage />} />

        <Route path="all-client" element={<ClientsListAdminPage />} />
        <Route path="client-detail/:id" element={<ClientDetailAdminPage />} />
        <Route path="payment-request" element={<PaymentRequestListAdmin />} />
        <Route path="payment-request/:id" element={<SinglePRdetailAdminPAge />} />

        <Route path="request-payment" element={<PaymentRequestPage />} />
        <Route path="my-payment-request" element={<MyPaymentRequestPage />} />
        <Route path="dfsrequest" element={<DfsRequest />} />
        <Route path="dfsrequest/:id" element={<SingleDfsRequestDetail />} />

        <Route path="upload-document" element={<UploadDocumentPage />} />
        <Route path="track-dfs/all" element={<TrackMyAllDocument />} />
        <Route path="all-documents" element={<AllDocuments />} />
        <Route path="push-document/:cid" element={<PushDocumentAdminPage />} />
        <Route path="push-document" element={<PushDocumentAdminPage />} />
        <Route path="salary" element={<SalaryPage />} />
        <Route path="setting" element={<Setting />} />
        <Route path="under-dev" element={<UnderDevPage />} />
        <Route path="project/pending" element={<PendingProject />} />
        <Route path="project/pending/:id" element={<SingleProjectDetail />} />
    </>
);