import { Route } from "react-router-dom";

import HomePageAdmin from "../pages/admin/HomePageAdmin.jsx";
import AllBillPage from "../pages/admin/AllBillPage.jsx";
import PaymentRequestListAdmin from "../pages/admin/PaymentRequestListAdmin.jsx";
import PushDocumentAdminPage from "../pages/admin/PushDocumentAdminPage.jsx";
import MyPushedDocument from "../pages/admin/MyPushedDocument.jsx";
import ClientsListAdminPage from "../pages/admin/ClientsListAdminPage.jsx";
import ClientDetailAdminPage from "../pages/admin/ClientDetailAdminPage.jsx";
import PushAgreement from "../pages/admin/PushAgreement.jsx";
import SingleBillDetailAdminPage from "../pages/admin/SingleBillDetailAdminPage.jsx";
import AddPaynotePage from "../pages/admin/AddPaynotePage.jsx";
import SinglePRdetailAdminPAge from "../pages/admin/SinglePRdetailAdminPAge.jsx";
import DfsRequest from "../pages/admin/DfsRequest.jsx";
import SingleDfsRequestDetail from "../pages/admin/SingleDfsRequestDetail.jsx";
import ClientSalaryAll from "../pages/admin/ClientSalaryAll.jsx";
import SingleUSerSalaryDetailAdmin from "../pages/admin/SingleUSerSalaryDetailAdmin.jsx";
import AllUser from "../pages/admin/AllUser.jsx";
import AllDFSRequests from "../pages/admin/AllDFSRequests.jsx";
import AllDocuments from "../pages/admin/AllDocuments.jsx";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage.jsx";
import AgreementTableListAll from "../pages/admin/AgreementTableListAll.jsx";
import SingleAgreementDetails from "../pages/admin/SingleAgreementDetails.jsx";
import SorDetailsAdmin from "../pages/admin/SorPage.jsx";
import CreateProject from "../pages/admin/CreateProject.jsx";
import ListallProject from "../pages/admin/ListallProject.jsx";
import ProjectAssignedToMe from "../pages/admin/ProjectAssignedToMe.jsx";
import SingleProjectDetail from "../pages/admin/SIngleProjectDetail.jsx";
import EditProjectDetail from "../pages/admin/EditProjectDetail.jsx";
import MyTaskList from "../pages/admin/MyTaskList.jsx";
import SingleTaskDetail from "../pages/admin/SingleTaskDetail.jsx";
import Setting from "../pages/client/Setting";
import UnderDevPage from "../pages/UnderDevPage.jsx";
import ProjectBillCreate from "../pages/admin/CreateProjectBill.jsx";
import SingleProjectBillDetail from "../pages/admin/SingleProjectBillDetail.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";

// Child routes rendered inside AdminLayout — same paths/elements/order
// as before. This is exactly what used to sit inside the <Route path="/admin">
// block in App.jsx.
export const adminRoutes = (
    <>
        <Route index element={<HomePageAdmin />} />
        <Route path="home" element={<HomePageAdmin />} />
        <Route path="bill" element={<AllBillPage />} />
        <Route path="bill/:id" element={<SingleBillDetailAdminPage />} />
        <Route path="add-paynote" element={<AddPaynotePage />} />
        <Route path="payment-request" element={<PaymentRequestListAdmin />} />
        <Route path="payment-request/:id" element={<SinglePRdetailAdminPAge />} />
        <Route path="push-document/:cid" element={<PushDocumentAdminPage />} />
        <Route path="push-document" element={<PushDocumentAdminPage />} />
        <Route path="push-document/by-me" element={<MyPushedDocument />} />
        <Route path="agreement/push" element={<PushAgreement />} />
        <Route path="agreement/track" element={<AgreementTableListAll />} />
        <Route path="agreement/track/:id" element={<SingleAgreementDetails />} />
        <Route path="all-client" element={<ClientsListAdminPage />} />
        <Route path="client-detail/:id" element={<ClientDetailAdminPage />} />
        <Route path="dfsrequest" element={<DfsRequest />} />
        <Route path="dfsrequest/:id" element={<SingleDfsRequestDetail />} />
        <Route path="salary/all-client-list" element={<ClientSalaryAll />} />
        <Route path="salary-detail/:clientid/:currmonth" element={<SingleUSerSalaryDetailAdmin />} />
        <Route path="danger/all-user" element={<AllUser />} />
        <Route path="danger/all-dfs" element={<AllDFSRequests />} />
        <Route path="danger/all-documents" element={<AllDocuments />} />
        <Route path="setting" element={<Setting />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="under-dev" element={<UnderDevPage />} />
        <Route path="sor-details" element={<SorDetailsAdmin />} />
        <Route path="project/create" element={<CreateProject />} />
        <Route path="project/list" element={<ListallProject />} />
        <Route path="project/assigned-to-me" element={<ProjectAssignedToMe />} />
        <Route path="project/:id" element={<SingleProjectDetail />} />
        <Route path="project/edit/:id" element={<EditProjectDetail />} />
        <Route path="project/task/list" element={<MyTaskList />} />
        <Route path="project/task/:id" element={<SingleTaskDetail />} />
        <Route path="project/bill/create" element={<ProjectBillCreate />} />
        <Route path="project/bill/:id" element={<SingleProjectBillDetail />} />
        <Route path="dashboard" element={<AdminDashboard />} />
    </>
);