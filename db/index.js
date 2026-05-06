/**
 * Database access module
 * Provides CRUD operations for all tables.
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "app.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── DATA PRODUCTS (enriched_data) ──────────────────────────

export function getAllDataProducts() {
  return db.prepare("SELECT * FROM data_products ORDER BY id").all();
}

export function getDataProductById(id) {
  return db.prepare("SELECT * FROM data_products WHERE id = ?").get(id);
}

export function getDataProductByName(name) {
  return db.prepare("SELECT * FROM data_products WHERE data_product = ?").get(name);
}

export function createDataProduct({ functions, analytics_product_kpi, value_chain, consumer_align_data_product, source_align_data_product, source_system_name, source_system_type, data_product, status }) {
  const maxSNo = db.prepare("SELECT COALESCE(MAX(s_no), 0) AS max_sno FROM data_products").get().max_sno;
  const stmt = db.prepare(`
    INSERT INTO data_products (s_no, functions, analytics_product_kpi, value_chain,
      consumer_align_data_product, source_align_data_product, source_system_name,
      source_system_type, data_product, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    maxSNo + 1, functions || "", analytics_product_kpi || "", value_chain || "",
    consumer_align_data_product || "", source_align_data_product || "",
    source_system_name || "", source_system_type || "Internal", data_product || "",
    status || "New"
  );
  return db.prepare("SELECT * FROM data_products WHERE id = ?").get(result.lastInsertRowid);
}

export function updateDataProduct(id, fields) {
  const allowed = ["functions", "analytics_product_kpi", "value_chain", "consumer_align_data_product", "source_align_data_product", "source_system_name", "source_system_type", "data_product", "status"];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (key in fields) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (updates.length === 0) return null;
  values.push(id);
  db.prepare(`UPDATE data_products SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  return db.prepare("SELECT * FROM data_products WHERE id = ?").get(id);
}

export function deleteDataProduct(id) {
  return db.prepare("DELETE FROM data_products WHERE id = ?").run(id);
}

// ─── SANKEY DATASET ─────────────────────────────────────────

export function getAllSankeyData() {
  return db.prepare("SELECT * FROM sankey_dataset ORDER BY id").all();
}

export function getSankeyByProduct(dataProductSuite) {
  return db.prepare("SELECT * FROM sankey_dataset WHERE data_product_suite = ?").all(dataProductSuite);
}

// ─── ANALYTICS PRODUCT DETAILS ──────────────────────────────

export function getAllAnalyticsProductDetails() {
  return db.prepare("SELECT * FROM analytics_product_details ORDER BY analytics_product").all();
}

export function getAnalyticsProductByName(name) {
  return db.prepare("SELECT * FROM analytics_product_details WHERE analytics_product = ?").get(name);
}

// ─── SOURCE TABLE PATHS ─────────────────────────────────────

export function getAllSourceTablePaths() {
  return db.prepare("SELECT * FROM source_table_paths ORDER BY data_product_suite").all();
}

export function getSourceTablePath(dataProductSuite) {
  return db.prepare("SELECT * FROM source_table_paths WHERE data_product_suite = ?").get(dataProductSuite);
}

// ─── ETL MAPPING ────────────────────────────────────────────

export function getAllETLMappings() {
  return db.prepare("SELECT * FROM etl_mapping ORDER BY data_product_suite").all();
}

export function getETLMappingByProduct(dataProductSuite) {
  return db.prepare("SELECT * FROM etl_mapping WHERE data_product_suite = ?").all(dataProductSuite);
}

// ─── DATA CATALOG ───────────────────────────────────────────

export function getDataCatalogByProduct(dataProductSuite) {
  return db.prepare("SELECT * FROM data_catalog WHERE data_product_suite = ?").all(dataProductSuite);
}

export function getDataCatalogByProductAndAnalytics(dataProductSuite, analyticsProduct) {
  return db.prepare("SELECT * FROM data_catalog WHERE data_product_suite = ? AND analytics_product = ?").all(dataProductSuite, analyticsProduct);
}

export function getDataCatalogNested(dataProductSuite) {
  const rows = getDataCatalogByProduct(dataProductSuite);
  // Rebuild the nested structure the frontend expects
  const result = {};
  for (const row of rows) {
    const ap = row.analytics_product;
    const tg = row.consumption_table_group;
    const ft = row.fact_table;
    if (!result[ap]) result[ap] = {};
    if (!result[ap][tg]) result[ap][tg] = {};
    if (!result[ap][tg][ft]) result[ap][tg][ft] = [];
    result[ap][tg][ft].push({
      raw_table: row.raw_table,
      consumption_table_attribute: row.consumption_table_attribute,
      attribute_type: row.attribute_type,
      data_type: row.data_type,
      range: row.range_val,
      transformation_logic: row.transformation_logic,
    });
  }
  return result;
}

export function getETLMappingNested() {
  const rows = db.prepare("SELECT * FROM etl_mapping ORDER BY data_product_suite").all();
  const result = {};
  for (const row of rows) {
    if (!result[row.data_product_suite]) {
      result[row.data_product_suite] = { analyticsProducts: {} };
    }
    const ap = row.analytics_product;
    if (!result[row.data_product_suite].analyticsProducts[ap]) {
      result[row.data_product_suite].analyticsProducts[ap] = { pipelines: [] };
    }
    if (row.pipeline) {
      result[row.data_product_suite].analyticsProducts[ap].pipelines.push(row.pipeline);
    }
  }
  return result;
}

export function getSourceTablePathsNested() {
  const rows = db.prepare("SELECT * FROM source_table_paths ORDER BY data_product_suite").all();
  const result = {};
  for (const row of rows) {
    result[row.data_product_suite] = {
      analyticsProduct: row.analytics_product,
      abbreviation: row.abbreviation,
    };
  }
  return result;
}

// ─── CREATE: SANKEY ENTRY ───────────────────────────────────

export function createSankeyEntry({ functions, value_chain, data_product_suite, analytics_product_kpi, consumer_align_data_product, source_align_data_product, source_system_name, source_system_type, kpi }) {
  const stmt = db.prepare(`
    INSERT INTO sankey_dataset (functions, value_chain, data_product_suite, analytics_product_kpi,
      consumer_align_data_product, source_align_data_product, source_system_name, source_system_type, kpi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    functions || "", value_chain || "", data_product_suite || "", analytics_product_kpi || "",
    consumer_align_data_product || "", source_align_data_product || "",
    source_system_name || "", source_system_type || "", kpi || ""
  );
  return db.prepare("SELECT * FROM sankey_dataset WHERE id = ?").get(result.lastInsertRowid);
}

// ─── CREATE: DATA CATALOG ENTRIES (batch) ───────────────────

export function createDataCatalogEntries({ data_product_suite, analytics_product, tables }) {
  const stmt = db.prepare(`
    INSERT INTO data_catalog (data_product_suite, analytics_product, consumption_table_group,
      fact_table, raw_table, consumption_table_attribute, attribute_type, data_type, range_val, transformation_logic)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMany = db.transaction((tbls) => {
    const results = [];
    for (const rawTable of tbls) {
      const result = stmt.run(
        data_product_suite || "", analytics_product || "", "Default",
        rawTable, rawTable, "", "Direct", "String", "", ""
      );
      results.push(result.lastInsertRowid);
    }
    return results;
  });
  return insertMany(tables);
}

export default db;
