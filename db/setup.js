/**
 * Database Setup Script
 * Creates SQLite tables and seeds them from JSON data files.
 * Run: node db/setup.js
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "app.db");
const DATA_DIR = path.join(__dirname, "..", "src", "data");

// Remove existing DB to start fresh
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("Removed existing database.");
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── 1. SCHEMA ───────────────────────────────────────────────

db.exec(`
  -- Core data products table (enriched_data.json)
  CREATE TABLE data_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    s_no INTEGER UNIQUE,
    functions TEXT NOT NULL DEFAULT '',
    analytics_product_kpi TEXT DEFAULT '',
    value_chain TEXT DEFAULT '',
    consumer_align_data_product TEXT DEFAULT '',
    source_align_data_product TEXT DEFAULT '',
    source_system_name TEXT DEFAULT '',
    source_system_type TEXT DEFAULT 'Internal',
    data_product TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Sankey dataset (sankey_dataset.json)
  CREATE TABLE sankey_dataset (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    functions TEXT DEFAULT '',
    value_chain TEXT DEFAULT '',
    data_product_suite TEXT DEFAULT '',
    analytics_product_kpi TEXT DEFAULT '',
    consumer_align_data_product TEXT DEFAULT '',
    source_align_data_product TEXT DEFAULT '',
    source_system_name TEXT DEFAULT '',
    source_system_type TEXT DEFAULT '',
    kpi TEXT DEFAULT ''
  );

  -- Analytics product details (AnalyticsProductDetails.json)
  CREATE TABLE analytics_product_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analytics_product TEXT NOT NULL DEFAULT '',
    business_purpose TEXT DEFAULT '',
    industry TEXT DEFAULT '',
    key_consumers TEXT DEFAULT '',
    entities TEXT DEFAULT '',
    business_impact TEXT DEFAULT ''
  );

  -- Source table paths (sourcetables_paths.json)
  CREATE TABLE source_table_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_product_suite TEXT NOT NULL UNIQUE,
    analytics_product TEXT DEFAULT '',
    abbreviation TEXT DEFAULT ''
  );

  -- ETL mapping (etl_mapping.json)
  CREATE TABLE etl_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_product_suite TEXT NOT NULL DEFAULT '',
    analytics_product TEXT NOT NULL DEFAULT '',
    pipeline TEXT DEFAULT ''
  );

  -- Data catalog (data_catalog.json) - flattened from nested structure
  CREATE TABLE data_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_product_suite TEXT DEFAULT '',
    analytics_product TEXT DEFAULT '',
    consumption_table_group TEXT DEFAULT '',
    fact_table TEXT DEFAULT '',
    raw_table TEXT DEFAULT '',
    consumption_table_attribute TEXT DEFAULT '',
    attribute_type TEXT DEFAULT '',
    data_type TEXT DEFAULT '',
    range_val TEXT DEFAULT '',
    transformation_logic TEXT DEFAULT ''
  );
`);

console.log("Schema created.");

// ─── 2. SEED DATA ────────────────────────────────────────────

function loadJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// 2a. enriched_data.json → data_products
const enriched = loadJSON("enriched_data.json");
const insertDP = db.prepare(`
  INSERT INTO data_products (s_no, functions, analytics_product_kpi, value_chain,
    consumer_align_data_product, source_align_data_product, source_system_name,
    source_system_type, data_product)
  VALUES (@s_no, @functions, @analytics_product_kpi, @value_chain,
    @consumer_align_data_product, @source_align_data_product, @source_system_name,
    @source_system_type, @data_product)
`);
const insertDPMany = db.transaction((items) => {
  for (const item of items) {
    insertDP.run({
      s_no: item["S.No"],
      functions: item["Functions"] || "",
      analytics_product_kpi: item["Analytics Product/KPI"] || "",
      value_chain: item["Value Chain"] || "",
      consumer_align_data_product: item["Consumer Align Data Product"] || "",
      source_align_data_product: item["Source Align Data Product"] || "",
      source_system_name: item["Source System Name"] || "",
      source_system_type: item["Source System Type"] || "Internal",
      data_product: item["Data Product"] || "",
    });
  }
});
insertDPMany(enriched);
console.log(`Seeded data_products: ${enriched.length} rows`);

// 2b. sankey_dataset.json → sankey_dataset
const sankey = loadJSON("sankey_dataset.json");
const insertSankey = db.prepare(`
  INSERT INTO sankey_dataset (functions, value_chain, data_product_suite,
    analytics_product_kpi, consumer_align_data_product, source_align_data_product,
    source_system_name, source_system_type, kpi)
  VALUES (@functions, @value_chain, @data_product_suite, @analytics_product_kpi,
    @consumer_align_data_product, @source_align_data_product, @source_system_name,
    @source_system_type, @kpi)
`);
const insertSankeyMany = db.transaction((items) => {
  for (const item of items) {
    insertSankey.run({
      functions: item["Functions"] || "",
      value_chain: item["Value Chain"] || "",
      data_product_suite: item["Data Product (Suite)"] || "",
      analytics_product_kpi: item["Analytics Product / KPI"] || "",
      consumer_align_data_product: item["Consumer Align Data Product"] || "",
      source_align_data_product: item["Source Align Data Product"] || "",
      source_system_name: item["Source System Name"] || "",
      source_system_type: item["Source System Type"] || "",
      kpi: item["KPI"] || "",
    });
  }
});
insertSankeyMany(sankey);
console.log(`Seeded sankey_dataset: ${sankey.length} rows`);

// 2c. AnalyticsProductDetails.json → analytics_product_details
const apd = loadJSON("AnalyticsProductDetails.json");
const insertAPD = db.prepare(`
  INSERT INTO analytics_product_details (analytics_product, business_purpose, industry,
    key_consumers, entities, business_impact)
  VALUES (@analytics_product, @business_purpose, @industry, @key_consumers, @entities, @business_impact)
`);
const insertAPDMany = db.transaction((items) => {
  for (const item of items) {
    insertAPD.run({
      analytics_product: item["analyticsProduct"] || "",
      business_purpose: item["businessPurpose"] || "",
      industry: item["industry"] || "",
      key_consumers: item["keyConsumers"] || "",
      entities: item["entities"] || "",
      business_impact: item["businessImpact"] || "",
    });
  }
});
insertAPDMany(apd);
console.log(`Seeded analytics_product_details: ${apd.length} rows`);

// 2d. sourcetables_paths.json → source_table_paths
const stp = loadJSON("sourcetables_paths.json");
const insertSTP = db.prepare(`
  INSERT INTO source_table_paths (data_product_suite, analytics_product, abbreviation)
  VALUES (@data_product_suite, @analytics_product, @abbreviation)
`);
const insertSTPMany = db.transaction((entries) => {
  for (const [suite, val] of entries) {
    insertSTP.run({
      data_product_suite: suite,
      analytics_product: val.analyticsProduct || "",
      abbreviation: val.abbreviation || "",
    });
  }
});
insertSTPMany(Object.entries(stp));
console.log(`Seeded source_table_paths: ${Object.keys(stp).length} rows`);

// 2e. etl_mapping.json → etl_mapping (flattened)
const etl = loadJSON("etl_mapping.json");
const insertETL = db.prepare(`
  INSERT INTO etl_mapping (data_product_suite, analytics_product, pipeline)
  VALUES (@data_product_suite, @analytics_product, @pipeline)
`);
const insertETLMany = db.transaction((obj) => {
  let count = 0;
  for (const [suite, val] of Object.entries(obj)) {
    if (val.analyticsProducts) {
      for (const [ap, apVal] of Object.entries(val.analyticsProducts)) {
        if (apVal.pipelines && apVal.pipelines.length > 0) {
          for (const p of apVal.pipelines) {
            insertETL.run({ data_product_suite: suite, analytics_product: ap, pipeline: p });
            count++;
          }
        } else {
          insertETL.run({ data_product_suite: suite, analytics_product: ap, pipeline: "" });
          count++;
        }
      }
    }
  }
  return count;
});
const etlCount = insertETLMany(etl);
console.log(`Seeded etl_mapping: ${etlCount} rows`);

// 2f. data_catalog.json → data_catalog (deeply flattened)
const catalog = loadJSON("data_catalog.json");
const insertCatalog = db.prepare(`
  INSERT INTO data_catalog (data_product_suite, analytics_product, consumption_table_group,
    fact_table, raw_table, consumption_table_attribute, attribute_type, data_type,
    range_val, transformation_logic)
  VALUES (@data_product_suite, @analytics_product, @consumption_table_group,
    @fact_table, @raw_table, @consumption_table_attribute, @attribute_type, @data_type,
    @range_val, @transformation_logic)
`);
const insertCatalogMany = db.transaction((obj) => {
  let count = 0;
  for (const [suite, apObj] of Object.entries(obj)) {
    for (const [ap, tableGroupObj] of Object.entries(apObj)) {
      for (const [tableGroup, factObj] of Object.entries(tableGroupObj)) {
        for (const [factTable, attrs] of Object.entries(factObj)) {
          if (Array.isArray(attrs)) {
            for (const attr of attrs) {
              insertCatalog.run({
                data_product_suite: suite,
                analytics_product: ap,
                consumption_table_group: tableGroup,
                fact_table: factTable,
                raw_table: attr.raw_table || "",
                consumption_table_attribute: attr.consumption_table_attribute || "",
                attribute_type: attr.attribute_type || "",
                data_type: attr.data_type || "",
                range_val: attr.range || "",
                transformation_logic: attr.transformation_logic || "",
              });
              count++;
            }
          }
        }
      }
    }
  }
  return count;
});
const catalogCount = insertCatalogMany(catalog);
console.log(`Seeded data_catalog: ${catalogCount} rows`);

db.close();
console.log(`\nDatabase created at: ${DB_PATH}`);
