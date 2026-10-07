import { Route } from "react-router-dom";

import HomePageClient from "../pages/client/home/HomePageClient";
import UploadBillPage from "../pages/client/bills/UploadBillPage";
import MyBillPage from "../pages/client/bills/MyBillPage";
import PaymentRequestPage from "../pages/client/payments/PaymentRequestPage";
import SupportPage from "../pages/client/general/SupportPage";
import DocumentCategory from "../pages/client/documents/DocumentCategory";
import Setting from "../pages/client/general/Setting";
import UploadDocumentPage from "../pages/client/documents/UploadDocumentPage";
import SingleBillDetailsClient from "../pages/client/bills/SingleBillDetailsClient.jsx";
import MyPaymentRequestPage from "../pages/client/payments/MyPaymentRequestPage.jsx";
import SinglePaymentRequestDetailsClient from "../pages/client/payments/SinglePaymentRequestDetailsClient.jsx";
import ViewDocumentPage from "../pages/client/documents/ViewDocumentPage.jsx";
import TrackMyAllDocument from "../pages/client/documents/TrackMyAllDocument.jsx";
import DocumentForReview from "../pages/client/documents/DocumentForReview.jsx"; //used to review when document assign to client by admin and staff
import TransactionPage from "../pages/client/payments/TransactionPage.jsx";
import SalaryPage from "../pages/admin/salary/SalaryPage.jsx";
import AgreementPage from "../pages/client/agreements/AgreementPage.jsx";
import AgreementForAction from "../pages/client/agreements/AgreementForAction.jsx";
import ClosedAgreement from "../pages/client/agreements/ClosedAgreement.jsx";
import AgreementView from "../pages/client/agreements/AgreementView.jsx";
import SorDetails from "../pages/client/sor/SorDetails.jsx";
import UnderDevPage from "../pages/UnderDevPage.jsx";
import DfsRequest from "../pages/admin/dfs/DfsRequest.jsx";
import MyTaskList from "../pages/admin/tasks/MyTaskList.jsx";
import SngleTaskDetail from "../pages/admin/tasks/SingleTaskDetail.jsx";
import ProjectAssignedToMe from "../pages/admin/projects/ProjectAssignedToMe.jsx";
import SingleProjectDetail from "../pages/admin/projects/SingleProjectDetail.jsx";
import EditProjectDetail from "../pages/admin/projects/EditProjectDetail.jsx";
import AdminNotificationsPage from "../pages/admin/general/AdminNotificationsPage.jsx";

// Child routes rendered inside ClientLayout — same paths/elements/order
// as before. This is exactly what used to sit inside the <Route path="/client">
// block in App.jsx.
export const clientRoutes = (
    <>
        <Route index element={<HomePageClient />} />
        <Route path="home" element={<HomePageClient />} />
        <Route path="upload-bill" element={<UploadBillPage />} />
        <Route path="my-bill" element={<MyBillPage />} />
        <Route path="bill/:id" element={<SingleBillDetailsClient />} />
        <Route path="payment-request" element={<PaymentRequestPage />} />
        <Route path="my-payment-request" element={<MyPaymentRequestPage />} />
        <Route path="my-payment-request/:id" element={<SinglePaymentRequestDetailsClient />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="document/category" element={<DocumentCategory />} />
        <Route path="document/category/:docType" element={<ViewDocumentPage />} />
        <Route path="transaction" element={<TransactionPage />} />
        <Route path="salary" element={<SalaryPage />} />
        <Route path="setting" element={<Setting />} />
        <Route path="upload-document" element={<UploadDocumentPage />} />
        <Route path="dfsrequest" element={<DfsRequest />} />
        <Route path="track-dfs/all" element={<TrackMyAllDocument />} />
        <Route path="dfsrequest/:id" element={<DocumentForReview />} />
        <Route path="under-dev" element={<UnderDevPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        

        <Route path="agreement" element={<AgreementPage />} />
        <Route path="agreement/action" element={<AgreementForAction />} />
        <Route path="agreement/closed" element={<ClosedAgreement />} />
        <Route path="agreement/view/:id" element={<AgreementView />} />

        <Route path="sor" element={<SorDetails />} />
        <Route path="project/task/list" element={<MyTaskList />} />
        <Route path="task/:id" element={<SngleTaskDetail />} />
        <Route path="project/assigned-to-me" element={<ProjectAssignedToMe />} />
        <Route path="project/:id" element={<SingleProjectDetail />} />
        <Route path="project/edit/:id" element={<EditProjectDetail />} />




    </>
);