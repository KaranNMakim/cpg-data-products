import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import mermaid from "mermaid/dist/mermaid.esm.min.mjs";
import { getDataCatalog } from "../api";
//import { jsPDF } from "jspdf";

/* ============================================================
   🔥 FIX: Sanitize attribute names for Mermaid ER grammar
   ============================================================ */
const sanitizeAttr = (attr) =>
    attr
        .replace(/\(.*?\)/g, "")
        .trim()
        .replace(/[^a-zA-Z0-9_]/g, "_");

/* 🔥 FIX: Sanitize table names */
const sanitizeTableName = (name) =>
    name.replace(/[^a-zA-Z0-9_]/g, "_");

/* 🔥 Attribute display limit */
const MAX_ATTRS = 5;

export default function GenerateERDiagram() {
    const navigate = useNavigate();
    const diagramRef = useRef(null);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const dataProductName = params.get("name");

    const [loading, setLoading] = useState(false);
    const [erDiagram, setErDiagram] = useState(null);
    const [error, setError] = useState(null);
    const [dataCatalog, setDataCatalog] = useState({});

    useEffect(() => {
        if (dataProductName) {
            getDataCatalog(dataProductName).then(setDataCatalog).catch(console.error);
        }
    }, [dataProductName]);

    /* ============================================================
       STEP 1: BUILD COMPLETE LINEAGE MODEL (DETERMINISTIC)
       ============================================================ */
    const deterministicModel = useMemo(() => {
        if (!dataProductName || !dataCatalog || Object.keys(dataCatalog).length === 0) return null;

        const rawTables = new Set();
        const derivedTables = new Set();
        const factTables = new Set();
        const tableEdges = new Set();
        const tableAttributes = {};
        const allTables = new Set();

        // 🔥 NEW: Fact → Raw structural mapping
        const factToRawMap = new Map();

        const ensureTable = (tbl) => {
            const safe = sanitizeTableName(tbl);
            if (!tableAttributes[safe]) {
                tableAttributes[safe] = [];
            }
            allTables.add(safe);
            return safe;
        };

        const addAttr = (table, attrObj) => {
            const safe = ensureTable(table);
            tableAttributes[safe].push(attrObj);
        };

        Object.values(dataCatalog).forEach(analyticsProduct => {
            Object.values(analyticsProduct).forEach(kpiObj => {
                Object.entries(kpiObj).forEach(([tableName, attributes]) => {

                    const safeTable = ensureTable(tableName);
                    factTables.add(safeTable);

                    if (!factToRawMap.has(safeTable)) {
                        factToRawMap.set(safeTable, new Set());
                    }

                    if (Array.isArray(attributes)) {
                        attributes.forEach(attr => {
                            if (!attr.consumption_table_attribute) return;

                            const rawAttr = attr.consumption_table_attribute.trim();
                            const cleanAttr = sanitizeAttr(rawAttr);
                            const dataType = (attr.data_type || "string").toLowerCase();

                            const keyMatch = rawAttr.match(/\((PK|FK)\)/i);
                            const keyType = keyMatch ? keyMatch[1].toUpperCase() : null;

                            if (attr.raw_table) {
                                const safeRaw = ensureTable(attr.raw_table);
                                rawTables.add(safeRaw);

                                // 🔥 Collect raw tables structurally
                                factToRawMap.get(safeTable).add(safeRaw);

                                addAttr(safeRaw, {
                                    name: cleanAttr,
                                    raw: rawAttr,
                                    type: dataType,
                                    key: keyType
                                });
                            }

                            addAttr(safeTable, {
                                name: cleanAttr,
                                raw: rawAttr,
                                type: dataType,
                                key: keyType
                            });
                        });
                    }
                });
            });
        });

        // 🔥 CREATE EDGES ONCE PER FACT–RAW RELATIONSHIP
        factToRawMap.forEach((rawSet, fact) => {
            rawSet.forEach(raw => {
                tableEdges.add(`${raw}||--o{${fact}`);
            });
        });

        Object.keys(dataCatalog).forEach(tbl => {
            ensureTable(tbl);
        });

        return {
            rawTables,
            derivedTables,
            factTables,
            tableEdges,
            tableAttributes,
            allTables
        };
    }, [dataProductName, dataCatalog]);


    /* ============================================================
       STEP 2: GENERATE ER DIAGRAM
       ============================================================ */
    const generateERDiagram = () => {
        try {
            setLoading(true);
            setError(null);

            let er = "erDiagram\n\n";

            deterministicModel.allTables.forEach(table => {
                const attrs = deterministicModel.tableAttributes[table] || [];
                const hasEdges = [...deterministicModel.tableEdges].some(
                    e => e.startsWith(`${table}||`) || e.endsWith(`{${table}`)
                );

                if (attrs.length === 0 && !hasEdges) return;

                er += `  **${table}** {\n`;

                // 🔥 HEADER INJECTION: This creates the visual "header" row
                er += `    DATA_TYPE ATTRIBUTE\n`;

                const visibleAttrs = attrs.slice(0, MAX_ATTRS);
                visibleAttrs.forEach(a => {
                    const match = a.raw?.match(/\((PK|FK)\)/i);
                    // Formatting data type and name to align under headers
                    er += match
                        ? `    ${a.type} ${a.name} ${match[1].toUpperCase()}\n`
                        : `    ${a.type} ${a.name}\n`;
                });

                if (attrs.length > MAX_ATTRS) {
                    const remaining = attrs.length - MAX_ATTRS;
                    er += `    string plus_${remaining}_more\n`;
                }

                er += "  }\n\n";
            });

            deterministicModel.tableEdges.forEach(edge => {
                const [from, to] = edge.split("||--o{");
                er += `  **${from}** ||--o{ **${to}** : feeds\n`;
                //er += `  **${from}** ||--o{ **${to}** : ${from}_feeds\n`;
            });

            setErDiagram(er);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* ============================================================
       STEP 2.8: DOWNLOAD ER DIAGRAM AS CSV
       ============================================================ */
    {/*}  const downloadAsCSV = () => {
        if (!deterministicModel || !erDiagram) return;
 
        let csv = "Table_Type,Table_Name,Attribute,Data_Type\n";
 
        deterministicModel.tableEdges.forEach(edge => {
            const [from, to] = edge.split("||--o{");
 
            const sourceAttrs = deterministicModel.tableAttributes[from] || [];
            const targetAttrs = deterministicModel.tableAttributes[to] || [];
 
            sourceAttrs.forEach(attr => {
                csv += `Source,${from},${attr.name},${attr.type}\n`;
            });
 
            targetAttrs.forEach(attr => {
                csv += `Target,${to},${attr.name},${attr.type}\n`;
            });
        });
 
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
 
        requestAnimationFrame(() => {
            const link = document.createElement("a");
            link.href = url;
            link.download = `${dataProductName || "ER_Diagram"}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
    };*/}
    const downloadAsCSV = () => {
        if (!deterministicModel || !erDiagram) return;

        let csv = "Table_Type,Table_Name,Attribute,Data_Type,Key_Type\n";

        deterministicModel.tableEdges.forEach(edge => {
            const [from, to] = edge.split("||--o{");

            const sourceAttrs = deterministicModel.tableAttributes[from] || [];
            const targetAttrs = deterministicModel.tableAttributes[to] || [];

            sourceAttrs.forEach(attr => {
                csv += `Source,${from},${attr.name},${attr.type},${attr.key ?? ""}\n`;
            });

            targetAttrs.forEach(attr => {
                csv += `Target,${to},${attr.name},${attr.type},${attr.key ?? ""}\n`;
            });
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);

        requestAnimationFrame(() => {
            const link = document.createElement("a");
            link.href = url;
            link.download = `${dataProductName || "ER_Diagram"}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        });
    };

    /* ============================================================
       STEP 3: MERMAID RENDER
       ============================================================ */

    useEffect(() => {
        if (!erDiagram || !diagramRef.current) return;

        const render = async () => {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    securityLevel: "loose",
                    theme: "default",
                    er: {
                        useMaxWidth: false
                    }
                });



                const { svg } = await mermaid.render(
                    "erDiagramSvg_" + Date.now(),
                    erDiagram
                );

                diagramRef.current.innerHTML = svg;

                const svgEl = diagramRef.current.querySelector("svg");
                if (svgEl) {
                    svgEl.style.maxWidth = "none";
                    svgEl.style.maxHeight = "none";
                    svgEl.style.width = "auto";
                    svgEl.style.height = "auto";
                    svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

                    // 🔥 ADD COLOR TO more_attributes ROWS
                    const allTextElements = svgEl.querySelectorAll("text");
                    allTextElements.forEach(textEl => {
                        const textContent = textEl.textContent || "";
                        // Match pattern like "plus_12_more" or "more_attributes"
                        if (textContent.includes("plus_") && textContent.includes("_more")) {
                            const parentRect = textEl.closest("g")?.querySelector("rect");
                            if (parentRect) {
                                parentRect.setAttribute("fill", "#FFF4E6");
                                parentRect.setAttribute("stroke", "#FF9800");
                                parentRect.setAttribute("stroke-width", "2");
                            }
                            textEl.setAttribute("fill", "#E65100");
                            textEl.setAttribute("font-weight", "bold");

                            // 🔥 Replace "plus_N_more" with "+N more"
                            const match = textContent.match(/plus_(\d+)_more/);
                            if (match) {
                                textEl.textContent = `+${match[1]} more`;
                            }
                        }
                    });

                    const container = diagramRef.current;
                    const svgBBox = svgEl.getBBox();

                    const scaleX = container.clientWidth / svgBBox.width;
                    const scaleY = container.clientHeight / svgBBox.height;

                    /*
                      Prefer vertical fit.
                      Only respect horizontal scaling if diagram truly overflows.
                    */
                    let scale = Math.min(scaleY, 1);

                    if (svgBBox.width > container.clientWidth) {
                        scale = Math.min(scaleX, scaleY, 1);
                    }

                    /* 🔥 Prevent over-shrinking */
                    scale = Math.max(scale, 0.90);


                    /* 🔥 Apply scaling ONLY when needed */
                    if (scale < 1) {
                        svgEl.style.transform = `scale(${scale})`;
                        svgEl.style.transformOrigin = "center";
                    } else {
                        svgEl.style.transform = "";
                    }

                }



            } catch {
                setError("Failed to render ER diagram (Mermaid syntax)");
            }
        };

        render();
    }, [erDiagram]);

    return (
        <div className="min-h-screen bg-[#E9E4F5]">

      {/* 🔷 HEADER */}
   
<div className="bg-gradient-to-r from-[#5C2D91] to-[#7A4FB3] text-white px-6 py-2 flex justify-center gap-6">
  {[
    { label: "Data Product Registry", path: "/screen-1" },
    { label: "Function Mapping", path: "/screen-3" },
    { label: "Data Product Lineage"},
    { label: "Schema & Tables"},
    { label: "Analytics Product"},
    { label: "ER Diagram", path: "/generate-er-diagram" },
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

            <div className="w-full px-6 pt-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-[#5C2D91] mb-4"
        >
          ← Back to Schema & Tables
        </button>

                <div className="text-xl font-bold text-[#4A1C78] absolute left-1/2 -translate-x-1/2">
                    {dataProductName || "Unknown Data Product"}
                </div>
            </div>


            <div className="w-full px-4 mt-2">
                <div className="bg-white rounded-[20px] p-4 shadow-xl">
                    {/*} <div className="text-lg font-extrabold text-gray-800 mb-2">
                        ER Diagram
                    </div>*/}

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4 relative z-20">
                            <button
                                onClick={generateERDiagram}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-[#7B2CBF] text-white text-xs font-semibold hover:bg-[#5C2D91] disabled:opacity-50"
                            >
                                {loading ? "Generating..." : "Generate ER Diagram"}
                            </button>

                            <button
                                onClick={downloadAsCSV}
                                disabled={!erDiagram}
                                title="Download ER Diagram as CSV"
                                className="text-[#5C2D91] hover:opacity-70 disabled:opacity-30"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </button>
                        </div>

                        <div
                            ref={diagramRef}
                            className="h-[405px] border-2 border-dashed border-[#7B2CBF]
                                       rounded-xl overflow-hidden p-4 flex items-center justify-center"
                        >
                            {!erDiagram && !loading && !error && (
                                <div className="text-gray-400 text-sm font-semibold">
                                    Click "Generate ER Diagram" to view lineage
                                </div>
                            )}
                            {loading && (
                                <div className="text-[#7B2CBF] text-sm animate-pulse font-semibold">
                                    Building ER from catalog...
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs">
                            ❌ {error}
                        </div>
                    )}
                    {/* LEGEND */}
                    <div className="mt-4 text-[11px] text-gray-600">
                        <span className="font-bold text-[#5C2D91]">Note: </span>{" "}
                        <span className="font-semibold italic text-[#5C2D91]">plus_N_more</span>{" "}
                        <span className="italic">
                            indicates that the table contains additional attributes
                            that are not shown in this view to maintain diagram clarity where
                        </span>{" "}
                        <span className="font-semibold italic">(N=Number of additional attributes)</span>
                    </div>

                </div>
            </div>
        </div>
    );
}