import express from "express";
import {
  getAllDataProducts, createDataProduct, updateDataProduct, deleteDataProduct,
  getDataProductByName,
  getAllSankeyData, getSankeyByProduct, createSankeyEntry,
  getAllAnalyticsProductDetails, getAnalyticsProductByName,
  createDataCatalogEntries,
  getAllSourceTablePaths, getSourceTablePath,
  getETLMappingByProduct, getETLMappingNested,
  getDataCatalogNested, getDataCatalogByProductAndAnalytics,
  getSourceTablePathsNested,
} from "./db/index.js";

const app = express();
app.use(express.json());

// ─── DATA PRODUCTS ──────────────────────────────────────────

app.get("/api/data-products", (req, res) => {
  try {
    const rows = getAllDataProducts();
    // Return in the original JSON shape the frontend expects
    const data = rows.map((r) => ({
      "S.No": r.s_no,
      "Functions": r.functions,
      "Analytics Product/KPI": r.analytics_product_kpi,
      "Value Chain": r.value_chain,
      "Consumer Align Data Product": r.consumer_align_data_product,
      "Source Align Data Product": r.source_align_data_product,
      "Source System Name": r.source_system_name,
      "Source System Type": r.source_system_type,
      "Data Product": r.data_product,
      "Status": r.status || "Active",
    }));
    res.json(data);
  } catch (err) {
    console.error("GET /api/data-products error:", err);
    res.status(500).json({ error: "Failed to fetch data products" });
  }
});

app.post("/api/data-products", (req, res) => {
  try {
    const created = createDataProduct({
      functions: req.body["Functions"] || "",
      analytics_product_kpi: req.body["Analytics Product/KPI"] || "",
      value_chain: req.body["Value Chain"] || "",
      consumer_align_data_product: req.body["Consumer Align Data Product"] || "",
      source_align_data_product: req.body["Source Align Data Product"] || "",
      source_system_name: req.body["Source System Name"] || "",
      source_system_type: req.body["Source System Type"] || "Internal",
      data_product: req.body["Data Product"] || "",
    });
    // Return in original shape
    res.json({
      "S.No": created.s_no,
      "Functions": created.functions,
      "Analytics Product/KPI": created.analytics_product_kpi,
      "Value Chain": created.value_chain,
      "Consumer Align Data Product": created.consumer_align_data_product,
      "Source Align Data Product": created.source_align_data_product,
      "Source System Name": created.source_system_name,
      "Source System Type": created.source_system_type,
      "Data Product": created.data_product,
      "Status": created.status || "New",
    });
  } catch (err) {
    console.error("POST /api/data-products error:", err);
    res.status(500).json({ error: "Failed to create data product" });
  }
});

// Keep backwards compatibility with old endpoint
app.post("/api/create-data-product", (req, res) => {
  try {
    const created = createDataProduct({
      functions: req.body["Functions"] || "",
      analytics_product_kpi: req.body["Analytics Product/KPI"] || "",
      value_chain: req.body["Value Chain"] || "",
      consumer_align_data_product: req.body["Consumer Align Data Product"] || "",
      source_align_data_product: req.body["Source Align Data Product"] || "",
      source_system_name: req.body["Source System Name"] || "",
      source_system_type: req.body["Source System Type"] || "Internal",
      data_product: req.body["Data Product"] || "",
    });
    res.json({
      "S.No": created.s_no,
      "Functions": created.functions,
      "Analytics Product/KPI": created.analytics_product_kpi,
      "Value Chain": created.value_chain,
      "Consumer Align Data Product": created.consumer_align_data_product,
      "Source Align Data Product": created.source_align_data_product,
      "Source System Name": created.source_system_name,
      "Source System Type": created.source_system_type,
      "Data Product": created.data_product,
      "Status": created.status || "New",
    });
  } catch (err) {
    console.error("POST /api/create-data-product error:", err);
    res.status(500).json({ error: "Failed to create data product" });
  }
});

