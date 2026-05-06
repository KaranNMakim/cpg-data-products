import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { getAnalyticsProducts } from "../api";

export default function AnalyticsProductDetails() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const selectedAnalytics = params.get("name");

    const [dataProductInfo, setDataProductInfo] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        getAnalyticsProducts().then((data) => {
            setDataProductInfo(data);
            // Apply initial filter from URL query param after data loads
            if (selectedAnalytics) {
                setSelectedProducts([selectedAnalytics]);
            }
        }).catch(console.error);
    }, [selectedAnalytics]);

    const allProducts = useMemo(
        () => [...new Set(dataProductInfo.map(d => d.analyticsProduct))],
        [dataProductInfo]
    );

    /* ================= SELECT HANDLERS ================= */

    const handleSelect = (value) => {
        if (value === "__ALL__") {
            if (selectedProducts.length === allProducts.length) {
                setSelectedProducts([]);
            } else {
                setSelectedProducts(allProducts);
            }
            return;
        }

        setSelectedProducts(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const handleReset = () => {
        setSelectedProducts([]);
    };

    /* ================= FILTERED DATA ================= */
    const filteredData = useMemo(() => {
        if (!selectedProducts.length) return dataProductInfo;
        return dataProductInfo.filter(d =>
            selectedProducts.includes(d.analyticsProduct)
        );
    }, [selectedProducts, dataProductInfo]);

    /* ================= DOWNLOAD HANDLER ================= */
    const handleDownload = () => {
        const dataToDownload = filteredData.map(row => ({
            "Analytics Product": row.analyticsProduct,
            "Business Purpose": row.businessPurpose,
            "Industry": row.industry,
            "Key Consumers": row.keyConsumers,
            "Primary Entities": row.entities,
            "Business Impact": row.businessImpact
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics Products");

        XLSX.writeFile(
            workbook,
            selectedProducts.length
                ? "Analytics_Products.xlsx"
                : "All_Analytics_Products.xlsx"
        );
    };

    return (
<div className="bg-[#E9E4F5] w-full min-h-screen">

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
      onClick={() => navigate(tab.path)}
className={`px-3 py-1 rounded-full transition ${
  tab.label === "Analytics Product"
    ? "bg-white text-[#5C2D91] font-semibold"
    : location.pathname.startsWith(tab.path)
    ? "bg-white text-[#5C2D91] font-semibold"
    : "hover:bg-white/20"
}`}
    >
      {tab.label}
    </button>
  ))}
</div>
            {/* ================= SELECTED ANALYTICS PRODUCT (BACK LINK) ================= */}
            <div className="w-full px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="text-[#5C2D91] mb-4"
        >
          ← Back to Data Products Page
        </button>
            </div>
            {/* ================= CONTENT ================= */}
            <div className="w-[96%] max-w-[1600px] mx-auto">


                {/* ================= FILTER BAR ================= */}
                <div className="mb-3 flex gap-4 items-center">
                    <select
                        value=""
                        onChange={e => handleSelect(e.target.value)}
                        className="w-[250px] px-3 py-1.5 rounded-[6px] border border-gray-300 text-[10px]"
                    >
                        <option hidden>
                            {selectedProducts.length === allProducts.length
                                ? "All Selected"
                                : selectedProducts.length === 1
                                    ? selectedProducts[0]
                                    : selectedProducts.length > 1
                                        ? "Multiple Selected"
                                        : "Select Analytics Product"}
                        </option>

                        <option value="__ALL__">
                            {selectedProducts.length === allProducts.length
                                ? "Deselect All"
                                : "Select All"}
                        </option>

                        {allProducts.map(o => (
                            <option key={o} value={o}>
                                {selectedProducts.includes(o) ? `✓ ${o}` : o}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleReset}
                        className="h-[30px] px-2 rounded-full bg-[#5D3891] text-white text-[10px] font-bold shadow-md hover:bg-[#4a2c74] transition-all"
                    >
                        Reset Filter
                    </button>

                    {/* ================= DOWNLOAD ICON ================= */}
                    <div className="relative group flex items-center">
                        <button
                            onClick={handleDownload}
                            className="h-[38px] flex items-center justify-center text-[#5D3891] hover:text-[#4a2c74] transition-all"
                        >
                            <Download size={18} />
                        </button>

                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2
                            whitespace-nowrap rounded-md bg-[#5D3891] px-2 py-1
                            text-[10px] font-semibold text-white opacity-0
                            transition-opacity duration-200 group-hover:opacity-100">
                            Download Excel
                        </span>
                    </div>
                </div>

                {/* ================= WHITE BOX ================= */}
                <div
                    className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white"
                    style={{ zoom: 0.7 }}
                >
                    <div className="px-6 pb-4">
                        <h2 className="text-xl font-extrabold text-[#5C2D91] tracking-wide whitespace-nowrap">
                            Analytics Product Details
                        </h2>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead className="bg-[#F9F8FF]">
                                <tr>
                                    {[
                                        "Analytics Product",
                                        "Business Purpose",
                                        "Industry",
                                        "Key Consumers",
                                        "Primary Entities",
                                        "Business Impact"
                                    ].map(h => (
                                        <th
                                            key={h}
                                            className="px-6 py-4 text-xs font-black tracking-widest text-center"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {filteredData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-5 text-sm font-semibold">
                                            {row.analyticsProduct}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row.businessPurpose}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row.industry}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row.keyConsumers}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row.entities}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row.businessImpact}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    );
}
