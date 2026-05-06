import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDataProducts, getSankeyData } from "../api";

export default function FunctionMapping() {

  const navigate = useNavigate();
  const location = useLocation();
  const selectedFunction = location.state?.selectedFunction;
  const [functionFilter, setFunctionFilter] = useState(
  selectedFunction || "All"
);
  const [valueChainFilter, setValueChainFilter] = useState("All");
  const [enrichedData, setEnrichedData] = useState([]);
  const [sankeyData, setSankeyData] = useState([]);

  useEffect(() => {
    getDataProducts().then(setEnrichedData).catch(console.error);
    getSankeyData().then(setSankeyData).catch(console.error);
  }, []);

  // 🔹 Unique filters
  const functions = ["All", ...new Set(enrichedData.map(d => d["Functions"]))];
  const valueChains = ["All", ...new Set(enrichedData.map(d => d["Value Chain"]))];

  // 🔹 Apply filters
  const filtered = enrichedData.filter(d =>
    (functionFilter === "All" || d["Functions"] === functionFilter) &&
    (valueChainFilter === "All" || d["Value Chain"] === valueChainFilter)
  );

const handleExportCSV = () => {
  if (!filtered || filtered.length === 0) return;

  const headers = [
    "Data Product",
    "Source System",
    "Function",
    "Value Chain"
  ];

  const rows = filtered.map(item => [
    item["Data Product"],
    item["Source System Name"],
    item["Functions"],
    item["Value Chain"]
  ]);

  const csvContent =
    [headers, ...rows]
      .map(e => e.map(v => `"${v}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "function_mapping.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  // 🔹 Group by Function
  const grouped = filtered.reduce((acc, item) => {
    const func = item["Functions"];
    if (!acc[func]) acc[func] = [];
    acc[func].push(item);
    return acc;
  }, {});

  // 🔹 KPI count helper
  const getKpiCount = (productName) => {
    const match = sankeyData.find(
      (s) =>
        s["Data Product (Suite)"]?.trim().toLowerCase() ===
        productName?.trim().toLowerCase()
    );
    return match?.KPI ? match.KPI.split(",").length : 0;
  };

  return (
    <div className="min-h-screen bg-[#f6f2fb]">

      {/* 🔷 HEADER (FULL WIDTH — FIXED) */}
      <div className="bg-gradient-to-r from-[#5C2D91] to-[#7A4FB3] text-white px-6 py-2 flex justify-center gap-6">
        {[
          { label: "Data Product Registry", path: "/screen-1" },
          { label: "Function Mapping", path: "/screen-3" },
          { label: "Data Product Lineage"},
          { label: "Schema & Tables"},
          { label: "Analytics Product"},
          { label: "ER Diagram"},
        ].map((tab, i) => (
          <button
            key={i}
            onClick={() => navigate(tab.path)}
            className={`px-3 py-1 rounded-full transition ${
              location.pathname === tab.path
                ? "bg-white text-[#5C2D91] font-semibold"
                : "hover:bg-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔷 MAIN CONTENT (PADDING MOVED HERE) */}
      <div className="p-6">
                <button
          onClick={() => navigate(-1)}
          className="text-[#5C2D91] mb-4"
        >
          ← Back to Data Products Page
        </button>

        <h1 className="text-2xl font-bold text-[#5C2D91] mb-2">
          Function Mapping
        </h1>
        <p className="text-gray-500 mb-6">
          Data products grouped by their tagged function — showing bottom-up aggregation.
        </p>

        {/* 🔷 FILTERS */}
        <div className="flex gap-4 mb-6">

          <select
            value={valueChainFilter}
            onChange={(e) => setValueChainFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {valueChains.map((vc) => (
              <option key={vc}>{vc}</option>
            ))}
          </select>

          <select
            value={functionFilter}
            onChange={(e) => setFunctionFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            {functions.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>

<button
  onClick={handleExportCSV}
  className="border border-purple-200 px-5 py-2 rounded-xl bg-white hover:bg-gray-50"
>
  Export
</button>

        </div>

        {/* 🔷 KPI CARDS */}
        <div className="flex gap-4 mb-6">

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-lg font-bold text-[#5C2D91]">
              {Object.keys(grouped).length}
            </div>
            <div className="text-sm text-gray-500">Functions</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-lg font-bold text-[#5C2D91]">
              {filtered.length}
            </div>
            <div className="text-sm text-gray-500">Data products mapped</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="text-lg font-bold text-[#5C2D91]">
              100%
            </div>
            <div className="text-sm text-gray-500">Coverage</div>
          </div>

        </div>

        {/* 🔷 FUNCTION GROUPS */}
        <div className="space-y-6">

          {Object.entries(grouped).map(([func, items]) => (

            <div key={func} className="bg-white rounded-xl border border-purple-100">

              {/* 🔹 Function Header */}
              <div className="flex justify-between items-center p-4 border-b">

                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-[#5C2D91]">
                    {func}
                  </h2>

                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    {items[0]["Value Chain"]}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  {items.length} data product
                </div>

              </div>

              {/* 🔹 Products */}
              <div className="p-4 space-y-3">

                {items.map((item, i) => {

                  const kpiCount = getKpiCount(item["Data Product"]);

                  return (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-[#faf8ff] p-4 rounded-lg"
                    >

                      <div>
<div
  className="text-[#5C2D91] font-medium cursor-pointer hover:underline"
  onClick={() =>
    navigate(
      `/data-product-suite-details?name=${encodeURIComponent(item["Data Product"])}`
    )
  }
>
  {item["Data Product"]}
</div>
                        <div className="text-sm text-gray-500">
                          {item["Source System Name"]} · Internal
                        </div>
                      </div>

                      <div className="flex items-center gap-3">

                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                          {kpiCount} KPIs
                        </span>

                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                          Active
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}