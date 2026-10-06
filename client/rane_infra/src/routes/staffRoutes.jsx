import { Route } from "react-router-dom";

import HomePageStaff from "../pages/staff/HomePageStaff.jsx";
import AllBillPage from "../pages/admin/bills/AllBillPage.jsx";
import SingleBillDetailAdminPage from "../pages/admin/bills/SingleBillDetailAdminPage.jsx";
import ClientsListAdminPage from "../pages/admin/users/ClientsListAdminPage.jsx";
import ClientDetailAdminPage from "../pages/admin/users/ClientDetailAdminPage.jsx";
import PaymentRequestListAdmin from "../pages/admin/payments/PaymentRequestListAdmin.jsx";
import SinglePRdetailAdminPAge from "../pages/admin/payments/SinglePRDetailAdminPage.jsx";
import PaymentRequestPage from "../pages/client/payments/PaymentRequestPage";
import MyPaymentRequestPage from "../pages/client/payments/MyPaymentRequestPage.jsx";
import DfsRequest from "../pages/admin/dfs/DfsRequest.jsx";
import SingleDfsRequestDetail from "../pages/admin/dfs/SingleDfsRequestDetail.jsx";
import UploadDocumentPage from "../pages/client/documents/UploadDocumentPage";
import TrackMyAllDocument from "../pages/client/documents/TrackMyAllDocument.jsx";
import AllDocuments from "../pages/admin/documents/AllDocuments.jsx";
import PushDocumentAdminPage from "../pages/admin/documents/PushDocumentAdminPage.jsx";
import SalaryPage from "../pages/admin/salary/SalaryPage.jsx";
import Setting from "../pages/client/general/Setting";
import UnderDevPage from "../pages/UnderDevPage.jsx";
import PendingProject from "../pages/admin/projects/PendingProject.jsx"; // to be removed later
import SingleProjectDetail from "../pages/admin/projects/SingleProjectDetail.jsx";
import MyTaskList from "../pages/admin/tasks/MyTaskList.jsx";
import SngleTaskDetail from "../pages/admin/tasks/SingleTaskDetail.jsx";
import ProjectAssignedToMe from "../pages/admin/projects/ProjectAssignedToMe.jsx";
import EditProjectDetail from "../pages/admin/projects/EditProjectDetail.jsx";
import ProjectBillCreate from "../pages/admin/bills/CreateProjectBill.jsx";
import ListallProject from "../pages/admin/projects/ListallProject.jsx";
import AdminNotificationsPage from "../pages/admin/general/AdminNotificationsPage.jsx";

import SorDetails from "../pages/client/sor/SorDetails.jsx";
import SorDetailsAdmin from "../pages/admin/sor/SorPage.jsx";

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
        <Route path="notifications" element={<AdminNotificationsPage />} />


        <Route path="View-sor-items" element={<SorDetails />} />
        <Route path="Update-sor-item" element={<SorDetailsAdmin />} />


        <Route path="under-dev" element={<UnderDevPage />} />
        <Route path="project/pending" element={<PendingProject />} />
        <Route path="project/pending/:id" element={<SingleProjectDetail />} />
        <Route path="project/task/list" element={<MyTaskList />} />
        <Route path="task/:id" element={<SngleTaskDetail />} />
        <Route path="project/assigned-to-me" element={<ProjectAssignedToMe />} />
        <Route path="project/:id" element={<SingleProjectDetail />} />
        <Route path="project/edit/:id" element={<EditProjectDetail />} />
        <Route path="project/list" element={<ListallProject />} />
        <Route path="project/bill/create" element={<ProjectBillCreate />} />
    </>
);