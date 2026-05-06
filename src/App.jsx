import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Screen_1 from "./pages/Screen_1";
import Screen_2 from "./pages/Screen_2";
import Screen_3 from "./pages/Screen_3";  
import FunctionOverview from "./pages/FunctionOverview";
import SankeyDashboard from "./pages/SankeyDashboard";
import DataProductDetails from "./pages/DataProductDetails";
import DataProductSuiteDetails from "./pages/DataProductSuiteDetails";
import AnalyticsProductDetails from "./pages/AnalyticsProductDetails";
import GenerateERDiagram from "./pages/GenerateERDiagram";
import CreateDataProduct from "./pages/CreateDataProduct";
import FlowGuideBot from "./pages/FlowGuideBot";
//import DownloadETLCode from "./pages/DownloadETLCode";

/* ================= LAYOUT WITH FLOW GUIDE ================= */
function AppLayout() {
  return (
    <>
      <FlowGuideBot />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Login />} />

       <Route element={<AppLayout />}>

  {/* ✅ DEFAULT ROUTE FIX */}
  <Route path="/" element={<Navigate to="/screen-1" />} />

  <Route path="/overview" element={<FunctionOverview />} />
  <Route path="/screen-1" element={<Screen_1 />} />
  <Route path="/screen-2/:name" element={<Screen_2 />} />
  <Route path="/screen-3" element={<Screen_3 />} />
  <Route path="/details" element={<SankeyDashboard />} />
  <Route path="/data-product-details" element={<DataProductDetails />} />
  <Route path="/data-product-suite-details" element={<DataProductSuiteDetails />} />
  <Route path="/generate-er-diagram" element={<GenerateERDiagram />} />
  <Route path="/analytics-product-details" element={<AnalyticsProductDetails />} />
  <Route path="/create-data-product" element={<CreateDataProduct />} />
</Route>
      </Routes>
    </BrowserRouter>
  );
}
