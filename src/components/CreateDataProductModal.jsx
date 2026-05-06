import React, { useState, useRef, useEffect } from "react";

function AutocompleteInput({ label, value, onChange, placeholder, suggestions = [], required }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const wrapperRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (val) => {
    onChange(val);
    if (val.length > 0 && suggestions.length > 0) {
      const f = suggestions.filter((s) => s.toLowerCase().includes(val.toLowerCase()));
      setFiltered(f);
      setShowSuggestions(f.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && "*"}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => { if (value && filtered.length) setShowSuggestions(true); }}
        placeholder={placeholder}
        className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      {showSuggestions && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-purple-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
          {filtered.map((s) => (
            <div
              key={s}
              onClick={() => { onChange(s); setShowSuggestions(false); }}
              className="px-3 py-2 text-sm hover:bg-purple-50 cursor-pointer"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreateDataProductModal({ onClose, onCreated, functionOptions, valueChainOptions, kpiOptions, consumerAlignOptions, sourceAlignOptions }) {
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form["Data Product"] || !form["Functions"] || !form["Value Chain"]) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/data-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");
      const created = await res.json();
      onCreated(created);
      onClose();
    } catch {
      setError("Failed to save. Is the server running? (npm run server)");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[560px] max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5C2D91] to-[#7A4FB3] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold">Create Data Product</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Form — scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto">

          {/* Row 1: Name + KPI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Product Name *</label>
              <input
                type="text"
                value={form["Data Product"]}
                onChange={(e) => handleChange("Data Product", e.target.value)}
                placeholder="e.g. Supply Chain Intelligence"
                className={inputClass}
              />
            </div>
            <AutocompleteInput
              label="Analytics Product / KPI"
              value={form["Analytics Product/KPI"]}
              onChange={(v) => handleChange("Analytics Product/KPI", v)}
              placeholder="e.g. Brand Equity Tracking"
              suggestions={kpiOptions || []}
            />
          </div>

          {/* Row 2: Function + Value Chain */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Function *</label>
              <select
                value={form["Functions"]}
                onChange={(e) => handleChange("Functions", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a function...</option>
                {(functionOptions || []).map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value Chain *</label>
              <select
                value={form["Value Chain"]}
                onChange={(e) => handleChange("Value Chain", e.target.value)}
                className={inputClass}
              >
                <option value="">Select a value chain...</option>
                {(valueChainOptions || []).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Consumer Align + Source Align */}
          <div className="grid grid-cols-2 gap-4">
            <AutocompleteInput
              label="Consumer Align Data Product"
              value={form["Consumer Align Data Product"]}
              onChange={(v) => handleChange("Consumer Align Data Product", v)}
              placeholder="e.g. Price Performance View"
              suggestions={consumerAlignOptions || []}
            />
            <AutocompleteInput
              label="Source Align Data Product"
              value={form["Source Align Data Product"]}
              onChange={(v) => handleChange("Source Align Data Product", v)}
              placeholder="e.g. Billing, Sales Actuals"
              suggestions={sourceAlignOptions || []}
            />
          </div>

          {/* Row 4: Source System Name + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source System Name</label>
              <input
                type="text"
                value={form["Source System Name"]}
                onChange={(e) => handleChange("Source System Name", e.target.value)}
                placeholder="e.g. SAP, ERP"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source System Type</label>
              <select
                value={form["Source System Type"]}
                onChange={(e) => handleChange("Source System Type", e.target.value)}
                className={inputClass}
              >
                <option value="Internal">Internal</option>
                <option value="External">External</option>
                <option value="Internal + External">Internal + External</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="border border-purple-200 px-5 py-2 rounded-xl bg-white hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#5C2D91] text-white px-5 py-2 rounded-xl shadow-sm hover:bg-purple-700 text-sm disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
