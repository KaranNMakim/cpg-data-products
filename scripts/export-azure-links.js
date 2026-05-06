/**
 * Export-Azure-Links.js
 *
 * Generates an Excel workbook listing:
 *   - All datasets (raw tables) with their ADLS portal links
 *   - All ADF pipelines with their authoring portal links
 *
 * Reads from db/app.db and constructs Azure links using the same
 * patterns the React UI uses (see DataProductSuiteDetails.jsx).
 *
 * Usage:  node scripts/export-azure-links.js
 * Output: ./Azure-Datasets-and-Pipelines.xlsx
 */

import Database from "better-sqlite3";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "db", "app.db");
const OUT_PATH = path.join(__dirname, "..", "Azure-Datasets-and-Pipelines.xlsx");

// ─── Azure config (mirrors .env / VITE_AZ_*) ─────────────────
const SUBSCRIPTION_ID = "8f75a913-2d07-46c2-ba88-770d8a73ccec";
const RESOURCE_GROUP = "cpgai-engineering-rg";
const ADF_NAME = "cpgai-engineering-adf";
const STORAGE_ACCOUNT = "cpgdataproduct";
const STORAGE_CONTAINER = "inputfiles";

const factoryPath =
  `/subscriptions/${SUBSCRIPTION_ID}` +
  `/resourceGroups/${RESOURCE_GROUP}` +
  `/providers/Microsoft.DataFactory` +
  `/factories/${ADF_NAME}`;

const storageAccountId =
  `/subscriptions/${SUBSCRIPTION_ID}` +
  `/resourceGroups/${RESOURCE_GROUP}` +
  `/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT}`;

// ─── Link builders ──────────────────────────────────────────
const adfPipelineLink = (pipeline) =>
  `https://adf.azure.com/en/authoring/pipeline/${encodeURIComponent(pipeline)}` +
  `?factory=${encodeURIComponent(factoryPath)}`;

const adfFactoryLink = () =>
  `https://adf.azure.com/en/authoring?factory=${encodeURIComponent(factoryPath)}`;

const adlsContainerLink = (subPath = "") =>
  `https://portal.azure.com/#view/Microsoft_Azure_Storage/ContainerMenuBlade/~/overview` +
  `/storageAccountId/${encodeURIComponent(storageAccountId)}` +
  `/path/${STORAGE_CONTAINER}${subPath ? "/" + subPath : ""}`;

// App detail page link (for cross-reference)
const appDetailLink = (suite) =>
  `http://localhost:5173/data-product-suite-details?name=${encodeURIComponent(suite)}`;

// ─── Query data ─────────────────────────────────────────────
const db = new Database(DB_PATH, { readonly: true });

// Datasets — distinct raw tables per data product suite
const datasets = db.prepare(`
  SELECT DISTINCT
    dc.raw_table        AS dataset,
    dc.data_product_suite AS data_product,
    dc.analytics_product AS analytics_product,
    stp.abbreviation    AS abbreviation
  FROM data_catalog dc
  LEFT JOIN source_table_paths stp ON stp.data_product_suite = dc.data_product_suite
  WHERE dc.raw_table != ''
  ORDER BY dc.data_product_suite, dc.raw_table
`).all();

const datasetRows = datasets.map((r, i) => ({
  "#": i + 1,
  "Dataset (Raw Table)": r.dataset,
  "Data Product": r.data_product,
  "Analytics Product": r.analytics_product,
  "ADLS Path": `${STORAGE_CONTAINER}/${r.abbreviation || ""}/raw/${r.dataset}`,
  "ADLS Portal Link": adlsContainerLink(r.abbreviation ? `${r.abbreviation}/raw` : ""),
  "App Detail Link": appDetailLink(r.data_product),
}));

// Pipelines — one row per pipeline
const pipelines = db.prepare(`
  SELECT
    pipeline,
    data_product_suite AS data_product,
    analytics_product
  FROM etl_mapping
  WHERE pipeline != ''
  ORDER BY data_product_suite, pipeline
`).all();

const pipelineRows = pipelines.map((r, i) => ({
  "#": i + 1,
  "Pipeline Name": r.pipeline,
  "Data Product": r.data_product,
  "Analytics Product": r.analytics_product,
  "ADF Pipeline Link": adfPipelineLink(r.pipeline),
  "ADF Factory Link": adfFactoryLink(),
  "App Detail Link": appDetailLink(r.data_product),
}));

// Summary sheet
const summaryRows = [
  { Metric: "Total Datasets (raw tables)", Value: datasetRows.length },
  { Metric: "Total ADF Pipelines", Value: pipelineRows.length },
  { Metric: "Total Data Product Suites", Value: db.prepare("SELECT COUNT(*) AS c FROM source_table_paths").get().c },
  { Metric: "Azure Subscription", Value: SUBSCRIPTION_ID },
  { Metric: "Resource Group", Value: RESOURCE_GROUP },
  { Metric: "ADF Factory", Value: ADF_NAME },
  { Metric: "Storage Account", Value: STORAGE_ACCOUNT },
  { Metric: "Storage Container", Value: STORAGE_CONTAINER },
  { Metric: "Generated", Value: new Date().toISOString() },
];

// ─── Build workbook ─────────────────────────────────────────
const wb = XLSX.utils.book_new();

const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
summarySheet["!cols"] = [{ wch: 35 }, { wch: 60 }];
XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

const datasetSheet = XLSX.utils.json_to_sheet(datasetRows);
datasetSheet["!cols"] = [
  { wch: 5 }, { wch: 35 }, { wch: 35 }, { wch: 30 },
  { wch: 50 }, { wch: 80 }, { wch: 80 },
];
XLSX.utils.book_append_sheet(wb, datasetSheet, "Datasets");

const pipelineSheet = XLSX.utils.json_to_sheet(pipelineRows);
pipelineSheet["!cols"] = [
  { wch: 5 }, { wch: 45 }, { wch: 35 }, { wch: 30 },
  { wch: 80 }, { wch: 80 }, { wch: 80 },
];
XLSX.utils.book_append_sheet(wb, pipelineSheet, "ADF Pipelines");

XLSX.writeFile(wb, OUT_PATH);

console.log(`✅ Exported to: ${OUT_PATH}`);
console.log(`   - Datasets:  ${datasetRows.length}`);
console.log(`   - Pipelines: ${pipelineRows.length}`);