app.put("/api/data-products/:id", (req, res) => {
  try {
    const updated = updateDataProduct(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
});

app.delete("/api/data-products/:id", (req, res) => {
  try {
    deleteDataProduct(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

// ─── SANKEY DATASET ─────────────────────────────────────────

app.get("/api/sankey", (req, res) => {
  try {
    const rows = getAllSankeyData();
    const data = rows.map((r) => ({
      "Functions": r.functions,
      "Value Chain": r.value_chain,
      "Data Product (Suite)": r.data_product_suite,
      "Analytics Product / KPI": r.analytics_product_kpi,
      "Consumer Align Data Product": r.consumer_align_data_product,
      "Source Align Data Product": r.source_align_data_product,
      "Source System Name": r.source_system_name,
      "Source System Type": r.source_system_type,
      "KPI": r.kpi,
    }));
    res.json(data);
  } catch (err) {
    console.error("GET /api/sankey error:", err);
    res.status(500).json({ error: "Failed to fetch sankey data" });
  }
});

app.get("/api/sankey/:suite", (req, res) => {
  try {
    const rows = getSankeyByProduct(req.params.suite);
    const data = rows.map((r) => ({
      "Functions": r.functions,
      "Value Chain": r.value_chain,
      "Data Product (Suite)": r.data_product_suite,
      "Analytics Product / KPI": r.analytics_product_kpi,
      "Consumer Align Data Product": r.consumer_align_data_product,
      "Source Align Data Product": r.source_align_data_product,
      "Source System Name": r.source_system_name,
      "Source System Type": r.source_system_type,
      "KPI": r.kpi,
    }));
    res.json(data);
  } catch (err) {
    console.error("GET /api/sankey/:suite error:", err);
    res.status(500).json({ error: "Failed to fetch sankey data" });
  }
});

// ─── ANALYTICS PRODUCT DETAILS ──────────────────────────────

app.get("/api/analytics-products", (req, res) => {
  try {
    const rows = getAllAnalyticsProductDetails();
    const data = rows.map((r) => ({
      analyticsProduct: r.analytics_product,
      businessPurpose: r.business_purpose,
      industry: r.industry,
      keyConsumers: r.key_consumers,
      entities: r.entities,
      businessImpact: r.business_impact,
    }));
    res.json(data);
  } catch (err) {
    console.error("GET /api/analytics-products error:", err);
    res.status(500).json({ error: "Failed to fetch analytics products" });
  }
});

app.get("/api/analytics-products/:name", (req, res) => {
  try {
    const row = getAnalyticsProductByName(req.params.name);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({
      analyticsProduct: row.analytics_product,
      businessPurpose: row.business_purpose,
      industry: row.industry,
      keyConsumers: row.key_consumers,
      entities: row.entities,
      businessImpact: row.business_impact,
    });
  } catch (err) {
    console.error("GET /api/analytics-products/:name error:", err);
    res.status(500).json({ error: "Failed to fetch analytics product" });
  }
});

// ─── SOURCE TABLE PATHS ─────────────────────────────────────

app.get("/api/source-table-paths", (req, res) => {
  try {
    res.json(getSourceTablePathsNested());
  } catch (err) {
    console.error("GET /api/source-table-paths error:", err);
    res.status(500).json({ error: "Failed to fetch source table paths" });
  }
});

// ─── ETL MAPPING ────────────────────────────────────────────

app.get("/api/etl-mapping", (req, res) => {
  try {
    res.json(getETLMappingNested());
  } catch (err) {
    console.error("GET /api/etl-mapping error:", err);
    res.status(500).json({ error: "Failed to fetch ETL mapping" });
  }
});

app.get("/api/etl-mapping/:suite", (req, res) => {
  try {
    const rows = getETLMappingByProduct(req.params.suite);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/etl-mapping/:suite error:", err);
    res.status(500).json({ error: "Failed to fetch ETL mapping" });
  }
});

// ─── DATA CATALOG ───────────────────────────────────────────

app.get("/api/data-catalog/:suite", (req, res) => {
  try {
    res.json(getDataCatalogNested(req.params.suite));
  } catch (err) {
    console.error("GET /api/data-catalog/:suite error:", err);
    res.status(500).json({ error: "Failed to fetch data catalog" });
  }
});

// ─── CREATE SANKEY ENTRY ────────────────────────────────────

app.post("/api/sankey", (req, res) => {
  try {
    const created = createSankeyEntry({
      functions: req.body["Functions"] || "",
      value_chain: req.body["Value Chain"] || "",
      data_product_suite: req.body["Data Product (Suite)"] || "",
      analytics_product_kpi: req.body["Analytics Product / KPI"] || "",
      consumer_align_data_product: req.body["Consumer Align Data Product"] || "",
      source_align_data_product: req.body["Source Align Data Product"] || "",
      source_system_name: req.body["Source System Name"] || "",
      source_system_type: req.body["Source System Type"] || "",
      kpi: req.body["KPI"] || "",
    });
    res.json(created);
  } catch (err) {
    console.error("POST /api/sankey error:", err);
    res.status(500).json({ error: "Failed to create sankey entry" });
  }
});

// ─── CREATE DATA CATALOG ENTRIES ────────────────────────────

app.post("/api/data-catalog", (req, res) => {
  try {
    const { data_product_suite, analytics_product, tables } = req.body;
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return res.status(400).json({ error: "tables array is required" });
    }
    const ids = createDataCatalogEntries({
      data_product_suite: data_product_suite || "",
      analytics_product: analytics_product || "",
      tables,
    });
    res.json({ created: ids.length, ids });
  } catch (err) {
    console.error("POST /api/data-catalog error:", err);
    res.status(500).json({ error: "Failed to create data catalog entries" });
  }
});

// ─── START SERVER ───────────────────────────────────────────

app.listen(5000, () =>
  console.log("SQLite API running on port 5000")
);
