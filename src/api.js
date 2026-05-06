/**
 * Centralized API client for fetching data from the SQLite backend.
 * All pages import from here instead of static JSON files.
 */

const BASE = "/api";

async function fetchJSON(url) {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Data Products (enriched_data)
export const getDataProducts = () => fetchJSON("/data-products");
export const createDataProduct = (body) =>
  fetch(`${BASE}/data-products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

// Sankey
export const getSankeyData = () => fetchJSON("/sankey");
export const getSankeyByProduct = (suite) => fetchJSON(`/sankey/${encodeURIComponent(suite)}`);

// Analytics Product Details
export const getAnalyticsProducts = () => fetchJSON("/analytics-products");

// Source Table Paths
export const getSourceTablePaths = () => fetchJSON("/source-table-paths");

// ETL Mapping
export const getETLMapping = () => fetchJSON("/etl-mapping");

// Data Catalog (per data product suite, returns nested structure)
export const getDataCatalog = (suite) => fetchJSON(`/data-catalog/${encodeURIComponent(suite)}`);
