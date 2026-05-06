import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDataCatalog, getETLMapping } from "../api";
import { Bold } from "lucide-react";

export default function DownloadETLCode() {
    const location = useLocation();
    const navigate = useNavigate();
    const { dataProduct } = location.state || {};

    const SUBSCRIPTION_ID = import.meta.env.VITE_AZ_SUBSCRIPTION_ID;
    const RESOURCE_GROUP = import.meta.env.VITE_AZ_RESOURCE_GROUP;
    const ADF_NAME = import.meta.env.VITE_AZ_ADF_NAME;

    const factoryPath =
        `/subscriptions/${SUBSCRIPTION_ID}` +
        `/resourceGroups/${RESOURCE_GROUP}` +
        `/providers/Microsoft.DataFactory` +
        `/factories/${ADF_NAME}`;

    const [dataCatalog, setDataCatalog] = useState({});
    const [etlMapping, setEtlMapping] = useState({});

    useEffect(() => {
        if (dataProduct) {
            getDataCatalog(dataProduct).then(setDataCatalog).catch(console.error);
        }
        getETLMapping().then(setEtlMapping).catch(console.error);
    }, [dataProduct]);

    const analyticsProducts = useMemo(() => {
        if (!dataProduct || !dataCatalog || Object.keys(dataCatalog).length === 0) return [];

        const etlAnalyticsProducts =
            etlMapping[dataProduct]?.analyticsProducts || {};

        return Object.keys(dataCatalog).map(
            (analyticsProductName) => ({
                name: analyticsProductName,
                pipelines:
                    etlAnalyticsProducts[analyticsProductName]?.pipelines || []
            })
        );
    }, [dataProduct, dataCatalog, etlMapping]);

    const handleETLDownload = async () => {
        try {
            const res = await fetch("/api/etl/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataProduct })
            });

            if (!res.ok) {
                throw new Error("ETL download failed");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `ETL_${dataProduct.replace(/\s+/g, "_")}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("Failed to download ETL code");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#F3F0FA"
            }}
        >
            {/* NAVIGATION BAR */}
            <div className="sticky top-0 z-[10000] bg-[#F3F0FA]">
                <div className="w-full flex justify-center py-0">
                    <div className="flex items-center gap-3 bg-[#7B2CBF] px-6 py-1 rounded-full shadow-xl">
                        {[
                            "Value Chain Overview",
                            "Data Product Lineage",
                            "Product Details",
                            "Data Product Details",
                            "ETL Code"
                        ].map(step => (
                            <span
                                key={step}
                                onClick={() => {
                                    if (step === "Value Chain Overview") navigate("/overview");
                                    if (step === "Product Details") navigate(-2);
                                    if (step === "Data Product Details") navigate(-1);
                                }}
                                className={`px-5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all duration-300 ${step === "ETL Code"
                                        ? "bg-white text-[#5C2D91]"
                                        : "text-white/80 hover:text-white"
                                    }`}
                            >
                                {step}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: "40px" }}>
                {/* Back Navigation */}
                <div
                    onClick={() => navigate(-1)}
                    style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#7B2CBF",
                        cursor: "pointer",
                        marginBottom: "10px",
                        marginTop: "-20px"
                    }}
                    onMouseEnter={e =>
                        (e.currentTarget.style.textDecoration = "underline")
                    }
                    onMouseLeave={e =>
                        (e.currentTarget.style.textDecoration = "none")
                    }
                >
                    Back to Data Product Details
                </div>

                {/* Page Header */}
                <div style={{ marginBottom: "24px", textAlign: "center", marginTop: "-20px" }}>
                    <div style={{ fontSize: "22px" }}>
                        <span style={{ color: "#4A1C78" }}>
                            {dataProduct || "Unknown Data Product"}
                        </span>
                    </div>
                </div>

                {/* Content */}
                {analyticsProducts.length === 0 ? (
                    <div
                        style={{
                            background: "#fff",
                            padding: "20px",
                            borderRadius: "12px",
                            color: "#777"
                        }}
                    >
                        No Analytics Products found.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {analyticsProducts.map((ap, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: "#FFFFFF",
                                    borderRadius: "16px",
                                    padding: "20px",
                                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)"
                                }}
                            >
                                {/* Analytics Product Header */}
                                <div
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: "700",
                                        color: "#4A1C78",
                                        marginBottom: "12px"
                                    }}
                                >
                                    {ap.name}
                                </div>

                                {/* Factory Link */}
                                <div style={{ marginBottom: "10px" }}>
                                    <a
                                        href={`https://adf.azure.com/en/authoring?factory=${encodeURIComponent(
                                            factoryPath
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#5C2D91",
                                            textDecoration: "none"
                                        }}
                                        onMouseEnter={e =>
                                            (e.currentTarget.style.textDecoration = "underline")
                                        }
                                        onMouseLeave={e =>
                                            (e.currentTarget.style.textDecoration = "none")
                                        }
                                    >
                                        Open Factory
                                    </a>
                                </div>

                                {/* Pipeline Links */}
                                {ap.pipelines.length === 0 ? (
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#999",
                                            fontStyle: "italic"
                                        }}
                                    >
                                        No pipelines configured
                                    </div>
                                ) : (
                                    <ul
                                        style={{
                                            listStyle: "none",
                                            padding: 0,
                                            margin: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "6px"
                                        }}
                                    >
                                        {ap.pipelines.map((pipeline, i) => (
                                            <li key={i}>
                                                <a
                                                    href={`https://adf.azure.com/en/authoring/pipeline/${encodeURIComponent(
                                                        pipeline
                                                    )}?factory=${encodeURIComponent(factoryPath)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: "13px",
                                                        fontWeight: "600",
                                                        color: "#5C2D91",
                                                        textDecoration: "none"
                                                    }}
                                                    onMouseEnter={e =>
                                                        (e.currentTarget.style.textDecoration = "underline")
                                                    }
                                                    onMouseLeave={e =>
                                                        (e.currentTarget.style.textDecoration = "none")
                                                    }
                                                >
                                                    {pipeline}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* DOWNLOAD ETL CODE SECTION – OPTION 4 */}
                                <div
                                    style={{
                                        marginTop: "16px",
                                        paddingTop: "12px",
                                        borderTop: "1px solid #E6DDF5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "700",
                                            color: "#4A1C78"
                                        }}
                                    >
                                        Download ETL Code
                                    </div>
                                </div>

                                <button
                                    style={{
                                        marginTop: "8px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        padding: "6px 14px",
                                        borderRadius: "20px",
                                        border: "1px solid #7B2CBF",
                                        background: "#7B2CBF",
                                        color: "#FFFFFF",
                                        cursor: "pointer"
                                    }}
                                    onClick={handleETLDownload}
                                >
                                    Download ZIP
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
