import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDataCatalog, getETLMapping, getSourceTablePaths } from "../api";

export default function DataProductSuiteDetails() {
    const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const dataProductName = params.get("name");
    const [showPopup, setShowPopup] = useState(false);
    const [dataCatalog, setDataCatalog] = useState({});
    const [etlMapping, setEtlMapping] = useState({});
    const [sourceTablesPaths, setSourceTablesPaths] = useState({});

    useEffect(() => {
        if (dataProductName) {
            getDataCatalog(dataProductName).then(setDataCatalog).catch(console.error);
        }
        getETLMapping().then(setEtlMapping).catch(console.error);
        getSourceTablePaths().then(setSourceTablesPaths).catch(console.error);
    }, [dataProductName]);

    const analyticsProducts = useMemo(() => {
        if (!dataProductName || !dataCatalog || Object.keys(dataCatalog).length === 0) return [];

        const etlAnalyticsProducts =
            etlMapping[dataProductName]?.analyticsProducts || {};

        return Object.keys(dataCatalog).map(
            (analyticsProductName) => {
                const pipelines =
                    etlAnalyticsProducts[analyticsProductName]?.pipelines || [];

                return {
                    name: analyticsProductName,
                    pipelines
                };
            }
        );
    }, [dataProductName, dataCatalog, etlMapping]);

    const SUBSCRIPTION_ID = import.meta.env.VITE_AZ_SUBSCRIPTION_ID;
    const RESOURCE_GROUP = import.meta.env.VITE_AZ_RESOURCE_GROUP;
    const ADF_NAME = import.meta.env.VITE_AZ_ADF_NAME;

    const factoryPath =
        `/subscriptions/${SUBSCRIPTION_ID}` +
        `/resourceGroups/${RESOURCE_GROUP}` +
        `/providers/Microsoft.DataFactory` +
        `/factories/${ADF_NAME}`;

    /* ================= AZURE STORAGE CONFIG ================= */

    const STORAGE_ACCOUNT = import.meta.env.VITE_AZ_STORAGE_ACCOUNT_NAME;
    const STORAGE_CONTAINER = import.meta.env.VITE_AZ_STORAGE_CONTAINER_NAME;

    // ✅ UPDATED: Open container root ONLY (no base folder)
    const getStorageUrl = () => {
        const storageAccountId = encodeURIComponent(
            `/subscriptions/${SUBSCRIPTION_ID}` +
            `/resourceGroups/${RESOURCE_GROUP}` +
            `/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT}`
        );

        return (
            `https://portal.azure.com/#view/Microsoft_Azure_Storage/ContainerMenuBlade/~/overview` +
            `/storageAccountId/${storageAccountId}` +
            `/path/${STORAGE_CONTAINER}`
        );
    };
    /* ================= DERIVE SOURCE & TARGET TABLES ================= */

    const { rawTables, consumptionTables } = useMemo(() => {
        const rawSet = new Set();
        const consumptionMap = {};

        if (dataProductName && dataCatalog && Object.keys(dataCatalog).length > 0) {
            Object.values(dataCatalog).forEach(analyticsProduct => {
                Object.values(analyticsProduct).forEach(kpiObj => {
                    Object.entries(kpiObj).forEach(([consumptionTable, attributes]) => {

                        if (!consumptionMap[consumptionTable]) {
                            consumptionMap[consumptionTable] = {
                                keys: {},
                                others: new Set()
                            };
                        }

                        attributes.forEach(attr => {

                            if (attr.raw_table) {
                                rawSet.add(attr.raw_table);
                            }

                            if (
                                attr.consumption_table_attribute &&
                                attr.consumption_table_attribute.trim() !== ""
                            ) {
                                const match = attr.consumption_table_attribute.match(
                                    /^(.+?)\s*\((PK|FK)\)$/i
                                );

                                if (match) {
                                    const columnName = match[1].trim();
                                    const keyType = match[2].toUpperCase();

                                    if (!consumptionMap[consumptionTable].keys[columnName]) {
                                        consumptionMap[consumptionTable].keys[columnName] = keyType;
                                    }
                                    else if (
                                        consumptionMap[consumptionTable].keys[columnName] === "FK" &&
                                        keyType === "PK"
                                    ) {
                                        consumptionMap[consumptionTable].keys[columnName] = "PK";
                                    }
                                }
                                else {
                                    consumptionMap[consumptionTable].others.add(
                                        attr.consumption_table_attribute.trim()
                                    );
                                }
                            }
                        });
                    });
                });
            });
        }

        const limitedConsumptionTables = {};

        Object.entries(consumptionMap).forEach(([table, { keys, others }]) => {
            const pks = [];
            const fks = [];

            Object.entries(keys).forEach(([column, keyType]) => {
                if (keyType === "PK") {
                    pks.push(`${column} (PK)`);
                } else {
                    fks.push(`${column} (FK)`);
                }
            });

            let result = [...pks, ...fks];

            if (result.length > 5) {
                result = result.slice(0, 5);
            }

            if (result.length < 5) {
                const fillers = Array.from(others)
                    .filter(attr => !result.some(r => r.startsWith(attr)))
                    .slice(0, 5 - result.length);

                result = [...result, ...fillers];
            }

            limitedConsumptionTables[table] = result;
        });

        return {
            rawTables: Array.from(rawSet),
            consumptionTables: limitedConsumptionTables
        };
    }, [dataProductName, dataCatalog]);

    const handleGenerateER = () => {
        if (dataProductName) {
            navigate(`/generate-er-diagram?name=${encodeURIComponent(dataProductName)}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#E9E4F5]">

            {/* NAVIGATION BAR */}
        {/* 🔷 HEADER (FULL WIDTH — FIXED) */}
<div className="bg-gradient-to-r from-[#5C2D91] to-[#7A4FB3] text-white px-6 py-2 flex justify-center gap-6">
  {[
    { label: "Data Product Registry", path: "/screen-1" },
    { label: "Function Mapping", path: "/screen-3" },
    { label: "Data Product Lineage"},
    { label: "Schema & Tables", path: "/data-product-suite-details" },
    { label: "Analytics Product"},
    { label: "ER Diagram"},
  ].map((tab, i) => (
    <button
      key={i}
      onClick={() => navigate(tab.path)}
className={`px-3 py-1 rounded-full transition ${
    tab.label === "Schema & Tables"
        ? "bg-white text-[#5C2D91] font-semibold"
        : "hover:bg-white/20"
}`}
    >
      {tab.label}
    </button>
  ))}
</div>

            {/* PAGE CONTEXT HEADER */}
            <div className="w-full px-6 pt-3">

        <button
          onClick={() => navigate(-1)}
          className="text-[#5C2D91] mb-4"
        >
          ← Back to Function Mapping
        </button>
                        <div className="text-xl font-bold text-[#4A1C78] absolute left-1/2 -translate-x-1/2">
                    {dataProductName || "Unknown Data Product"}
                </div>

                <div className="mt-2 flex items-center gap-3">
                    <button
                        onClick={handleGenerateER}
                        className="
                            inline-flex items-center
                            px-3 py-1
                            text-[11px] font-semibold
                            bg-[#7B2CBF] text-white
                            rounded-full
                            shadow-sm
                            hover:bg-[#6A22B8]
                            transition
                        "
                    >
                        Generate ER Diagram
                    </button>

                    <button
                        onClick={() => setShowPopup(true)}
                        className="
                            inline-flex items-center
                            px-3 py-1
                            text-[11px] font-semibold
                            bg-[#7B2CBF] text-white
                            rounded-full
                            shadow-sm
                            hover:bg-[#6A22B8]
                            transition
                        "
                    >
                        ETL Code
                    </button>
                </div>
            </div>

            {/* ================= LINEAGE STRUCTURE ================= */}
            <div className="w-full px-5 mt-5">
                <div className="bg-white rounded-[32px] p-6 shadow-xl">
                    <div className="grid grid-cols-3 gap-10 items-start">

                        {/* SOURCE TABLES */}
                        <div className="relative left-6">
                            <div className="text-sm font-bold text-gray-800 mb-3 text-left">
                                SOURCE TABLES
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-start">
                                {rawTables.map((table, idx) => {
                                    const isRawTable = table.startsWith("raw_");
                                    const url = isRawTable ? getStorageUrl(table) : null;

                                    return url ? (
                                        <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#7B2CBF] text-white text-center text-xs font-bold px-2 py-1 shadow-md w-[170px]"
                                        >
                                            {table}
                                        </a>
                                    ) : (
                                        <div
                                            key={idx}
                                            className="bg-[#7B2CBF] text-white text-center text-xs font-bold px-2 py-1 shadow-md w-[170px]"
                                        >
                                            {table}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* FLOW */}
                        <div className="flex justify-start items-center h-full pl-32">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className="w-4 h-4 border-r-[4px] border-b-[4px]
                                        border-[#7B2CBF] rotate-[-45deg] opacity-80"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* TARGET TABLES */}
                        <div className="relative right-6">
                            <div className="text-sm font-bold text-gray-800 mb-3 text-left">
                                TARGET TABLES
                            </div>

                            <div className="grid grid-cols-2 gap-8 items-start">
                                {Object.entries(consumptionTables).map(
                                    ([table, attributes], idx) => (
                                        <div
                                            key={idx}
                                            className="overflow-hidden shadow-md bg-[#D9C6F0] w-[195px]"
                                        >
                                            <div className="bg-[#7B2CBF] text-white text-xs font-bold px-2 py-1 truncate">
                                                {table}
                                            </div>
                                            <div className="divide-y divide-white/40">
                                                {attributes.map((attr, i) => (
                                                    <div
                                                        key={i}
                                                        className="px-2 py-1 text-[11px] font-semibold text-[#4A1C78]"
                                                    >
                                                        {attr}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {showPopup && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowPopup(false)}
                    />

                    <div
                        className="
                            relative bg-white rounded-2xl shadow-2xl
                            w-[90vw] max-w-[900px]
                            h-[70vh] max-h-[600px]
                            p-6 overflow-auto z-10
                        "
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-sm font-bold text-[#5C2D91]">
                                ETL Code – {dataProductName}
                            </div>

                            <button
                                onClick={() => setShowPopup(false)}
                                className="
                                    px-3 py-1
                                    text-[11px] font-semibold
                                    bg-[#7B2CBF] text-white
                                    rounded-full
                                    hover:bg-[#6A22B8]
                                    transition
                                "
                            >
                                Close
                            </button>
                        </div>

                        {analyticsProducts.length === 0 ? (
                            <div className="text-[12px] text-gray-500">
                                No Analytics Product / KPI found.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {analyticsProducts.map((analyticsProduct, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-[#E0D4F7] rounded-xl p-4"
                                    >
                                        <div className="font-semibold text-[#4A1C78] mb-2">
                                            {analyticsProduct.name}
                                        </div>

                                        <ul className="space-y-1 text-[12px]">
                                            <li>
                                                <a
                                                    href={`https://adf.azure.com/en/authoring?factory=${encodeURIComponent(factoryPath)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#7B2CBF] underline hover:text-[#5C2D91]"
                                                >
                                                    Open Factory
                                                </a>
                                            </li>

                                            {analyticsProduct.pipelines.length === 0 ? (
                                                <li className="text-gray-400 italic">
                                                    No pipelines configured
                                                </li>
                                            ) : (
                                                analyticsProduct.pipelines.map((pipeline, pIdx) => (
                                                    <li key={pIdx}>
                                                        <a
                                                            href={`https://adf.azure.com/en/authoring/pipeline/${encodeURIComponent(
                                                                pipeline
                                                            )}?factory=${encodeURIComponent(factoryPath)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#7B2CBF] underline hover:text-[#5C2D91]"
                                                        >
                                                            {pipeline}
                                                        </a>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
