import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getDataProducts, getDataCatalog, getSankeyData } from "../api";


export default function Screen_2() {

  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProduct = decodeURIComponent(name);

  const [product, setProduct] = useState(null);
  const [tables, setTables] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [enrichedData, catalog, sankeyData] = await Promise.all([
          getDataProducts(),
          getDataCatalog(selectedProduct),
          getSankeyData(),
        ]);

        const found = enrichedData.find(
          (item) => item["Data Product"]?.trim().toLowerCase() === selectedProduct?.trim().toLowerCase()
        );
        setProduct(found || null);

        // Extract raw tables from catalog
        const rawTables = [];
        Object.values(catalog || {}).forEach((kpiLevel) => {
          Object.values(kpiLevel).forEach((metricLevel) => {
            Object.values(metricLevel).forEach((factArray) => {
              if (Array.isArray(factArray)) {
                factArray.forEach((item) => { if (item.raw_table) rawTables.push(item.raw_table); });
              }
            });
          });
        });
        setTables([...new Set(rawTables)]);

        const sankeyMatch = sankeyData.find(
          (s) => s["Data Product (Suite)"]?.trim().toLowerCase() === selectedProduct?.trim().toLowerCase()
        );
        setKpis(sankeyMatch?.["KPI"]?.split(",") || []);
      } catch (err) {
        console.error("Screen_2 load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedProduct]);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  if (!product) {
    return (
      <div style={{ padding: "20px" }}>
        No data found for: {selectedProduct}
      </div>
    );
  }

  const title = product["Data Product"];
  const source = product["Source System Name"];
  const functionTag = product["Functions"];
  const valueChain = product["Value Chain"];
  const analyticsProduct = product["Analytics Product/KPI"];

  return (
    <div className="min-h-screen bg-[#f6f2fb]">

      {/* 🔷 HEADER */}
   
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

      {/* 🔷 CONTENT */}
      <div className="p-6">

        {/* 🔙 BACK */}
        <button
          onClick={() => navigate(-1)}
          className="text-[#5C2D91] mb-4"
        >
          ← Back to Data Product Registry
        </button>

        {/* 🔷 TITLE */}
        <div className="flex items-center gap-3 mb-2">
          <div className="text-xl">📦</div>
          <h1 className="text-2xl font-bold text-[#5C2D91]">{title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            product["Status"] === "New"
              ? "bg-amber-100 text-amber-600"
              : "bg-green-100 text-green-600"
          }`}>
            {product["Status"] || "Active"}
          </span>
        </div>

        <p className="text-gray-500 mb-6">
          Data Product · Internal · {source}
        </p>

        {/* 🔷 TABS */}
       {/* <div className="flex gap-6 border-b mb-6">
          {["Overview", "Schema & Tables", "ETL Code", "Lineage", "Analytics Products", "Tags"].map((tab, i) => (
            <div
              key={i}
              className={`pb-2 cursor-pointer ${
                i === 0
                  ? "border-b-2 border-purple-600 text-purple-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </div>
          ))}
        </div> */}

        {/* 🔷 RESOURCE MAPPING */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-purple-100">
          <div className="text-sm text-gray-500 mb-4">
            Resource mapping (bottom-up)
          </div>

          <div className="flex items-center justify-between gap-4">

            <div className="flex-1 bg-purple-100 border border-dashed rounded-xl p-4 text-center">
              <div className="text-xs text-gray-400">DATA PRODUCT</div>
              <div className="font-semibold text-[#5C2D91]">{title}</div>
            </div>

            <div className="text-xl text-purple-500">→</div>

            <div className="flex-1 bg-purple-100 border border-dashed rounded-xl p-4 text-center">
              <div className="text-xs text-gray-400">TAGGED TO FUNCTION</div>
              <div className="font-semibold text-[#5C2D91]">{functionTag}</div>
            </div>

            <div className="text-xl text-purple-500">→</div>

            <div className="flex-1 bg-purple-100 border border-dashed rounded-xl p-4 text-center">
              <div className="text-xs text-gray-400">TAGGED TO VALUE CHAIN</div>
              <div className="font-semibold text-[#5C2D91]">{valueChain}</div>
            </div>

          </div>
        </div>

        {/* 🔷 GRID */}
        <div className="grid grid-cols-2 gap-6">

          {/* 🔹 PROPERTIES */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100">
            <h3 className="font-semibold mb-4">Properties</h3>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-500">Source system</span>
                <span>{source}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Source type</span>
                <span>Internal</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Function</span>
<span
  onClick={() =>
    navigate("/screen-3", { state: { selectedFunction: functionTag } })
  }
  className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full cursor-pointer hover:bg-purple-200"
>
  {functionTag}
</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Value chain</span>
<span
  onClick={() =>
    navigate(
      `/details?valueChain=${encodeURIComponent(valueChain)}&function=${encodeURIComponent(functionTag)}`
    )
  }
  className="bg-green-100 text-green-600 px-2 py-1 rounded-full cursor-pointer hover:bg-green-200"
>
  {valueChain}
</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Analytics product</span>
<span
  className="text-purple-600 font-medium cursor-pointer hover:underline"
  onClick={() =>
    navigate(
      `/analytics-product-details?name=${encodeURIComponent(analyticsProduct)}`
    )
  }
>
  {analyticsProduct}
</span>
              </div>

            </div>
          </div>

          {/* 🔹 KPI SECTION */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100">
            <h3 className="font-semibold mb-4">KPIs tracked</h3>

            <div className="flex flex-wrap gap-2">
              {kpis.map((kpi, i) => (
                <span
                  key={i}
                  className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs"
                >
                  {kpi}
                </span>
              ))}
            </div>
          </div>

          {/* 🔹 SOURCE TABLES */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 col-span-2">
            <h3 className="font-semibold mb-4">
              Source tables ({tables.length})
            </h3>

            <div className="flex flex-wrap gap-2">
              {tables.map((t, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}