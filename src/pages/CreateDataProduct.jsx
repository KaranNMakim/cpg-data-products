import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDataProducts } from "../api";

// ─── AUTOCOMPLETE INPUT ─────────────────────────────────────
function AutocompleteInput({ label, value, onChange, placeholder, suggestions = [], required }) {
  const [show, setShow] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (val) => {
    onChange(val);
    const f = suggestions.filter((s) => s.toLowerCase().includes(val.toLowerCase()));
    setFiltered(f);
    setShow(val.length > 0 && f.length > 0);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && " *"}</label>
      <input type="text" value={value} onChange={(e) => handleInput(e.target.value)}
        onFocus={() => { if (value && filtered.length) setShow(true); }}
        placeholder={placeholder}
        className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
      {show && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-purple-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
          {filtered.map((s) => (
            <div key={s} onClick={() => { onChange(s); setShow(false); }}
              className="px-3 py-2 text-sm hover:bg-purple-50 cursor-pointer">{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAG INPUT (for KPIs) ───────────────────────────────────
function TagInput({ label, tags, setTags, placeholder, suggestions = [] }) {
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTag = (val) => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
    setShow(false);
  };

  const removeTag = (idx) => setTags(tags.filter((_, i) => i !== idx));

  const handleInput = (val) => {
    setInput(val);
    if (val.length > 0 && suggestions.length > 0) {
      const f = suggestions.filter((s) => s.toLowerCase().includes(val.toLowerCase()) && !tags.includes(s));
      setFiltered(f);
      setShow(f.length > 0);
    } else {
      setShow(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            {tag}
            <button onClick={() => removeTag(i)} className="text-orange-400 hover:text-orange-600 ml-0.5">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => handleInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { e.preventDefault(); addTag(input); } }}
          placeholder={placeholder}
          className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <button type="button" onClick={() => addTag(input)} disabled={!input.trim()}
          className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 disabled:opacity-40">
          Add
        </button>
      </div>
      {show && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-purple-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
          {filtered.map((s) => (
            <div key={s} onClick={() => addTag(s)}
              className="px-3 py-2 text-sm hover:bg-purple-50 cursor-pointer">{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TABLE INPUT (for source tables) ────────────────────────
function TableInput({ tables, setTables }) {
  const [tableName, setTableName] = useState("");

  const addTable = () => {
    const trimmed = tableName.trim();
    if (trimmed && !tables.includes(trimmed)) {
      setTables([...tables, trimmed]);
    }
    setTableName("");
  };

  const removeTable = (idx) => setTables(tables.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Source Tables</label>
      <p className="text-xs text-gray-400 mb-3">Add the raw source table names that feed this data product.</p>
      <div className="flex gap-2 mb-3">
        <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && tableName.trim()) { e.preventDefault(); addTable(); } }}
          placeholder="e.g. raw_market_category_fact"
          className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <button type="button" onClick={addTable} disabled={!tableName.trim()}
          className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 disabled:opacity-40">
          Add
        </button>
      </div>
      {tables.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tables.map((t, i) => (
            <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
              {t}
              <button onClick={() => removeTable(i)} className="text-blue-400 hover:text-blue-600 ml-0.5">&times;</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STEP INDICATOR ─────────────────────────────────────────
const steps = [
  { num: 1, label: "Basic Details" },
  { num: 2, label: "KPIs" },
  { num: 3, label: "Source Tables" },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            current === s.num ? "bg-[#5C2D91] text-white shadow-md" :
            current > s.num ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
          }`}>
            {current > s.num ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold">{s.num}</span>
            )}
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 h-0.5 ${current > s.num ? "bg-green-300" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────
export default function CreateDataProduct() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Options for dropdowns / autocomplete
  const [functionOptions, setFunctionOptions] = useState([]);
  const [valueChainOptions, setValueChainOptions] = useState([]);
  const [kpiSuggestions, setKpiSuggestions] = useState([]);
  const [consumerAlignOptions, setConsumerAlignOptions] = useState([]);
  const [sourceAlignOptions, setSourceAlignOptions] = useState([]);

  // Step 1: Basic details
  const [form, setForm] = useState({
    "Data Product": "",
    "Analytics Product/KPI": "",
    "Source System Name": "",
    "Functions": "",
    "Value Chain": "",
    "Consumer Align Data Product": "",
    "Source Align Data Product": "",
    "Source System Type": "Internal",
  });

  // Step 2: KPIs
  const [kpis, setKpis] = useState([]);

  // Step 3: Source tables
  const [sourceTables, setSourceTables] = useState([]);

  // Load options from existing data
  useEffect(() => {
    getDataProducts().then((data) => {
      setFunctionOptions([...new Set(data.map((d) => d["Functions"]).filter(Boolean))].sort());
      setValueChainOptions([...new Set(data.map((d) => d["Value Chain"]).filter(Boolean))].sort());
      setConsumerAlignOptions([...new Set(data.map((d) => d["Consumer Align Data Product"]).filter(Boolean))].sort());
      setSourceAlignOptions([...new Set(data.map((d) => d["Source Align Data Product"]).filter(Boolean))].sort());
    });
    fetch("/api/sankey").then((r) => r.json()).then((data) => {
      const allKpis = data.flatMap((d) => (d["KPI"] || "").split(",").map((k) => k.trim())).filter(Boolean);
      setKpiSuggestions([...new Set(allKpis)].sort());
    });
  }, []);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      // 1. Create the data product
      const res = await fetch("/api/data-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create data product");

      // 2. Create sankey entry (with KPIs)
      if (kpis.length > 0 || form["Data Product"]) {
        await fetch("/api/sankey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "Functions": form["Functions"],
            "Value Chain": form["Value Chain"],
            "Data Product (Suite)": form["Data Product"],
            "Analytics Product / KPI": form["Analytics Product/KPI"],
            "Consumer Align Data Product": form["Consumer Align Data Product"],
            "Source Align Data Product": form["Source Align Data Product"],
            "Source System Name": form["Source System Name"],
            "Source System Type": form["Source System Type"],
            "KPI": kpis.join(", "),
          }),
        });
      }

      // 3. Create data catalog entries (source tables)
      if (sourceTables.length > 0) {
        await fetch("/api/data-catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data_product_suite: form["Data Product"],
            analytics_product: form["Analytics Product/KPI"],
            tables: sourceTables,
          }),
        });
      }

      // Navigate to the new product detail page
      navigate(`/screen-2/${encodeURIComponent(form["Data Product"])}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create data product. Is the server running?");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300";

  const canNext = () => {
    if (step === 1) return form["Data Product"] && form["Functions"] && form["Value Chain"];
    return true;
  };

  return (
    <div className="min-h-screen bg-[#f6f2fb]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5C2D91] to-[#7A4FB3] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Create New Data Product</h1>
            <p className="text-purple-200 text-sm">Define properties, assign KPIs, and configure source tables</p>
          </div>
          <button onClick={() => navigate("/screen-1")}
            className="text-white/70 hover:text-white text-sm border border-white/30 px-4 py-1.5 rounded-lg hover:bg-white/10">
            Cancel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <StepIndicator current={step} />

        {/* ─── STEP 1: Basic Details ─── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-purple-100">
            <h2 className="text-lg font-bold text-[#5C2D91] mb-1">Basic Details</h2>
            <p className="text-sm text-gray-400 mb-6">Core information about the data product</p>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Product Name *</label>
                  <input type="text" value={form["Data Product"]}
                    onChange={(e) => handleChange("Data Product", e.target.value)}
                    placeholder="e.g. Supply Chain Intelligence" className={inputClass} />
                </div>
                <AutocompleteInput label="Analytics Product / KPI" value={form["Analytics Product/KPI"]}
                  onChange={(v) => handleChange("Analytics Product/KPI", v)}
                  placeholder="e.g. Brand Equity Tracking"
                  suggestions={[...new Set([...consumerAlignOptions.map(() => ""), ...kpiSuggestions].filter(Boolean))].length ? kpiSuggestions : []} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Function *</label>
                  <select value={form["Functions"]} onChange={(e) => handleChange("Functions", e.target.value)} className={inputClass}>
                    <option value="">Select a function...</option>
                    {functionOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value Chain *</label>
                  <select value={form["Value Chain"]} onChange={(e) => handleChange("Value Chain", e.target.value)} className={inputClass}>
                    <option value="">Select a value chain...</option>
                    {valueChainOptions.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <AutocompleteInput label="Consumer Align Data Product" value={form["Consumer Align Data Product"]}
                  onChange={(v) => handleChange("Consumer Align Data Product", v)}
                  placeholder="e.g. Price Performance View" suggestions={consumerAlignOptions} />
                <AutocompleteInput label="Source Align Data Product" value={form["Source Align Data Product"]}
                  onChange={(v) => handleChange("Source Align Data Product", v)}
                  placeholder="e.g. Billing, Sales Actuals" suggestions={sourceAlignOptions} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source System Name</label>
                  <input type="text" value={form["Source System Name"]}
                    onChange={(e) => handleChange("Source System Name", e.target.value)}
                    placeholder="e.g. SAP, ERP" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source System Type</label>
                  <select value={form["Source System Type"]} onChange={(e) => handleChange("Source System Type", e.target.value)} className={inputClass}>
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                    <option value="Internal + External">Internal + External</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: KPIs ─── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-purple-100">
            <h2 className="text-lg font-bold text-[#5C2D91] mb-1">Assign KPIs</h2>
            <p className="text-sm text-gray-400 mb-6">
              Add the KPIs this data product tracks. Type to search existing KPIs or add new ones.
            </p>
            <TagInput label="KPIs Tracked" tags={kpis} setTags={setKpis}
              placeholder="Type a KPI name and press Enter..." suggestions={kpiSuggestions} />

            {kpis.length > 0 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <p className="text-xs font-medium text-purple-600 mb-2">{kpis.length} KPI{kpis.length !== 1 ? "s" : ""} assigned</p>
                <div className="flex flex-wrap gap-2">
                  {kpis.map((k, i) => (
                    <span key={i} className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: Source Tables ─── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-purple-100">
            <h2 className="text-lg font-bold text-[#5C2D91] mb-1">Configure Source Tables</h2>
            <p className="text-sm text-gray-400 mb-6">
              Define the raw source tables that feed data into this product. These appear in the detail view.
            </p>
            <TableInput tables={sourceTables} setTables={setSourceTables} />

            {sourceTables.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-xs font-medium text-blue-600 mb-2">{sourceTables.length} table{sourceTables.length !== 1 ? "s" : ""} configured</p>
              </div>
            )}
          </div>
        )}

        {/* ─── SUMMARY PREVIEW ─── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 mt-6">
            <h3 className="text-sm font-bold text-[#5C2D91] mb-3">Preview</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Data Product</span><span className="font-medium">{form["Data Product"]}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Analytics Product</span><span className="font-medium">{form["Analytics Product/KPI"] || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Function</span><span className="font-medium">{form["Functions"]}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Value Chain</span><span className="font-medium">{form["Value Chain"]}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Source System</span><span className="font-medium">{form["Source System Name"] || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Source Type</span><span className="font-medium">{form["Source System Type"]}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">KPIs</span><span className="font-medium">{kpis.length} assigned</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Source Tables</span><span className="font-medium">{sourceTables.length} configured</span></div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        {/* ─── NAVIGATION BUTTONS ─── */}
        <div className="flex justify-between mt-8">
          <button onClick={() => step === 1 ? navigate("/screen-1") : setStep(step - 1)}
            className="border border-purple-200 px-6 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-sm font-medium">
            {step === 1 ? "Cancel" : "Back"}
          </button>

          <div className="flex gap-3">
            {step < 3 && (
              <button onClick={() => setStep(step + 1)} disabled={!canNext()}
                className="bg-[#5C2D91] text-white px-6 py-2.5 rounded-xl shadow-sm hover:bg-purple-700 text-sm font-medium disabled:opacity-40">
                Next
              </button>
            )}
            {step === 3 && (
              <button onClick={handleSubmit} disabled={submitting}
                className="bg-[#5C2D91] text-white px-8 py-2.5 rounded-xl shadow-sm hover:bg-purple-700 text-sm font-medium disabled:opacity-50">
                {submitting ? "Creating..." : "Create Data Product"}
              </button>
            )}
            {step < 3 && step > 1 && (
              <button onClick={() => { setStep(3); }}
                className="text-purple-600 text-sm hover:underline py-2.5">
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
