import { Route } from "react-router-dom";

import HomePageClient from "../pages/client/HomePageClient";
import UploadBillPage from "../pages/client/UploadBillPage";
import MyBillPage from "../pages/client/MyBillPage";
import PaymentRequestPage from "../pages/client/PaymentRequestPage";
import SupportPage from "../pages/client/SupportPage";
import DocumentCategory from "../pages/client/DocumentCategory";
import Setting from "../pages/client/Setting";
import UploadDocumentPage from "../pages/client/UploadDocumentPage";
import SingleBillDetailsClient from "../pages/client/SingleBillDetailsClient.jsx";
import MyPaymentRequestPage from "../pages/client/MyPaymentRequestPage.jsx";
import ViewDocumentPage from "../pages/client/ViewDocumentPage.jsx";
import TrackMyAllDocument from "../pages/client/TrackMyAllDocument.jsx";
import DocumentForReview from "../pages/client/DocumentForReview.jsx"; //used to review when document assign to client by admin and staff
import TransactionPage from "../pages/client/TransactionPage.jsx";
import SalaryPage from "../pages/admin/SalaryPage.jsx";
import AgreementPage from "../pages/client/AgreementPage.jsx";
import AgreementForAction from "../pages/client/AgreementForAction.jsx";
import ClosedAgreement from "../pages/client/ClosedAgreement.jsx";
import AgreementView from "../pages/client/AgreementView.jsx";
import SorDetails from "../pages/client/SorDetails.jsx";
import UnderDevPage from "../pages/UnderDevPage.jsx";
import DfsRequest from "../pages/admin/DfsRequest.jsx";

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
        <Route path="agreement" element={<AgreementPage />} />
        <Route path="agreement/action" element={<AgreementForAction />} />
        <Route path="agreement/closed" element={<ClosedAgreement />} />
        <Route path="agreement/view/:id" element={<AgreementView />} />
        <Route path="sor" element={<SorDetails />} />
    </>
);