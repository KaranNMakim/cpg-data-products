import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDataProducts } from "../api";
import CreateDataProductModal from "../components/CreateDataProductModal";



export default function Screen_1() {
const navigate = useNavigate();
const location = useLocation();

  const [data, setData] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    getDataProducts().then(setData).catch(console.error);
  }, []);

  // 🔍 Search state
  const [search, setSearch] = useState("");

  // ✅ NEW: Function filter state
  const [functionFilter, setFunctionFilter] = useState([]);

  // ✅ NEW: Value Chain filter state (ADDED)
  const [valueChainFilter, setValueChainFilter] = useState([]);

  // ✅ NEW: Dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const [isVCOpen, setIsVCOpen] = useState(false); // ADDED

  const dropdownRef = useRef();
  const vcDropdownRef = useRef(); // ADDED

  const handleExportCSV = () => {
  if (!filteredData || filteredData.length === 0) return;

  const headers = [
    "Data Product",
    "Source System",
    "Function",
    "Value Chain"
  ];

  const rows = filteredData.map(item => [
    item.title,
    item.source,
    item.functions,
    item.valueChain
  ]);

  const csvContent =
    [headers, ...rows]
      .map(e => e.map(v => `"${v}"`).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "data_products.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        vcDropdownRef.current && !vcDropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsVCOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔄 Transform backend data → UI format
  const dataProducts = data.map((item) => ({
    title: item["Data Product"],
    source: item["Source System Name"],
    functions: item["Functions"],
    valueChain: item["Value Chain"],
    status: item["Status"] || "Active",
    tags: [
      item["Functions"]?.split(",")[0],
      item["Value Chain"]
    ],
  }));

  // ✅ NEW: Function options
  const functionOptions = [
    ...new Set(data.map(item => item["Functions"]).filter(Boolean))
  ];

  // ✅ NEW: Value Chain options (ADDED)
  const valueChainOptions = [
    ...new Set(data.map(item => item["Value Chain"]).filter(Boolean))
  ];

  // Options for the extended Create form
  const kpiOptions = [
    ...new Set(data.map(item => item["Analytics Product/KPI"]).filter(Boolean))
  ].sort();
  const consumerAlignOptions = [
    ...new Set(data.map(item => item["Consumer Align Data Product"]).filter(Boolean))
  ].sort();
  const sourceAlignOptions = [
    ...new Set(data.map(item => item["Source Align Data Product"]).filter(Boolean))
  ].sort();

  // ✅ NEW: Toggle function
  const toggleFunction = (value) => {
    if (!value) return;

    setFunctionFilter(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // ✅ NEW: Toggle value chain (ADDED)
  const toggleValueChain = (value) => {
    if (!value) return;

    setValueChainFilter(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // 🔍 Filter logic (UPDATED)
  const filteredData = dataProducts.filter((item, index) => {
    const original = item;

    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFunction =
      functionFilter.length === 0 ||
      functionFilter.includes(original.functions);

    const matchesValueChain =
      valueChainFilter.length === 0 ||
      valueChainFilter.includes(original.valueChain);

    return matchesSearch && matchesFunction && matchesValueChain;
  });

const stats = [
  { label: "DATA PRODUCTS", value: filteredData.length },
  { label: "FUNCTIONS", value: new Set(filteredData.map(d => d.functions)).size },
  { label: "VALUE CHAINS", value: new Set(filteredData.map(d => d.valueChain)).size },
  { label: "ACTIVE", value: filteredData.filter(d => d.status === "Active").length },
];

  const dynamicFunctionOptions = [
    ...new Set(
      data
        .filter(
          (item) =>
            valueChainFilter.length === 0 ||
            valueChainFilter.includes(item["Value Chain"])
        )
        .flatMap((item) =>
          item["Functions"].split(",").map((f) => f.trim())
        )
    ),
  ];

  const dynamicValueChainOptions = [
    ...new Set(
      data
        .filter(
          (item) =>
            functionFilter.length === 0 ||
            item["Functions"]
              .split(",")
              .map((f) => f.trim())
              .some((f) => functionFilter.includes(f))
        )
        .map((item) => item["Value Chain"])
    ),
  ];


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

      {/* 🔷 CONTENT */}
      <div className="p-6">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-[#5C2D91]">
          Data Product Registry
        </h1>
        <p className="text-gray-500 mb-6">
          Register, tag, and manage data products — the foundational building blocks mapped upward to functions and value chains.
        </p>

        {/* 📊 STATS */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {stats.map((item, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm text-center border border-purple-100"
            >
              <div className="text-2xl font-bold text-[#5C2D91]">
                {item.value}
              </div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 🔍 FILTER BAR */}
        <div className="flex gap-4 items-center mb-6 flex-wrap">

          {/* 🔍 Search */}
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search data products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-purple-200 rounded-lg pl-9 pr-4 py-2 w-64"
            />
          </div>

          {/* FUNCTION DROPDOWN */}
          <div className="relative w-64" ref={dropdownRef} onMouseLeave={() => setIsOpen(false)}>
            <div
              className="border border-purple-200 bg-white rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between items-center"
              onMouseEnter={() => setIsOpen(true)}
            >
              <span className="truncate">
                {functionFilter.length === 0
                  ? "Function: All"
                  : functionFilter.length === 1
                    ? functionFilter[0]
                    : `${functionFilter.length} selected`}
              </span>
              <span>▾</span>
            </div>

            {isOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-purple-200 rounded-lg shadow-md max-h-60 overflow-y-auto">
                {dynamicFunctionOptions.map((f) => (
                  <label
                    key={f}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={functionFilter.includes(f)}
                      onChange={() => toggleFunction(f)}
                      className="accent-purple-600"
                    />
                    {f}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* VALUE CHAIN DROPDOWN (FIXED WIDTH) */}
        <div className="relative w-54" ref={vcDropdownRef} onMouseLeave={() => setIsVCOpen(false)}>
        <div
            className="border border-purple-200 bg-white rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between items-center"
            onMouseEnter={() => setIsVCOpen(true)}
        >
            <span className="truncate">
            {valueChainFilter.length === 0
                ? "Value Chain: All"
                : valueChainFilter.length === 1
                ? valueChainFilter[0]
                : `${valueChainFilter.length} selected`}
            </span>
            <span>▾</span>
        </div>

        {isVCOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-purple-200 rounded-lg shadow-md max-h-60 overflow-y-auto">
            {dynamicValueChainOptions.map((v) => (
                <label
                key={v}
                className="flex items-center gap-2 px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                >
                <input
                    type="checkbox"
                    checked={valueChainFilter.includes(v)}
                    onChange={() => toggleValueChain(v)}
                    className="accent-purple-600"
                />
                {v}
                </label>
            ))}
            </div>
        )}
        </div>
          {/* Other dropdowns 
          <select className="border border-purple-200 bg-white rounded-lg px-3 py-2 text-sm">
            <option>Status: All</option>
          </select>
            */}
          {/* Buttons */}
          <div className="ml-auto flex gap-3">
            <button onClick={() => navigate("/create-data-product")} className="bg-[#5C2D91] text-white px-5 py-2 rounded-xl shadow-sm hover:bg-purple-700">
              + Create Data Product
            </button>
<button
  onClick={handleExportCSV}
  className="border border-purple-200 px-5 py-2 rounded-xl bg-white hover:bg-gray-50"
>
  Export
</button>
          </div>
        </div>

        {/* 📦 CARDS */}
        <div className="grid grid-cols-3 gap-6">
          {filteredData.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(`/screen-2/${encodeURIComponent(item.title)}`)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-xl">📦</div>

                <div className="flex-1">
                  <div className="text-lg font-semibold text-[#5C2D91]">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.source}
                  </div>
                </div>

                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === "New"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-purple-50 text-[#5C2D91] px-2 py-1 rounded-full border border-purple-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>

      {showCreateModal && (
        <CreateDataProductModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newItem) => setData((prev) => [newItem, ...prev])}
          functionOptions={functionOptions}
          valueChainOptions={valueChainOptions}
          kpiOptions={kpiOptions}
          consumerAlignOptions={consumerAlignOptions}
          sourceAlignOptions={sourceAlignOptions}
        />
      )}
    </div>
  );
}