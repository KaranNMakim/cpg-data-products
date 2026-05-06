import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Layout/Navbar";
import Breadcrumbs from "../components/Layout/Breadcrumbs";
import KPICard from "../components/KPICard/KPICard";
import SankeyDiagram from "../components/Visualizations/SankeyDiagram";

import { processDataForSankey } from "../data/mockData";
import { getSankeyData } from "../api";

// KPI Card (COMPACT)
const CustomKPICard = ({ title, value }) => (
    <div className="bg-white rounded-[20px] border px-3 py-2 shadow-sm flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-black leading-tight">
            {value}
        </span>
        <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mt-0.5">
            {title}
        </span>
    </div>
);

export default function SankeyDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);

    const selectedValueChain = queryParams.get("valueChain") || "";
    const viewMode = queryParams.get("tab") || "executive";

    // read function(s) from URL
    const urlFunctions = queryParams.getAll("function");

    // initialize state from URL
    const [selectedFunctions, setSelectedFunctions] = useState(urlFunctions);
    const [rawData, setRawData] = useState([]);
    const [selectedAggregated, setSelectedAggregated] = useState(null);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        getSankeyData().then(setRawData).catch(console.error);
    }, []);

    /* ================= URL SYNC FOR FUNCTIONS ================= */
    useEffect(() => {
        queryParams.delete("function");
        selectedFunctions.forEach(fn => queryParams.append("function", fn));
        navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
        // eslint-disable-next-line
    }, [selectedFunctions]);

    /* ================= HANDLERS ================= */
    const handleValueChainChange = (vc) => {
        queryParams.set("valueChain", vc);
        navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
    };

    const handleFunctionToggle = (fn) => {
        if (!fn) return;
        setSelectedFunctions(prev =>
            prev.includes(fn)
                ? prev.filter(f => f !== fn)
                : [...prev, fn]
        );
    };

    const handleChangeViewMode = (mode) => {
        queryParams.set("tab", mode);
        navigate(`${location.pathname}?${queryParams.toString()}`, { replace: true });
    };

    /* ================= OPTIONS ================= */
    const valueChainOptions = useMemo(
        () => [...new Set(rawData.map(d => d["Value Chain"]).filter(Boolean))],
        [rawData]
    );

    const functionOptions = useMemo(() => {
        let filtered = rawData;
        if (selectedValueChain) {
            filtered = filtered.filter(d => d["Value Chain"] === selectedValueChain);
        }
        return [...new Set(filtered.map(d => d["Functions"]).filter(Boolean))];
    }, [rawData, selectedValueChain]);

    /* ================= FILTERED DATA ================= */
    const filteredData = useMemo(() => {
        return rawData.filter(d => {
            if (selectedValueChain && d["Value Chain"] !== selectedValueChain) return false;

            // ✅ FIX: do NOT apply function filter for Data Foundation
            if (
                selectedValueChain !== "Data Foundation" &&
                selectedFunctions.length &&
                !selectedFunctions.includes(d["Functions"])
            ) {
                return false;
            }

            return true;
        });
    }, [rawData, selectedValueChain, selectedFunctions]);

    const sankeyData = useMemo(
        () => processDataForSankey(filteredData, viewMode),
        [filteredData, viewMode]
    );

    const headers = useMemo(
        () =>
            viewMode === "executive"
                ? ["Functions", "Value Chain", "Data Product (Suite)"]
                : [
                    "Data Product (Suite)",
                    "Analytics Product",
                    "Consumer Align Data Product",
                    "Aggregated Data Product",
                    "Source Align Data Product",
                    "Source System Name",
                    "Source System Type"
                ],
        [viewMode]
    );

    const kpis = useMemo(() => ({
        functions: new Set(filteredData.map(d => d["Functions"])).size,
        valueChains: new Set(filteredData.map(d => d["Value Chain"])).size,
        dataProducts: new Set(filteredData.map(d => d["Data Product (Suite)"])).size,
        kpis: filteredData.length
    }), [filteredData]);

    return (
        <div className="bg-[#E9E4F5] flex flex-col w-full min-h-screen">

            {/* ================= NAVIGATION BAR ================= */}
<div className="bg-gradient-to-r from-[#5C2D91] to-[#7A4FB3] text-white px-6 py-2 flex justify-center gap-6">
    {[
        { label: "Data Products Registry", path: "/screen-1" },
        { label: "Function Mapping", path: "/screen-3" },
        { label: "Data Product Lineage", path: "/details" },
        { label: "Schema & Tables"},
        { label: "Analytics Product"},
        { label: "ER Diagram"},
    ].map((tab, i) => (
        <button
            key={i}
            onClick={() => tab.path && navigate(tab.path)}
className={`px-3 py-1 rounded-full transition ${
    tab.label === "Data Product Lineage"
        ? "bg-white text-[#5C2D91] font-semibold"
        : "hover:bg-white/20"
}`}
        >
            {tab.label}
        </button>
    ))}
</div>


            {/* BACK LINK */}
            <div className="w-full px-6 pt-6 max-w-[1750px] mx-auto px-32">
                <button
                    onClick={() => navigate("/screen-1")}
                    className="text-[#5C2D91] mb-0"
                >
                    ← Back to Data Products Page
                </button>
            </div>

            {/* MAIN CONTENT */}
            <main className="flex flex-col gap-4 p-4 max-w-[1750px] mx-auto w-full px-32 mt-0.5">

                {/* FILTERS */}
                <div className="flex gap-6 items-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black">Value Chain</span>
                        <select
                            value={selectedValueChain}
                            onChange={e => handleValueChainChange(e.target.value)}
                            className="bg-white border border-purple-200 rounded-[10px] px-4 py-1.5 text-xs w-[200px]"
                        >
                            <option value="">All Value Chains</option>
                            {valueChainOptions.map(opt => (
                                <option key={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black">Function</span>
                        <select
                            value=""
                            onChange={e => handleFunctionToggle(e.target.value)}
                            className="bg-white border border-purple-200 rounded-[10px] px-4 py-1.5 text-xs w-[200px]"
                        >
                            <option value="" hidden disabled>
                                {selectedFunctions.length === 0
                                    ? "Function(s)"
                                    : selectedFunctions.length === 1
                                        ? selectedFunctions[0]
                                        : "Multiple Selected"}
                            </option>

                            {functionOptions.map(opt => (
                                <option key={opt} value={opt}>
                                    {selectedFunctions.includes(opt) ? `✓ ${opt}` : opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ml-auto flex items-center h-[31px] bg-[#6A1FB5] rounded-lg px-[4px]">
                    {[{ key: "executive", label: "Executive" }, { key: "detailed", label: "Detailed" }].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleChangeViewMode(key)}
                            className={`px-3 py-[3px] text-[10px] font-semibold rounded-md transition-all ${viewMode === key
                                ? "bg-[#E9E4F5] text-[#7B2CBF]"
                                : "text-white/70 hover:text-white"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                </div>


                {/* KPI CARDS */}
                <section className="grid grid-cols-4 gap-3 -mt-2">
                    <CustomKPICard title="Functions" value={kpis.functions} />
                    <CustomKPICard title="Value Chains" value={kpis.valueChains} />
                    <CustomKPICard title="Data Products" value={kpis.dataProducts} />
                    <CustomKPICard title="Analytics Product" value={kpis.kpis} />
                </section>

                {/* SANKEY */}
                <section className="w-full bg-white rounded-3xl shadow-xl p-8 border border-white">
                    <SankeyDiagram
                        data={sankeyData}
                        headers={headers}
                        onNodeClick={(dataProductName) => {
                            navigate(`/data-product-details?name=${encodeURIComponent(dataProductName)}`);
                        }}
                        onNodeHover={() => { }}
                    />
                </section>

            </main>
        </div>
    );
}
