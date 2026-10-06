import { Route } from "react-router-dom";

import HomePageAdmin from "../pages/admin/dashboard/HomePageAdmin.jsx";
import AllBillPage from "../pages/admin/bills/AllBillPage.jsx";
import PaymentRequestListAdmin from "../pages/admin/payments/PaymentRequestListAdmin.jsx";
import PushDocumentAdminPage from "../pages/admin/documents/PushDocumentAdminPage.jsx";
import MyPushedDocument from "../pages/admin/documents/MyPushedDocument.jsx";
import ClientsListAdminPage from "../pages/admin/users/ClientsListAdminPage.jsx";
import ClientDetailAdminPage from "../pages/admin/users/ClientDetailAdminPage.jsx";
import PushAgreement from "../pages/admin/agreements/PushAgreement.jsx";
import SingleBillDetailAdminPage from "../pages/admin/bills/SingleBillDetailAdminPage.jsx";
import AddPaynotePage from "../pages/admin/payments/AddPaynotePage.jsx";
import SinglePRdetailAdminPAge from "../pages/admin/payments/SinglePRDetailAdminPage.jsx";
import DfsRequest from "../pages/admin/dfs/DfsRequest.jsx";
import SingleDfsRequestDetail from "../pages/admin/dfs/SingleDfsRequestDetail.jsx";
import ClientSalaryAll from "../pages/admin/salary/ClientSalaryAll.jsx";
import SingleUSerSalaryDetailAdmin from "../pages/admin/salary/SingleUSerSalaryDetailAdmin.jsx";
import AllUser from "../pages/admin/users/AllUser.jsx";
import AllDFSRequests from "../pages/admin/dfs/AllDFSRequests.jsx";
import AllDocuments from "../pages/admin/documents/AllDocuments.jsx";
import AdminNotificationsPage from "../pages/admin/general/AdminNotificationsPage.jsx";
import AgreementTableListAll from "../pages/admin/agreements/AgreementTableListAll.jsx";
import SingleAgreementDetails from "../pages/admin/agreements/SingleAgreementDetails.jsx";
import SorDetailsAdmin from "../pages/admin/sor/SorPage.jsx";
import CreateProject from "../pages/admin/projects/CreateProject.jsx";
import ListallProject from "../pages/admin/projects/ListallProject.jsx";
import ProjectAssignedToMe from "../pages/admin/projects/ProjectAssignedToMe.jsx";
import SingleProjectDetail from "../pages/admin/projects/SingleProjectDetail.jsx";
import EditProjectDetail from "../pages/admin/projects/EditProjectDetail.jsx";
import MyTaskList from "../pages/admin/tasks/MyTaskList.jsx";
import SingleTaskDetail from "../pages/admin/tasks/SingleTaskDetail.jsx";
import Setting from "../pages/client/general/Setting";
import UnderDevPage from "../pages/UnderDevPage.jsx";
import ProjectBillCreate from "../pages/admin/bills/CreateProjectBill.jsx";
import SingleProjectBillDetail from "../pages/admin/bills/SingleProjectBillDetail.jsx";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard.jsx";
import ProjectPermission from "../pages/admin/projects/ProjectPermission.jsx"; 
import ChatBot from "../pages/admin/general/ChatBot.jsx"; 

// Child routes rendered inside AdminLayout — same paths/elements/order
// as before. This is exactly what used to sit inside the <Route path="/admin">
// block in App.jsx.
export const adminRoutes = (
    <>
        <Route index element={<AdminDashboard />} />
        <Route path="home" element={<AdminDashboard />} />
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
        <Route path="task/:id" element={<SingleTaskDetail />} />
        <Route path="project/bill/create" element={<ProjectBillCreate />} />
        <Route path="project/bill/:id" element={<SingleProjectBillDetail />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="project/permission" element={<ProjectPermission />} />
        <Route path="chatBot" element={<ChatBot />} />

    </>
);