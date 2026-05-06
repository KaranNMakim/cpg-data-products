import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSankeyData } from "../api";

/* ================= ADDED FOR DOWNLOAD ================= */
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
/* ===================================================== */

export default function DataProductDetails() {
    const navigate = useNavigate();
    const [rawData, setRawData] = useState([]);
    const location = useLocation();

    useEffect(() => {
        getSankeyData().then(setRawData).catch(console.error);
    }, []);

    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

    /* ================= FILTER STATE (MULTI SELECT) ================= */
    const [valueChainFilter, setValueChainFilter] = useState([]);
    const [functionFilter, setFunctionFilter] = useState([]);
    const [dataProductFilter, setDataProductFilter] = useState([]);
    const [analyticsProductFilter, setAnalyticsProductFilter] = useState([]);



    /* ================= RESET FILTERS ================= */
    const resetFilters = () => {
        setValueChainFilter([]);
        setFunctionFilter([]);
        setDataProductFilter([]);
        setAnalyticsProductFilter([]);
    };

    const params = new URLSearchParams(location.search);
    const dataProduct = params.get("name");
    const keyName = params.get("key_name");

    /* ================= INITIALIZE FILTER FROM SANKEY ================= */
    useEffect(() => {
        if (dataProduct) {
            setDataProductFilter([dataProduct]);
        }
    }, [dataProduct]);

    /* ================= TOGGLE HANDLER ================= */
    const toggleValue = (value, setter) => {
        if (!value) return;
        setter(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    /* ================= BASE ROW SELECTION ================= */
    const baseRows = useMemo(() => {
        if (!dataProduct) return [];

        if (keyName) {
            return rawData.filter(d => d[keyName] === dataProduct);
        }

        return rawData.filter(
            d => d["Data Product (Suite)"] === dataProduct
        );
    }, [rawData, dataProduct, keyName]);

    /* ================= CASCADED DATASETS FOR DROPDOWNS ================= */
    const valueChainData = useMemo(() => {
        return rawData.filter(r =>
            (!functionFilter.length || functionFilter.includes(r["Functions"])) &&
            (!dataProductFilter.length || dataProductFilter.includes(r["Data Product (Suite)"])) &&
            (!analyticsProductFilter.length || analyticsProductFilter.includes(r["Analytics Product / KPI"]))
        );
    }, [rawData, functionFilter, dataProductFilter, analyticsProductFilter]);

    const functionData = useMemo(() => {
        return rawData.filter(r =>
            (!valueChainFilter.length || valueChainFilter.includes(r["Value Chain"])) &&
            (!dataProductFilter.length || dataProductFilter.includes(r["Data Product (Suite)"])) &&
            (!analyticsProductFilter.length || analyticsProductFilter.includes(r["Analytics Product / KPI"]))
        );
    }, [rawData, valueChainFilter, dataProductFilter, analyticsProductFilter]);

    const dataProductData = useMemo(() => {
        return rawData.filter(r =>
            (!valueChainFilter.length || valueChainFilter.includes(r["Value Chain"])) &&
            (!functionFilter.length || functionFilter.includes(r["Functions"])) &&
            (!analyticsProductFilter.length || analyticsProductFilter.includes(r["Analytics Product / KPI"]))
        );
    }, [rawData, valueChainFilter, functionFilter, analyticsProductFilter]);

    const analyticsProductData = useMemo(() => {
        return rawData.filter(r =>
            (!valueChainFilter.length || valueChainFilter.includes(r["Value Chain"])) &&
            (!functionFilter.length || functionFilter.includes(r["Functions"])) &&
            (!dataProductFilter.length || dataProductFilter.includes(r["Data Product (Suite)"]))
        );
    }, [rawData, valueChainFilter, functionFilter, dataProductFilter]);

    /* ================= DROPDOWN OPTIONS ================= */
    const valueChainOptions = useMemo(
        () => [...new Set(valueChainData.map(r => r["Value Chain"]).filter(Boolean))],
        [valueChainData]
    );

    const functionOptions = useMemo(
        () => [...new Set(functionData.map(r => r["Functions"]).filter(Boolean))],
        [functionData]
    );

    const dataProductOptions = useMemo(
        () => [...new Set(dataProductData.map(r => r["Data Product (Suite)"]).filter(Boolean))],
        [dataProductData]
    );

    const analyticsProductOptions = useMemo(
        () => [...new Set(analyticsProductData.map(r => r["Analytics Product / KPI"]).filter(Boolean))],
        [analyticsProductData]
    );

    /* ================= FINAL FILTERED ROWS ================= */
    const rows = useMemo(() => {
        return rawData.filter(r =>
            (!valueChainFilter.length || valueChainFilter.includes(r["Value Chain"])) &&
            (!functionFilter.length || functionFilter.includes(r["Functions"])) &&
            (!dataProductFilter.length || dataProductFilter.includes(r["Data Product (Suite)"])) &&
            (!analyticsProductFilter.length || analyticsProductFilter.includes(r["Analytics Product / KPI"]))
        );
    }, [
        rawData,
        valueChainFilter,
        functionFilter,
        dataProductFilter,
        analyticsProductFilter
    ]);

    /* ================= EXCEL DOWNLOAD HANDLER (ADDED) ================= */
    const handleDownloadExcel = () => {
        if (!rows || rows.length === 0) return;

        const worksheetData = rows.map((row, index) => ({
            "Sr.No": index + 1,
            "Functions": row["Functions"],
            "Analytics Product (Use Case)": row["Analytics Product / KPI"],
            "Data Product": row["Data Product (Suite)"],
            "Value Chain": row["Value Chain"],
            "KPIs": row["KPI"],
            "Source System": row["Source System Name"],
            "Source System Type": row["Source System Type"]
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Details");
        XLSX.writeFile(workbook, "product_details.xlsx");
    };
    /* ===================================================== */


    if (!dataProduct) {
        return (
            <div className="p-10 text-center font-bold">
                No Data Product selected
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E9E4F5] w-full flex flex-col items-center pb-10" >

            {/* NAVIGATION BAR */}
            < div className="w-full flex justify-center py-0 z-[10000]" >
                <div className="flex items-center gap-3 bg-[#7B2CBF] px-6 py-1 rounded-full shadow-xl">
                    {["Value Chain Overview", "Data Product Lineage", "Product Details", "Data Product Details", "Analytics Product Details"].map(step => (
                        <span
                            key={step}
                            onClick={() => {
                                if (step === "Value Chain Overview") navigate("/overview");
                                if (step === "Data Product Lineage") navigate(-1);
                            }}
                            className={`px-5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all duration-300 ${step === "Product Details"
                                ? "bg-white text-[#5C2D91]"
                                : "text-white/80 hover:text-white"
                                }`}
                        >
                            {step}
                        </span>
                    ))}
                </div>
            </div >

            {/* ================= FILTER BAR ================= */}
            < div
                className="w-[96%] max-w-[1600px] flex gap-10 mb-4 items-end mt-4"
                style={{ zoom: 0.75 }
                }
            >
                {
                    [
                        { label: "Valuechain", selected: valueChainFilter, options: valueChainOptions, setter: setValueChainFilter },
                        { label: "Function", selected: functionFilter, options: functionOptions, setter: setFunctionFilter },
                        { label: "Data Product", selected: dataProductFilter, options: dataProductOptions, setter: setDataProductFilter },
                        { label: "Analytics Product", selected: analyticsProductFilter, options: analyticsProductOptions, setter: setAnalyticsProductFilter }
                    ].map(({ label, selected, options, setter }) => (
                        <div key={label} className="flex flex-col gap-1 w-[220px]">
                            <span className="text-xs font-bold px-4">
                                {label}:
                            </span>
                            <select
                                value=""
                                onChange={e => toggleValue(e.target.value, setter)}
                                className="bg-white border border-gray-300 rounded-[10px] px-4 py-2 text-sm"
                            >
                                <option value="" hidden disabled>
                                    {selected.length === 0
                                        ? "Search"
                                        : selected.length === 1
                                            ? selected[0]
                                            : "Multiple Selected"}
                                </option>
                                {options.map(o => (
                                    <option key={o} value={o}>
                                        {selected.includes(o) ? `✓ ${o}` : o}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))
                }

                {/*< button
                    onClick={resetFilters}
                    className="h-[38px] px-6 rounded-full bg-[#5D3891] text-white text-sm font-bold shadow-md hover:bg-[#4a2c74] transition-all"
                >
                    Reset Filters
                </button > */}
                {/* DOWNLOAD ICON */}
                {/*<Download
                    size={18}
                    className="cursor-pointer text-[#5D3891] hover:scale-110 transition"
                    onClick={handleDownloadExcel}
                    title="Download table as Excel"
                />*/}

                <div className="flex items-center gap-3">
                    <button
                        onClick={resetFilters}
                        className="h-[38px] px-6 rounded-full bg-[#5D3891] text-white text-sm font-bold shadow-md hover:bg-[#4a2c74] transition-all flex items-center"
                    >
                        Reset Filters
                    </button>

                    <div className="relative group flex items-center">
                        {/* DOWNLOAD ICON */}
                        <Download
                            size={24}
                            className="cursor-pointer text-[#5D3891] hover:scale-110 transition"
                            onClick={handleDownloadExcel}
                            title="Download Excel"
                        />

                        {/* TOOLTIP */}
                        <div
                            className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            hidden group-hover:block
            whitespace-nowrap
            bg-white text-gray-600 text-[11px]
            px-2 py-1 rounded shadow-lg
            z-[9999]
        "
                        >
                            Download Excel
                        </div>
                    </div>

                </div>



            </div >

            {/* ================= CONTENT CARD ================= */}
            < div className="w-[96%] max-w-[1600px] space-y-6" style={{ zoom: 0.75 }}>

                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white">
                    <div className="px-6 pb-4">
                        <h2 className="text-xl font-extrabold text-[#5C2D91] tracking-wide whitespace-nowrap">
                            Product Details
                        </h2>

                    </div>

                    <div className="w-full overflow-hidden rounded-3xl border border-gray-100 shadow-sm bg-white">

                        <table className="min-w-full table-auto border-collapse">

                            <thead className="bg-[#F9F8FF]">
                                <tr>
                                    {["Sr.No", "Functions", "Analytics Product(Use Case)", "Data Product", "Value Chain", "KPIs", "Source System", "Source System Type"].map(h => (
                                        <th key={h} className="px-6 py-5 text-center text-[12px] font-black  tracking-widest border-b">
                                            <span className="-translate-x-[6px] inline-block">
                                                {h}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50">

                                        <td className="px-6 py-5 text-sm font-semibold">{index + 1}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row["Functions"]}</td>
                                        {/*<td className="px-6 py-5 text-sm font-semibold">{row["Analytics Product / KPI"]}</td>*/}
                                        <td className="px-6 py-5 text-sm font-semibold text-[#5D3891]">
                                            <span
                                                className="cursor-pointer hover:underline"
                                                onMouseEnter={() => setTooltip(t => ({ ...t, visible: true }))}
                                                onMouseMove={e =>
                                                    setTooltip({ visible: true, x: e.clientX + 12, y: e.clientY + 12 })
                                                }
                                                onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                                                onClick={() =>
                                                    navigate(`/analytics-product-details?name=${encodeURIComponent(row["Analytics Product / KPI"])}`)
                                                }
                                            >
                                                {row["Analytics Product / KPI"]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-[#5D3891]">
                                            <span
                                                className="cursor-pointer hover:underline"
                                                onMouseEnter={() => setTooltip(t => ({ ...t, visible: true }))}
                                                onMouseMove={e =>
                                                    setTooltip({ visible: true, x: e.clientX + 12, y: e.clientY + 12 })
                                                }
                                                onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
                                                onClick={() =>
                                                    navigate(`/data-product-suite-details?name=${encodeURIComponent(row["Data Product (Suite)"])}`)
                                                }
                                            >
                                                {row["Data Product (Suite)"]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row["Value Chain"]}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row["KPI"]}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row["Source System Name"]}</td>
                                        <td className="px-6 py-5 text-sm font-semibold">{row["Source System Type"]}</td>


                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >

            {
                tooltip.visible && (
                    <div
                        className="fixed bg-white text-gray-600 text-[11px] font-semibold px-3 py-1.5 rounded-md shadow-lg border border-gray-200 z-[9999] pointer-events-none"
                        style={{ top: tooltip.y, left: tooltip.x }}
                    >
                        Click here for details
                    </div>
                )
            }

        </div >
    );
}




