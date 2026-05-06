import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

const enrichedPath = path.resolve('src/data/enriched_data.json');
const outputPath = path.resolve('src/data/sankey_dataset.json');

try {
    const data = JSON.parse(fs.readFileSync(enrichedPath, 'utf8'));

    // Inspect keys from first row
    const keys = Object.keys(data[0]);

    // Helper to find key by partial / case-insensitive match
    const findKey = (search) =>
        keys.find(k => k.toLowerCase().includes(search.toLowerCase()));

    // Sankey-driving columns
    const colFunctions = findKey("functions");
    const colValueChain = findKey("value chain");
    const colDataProduct = findKey("data product"); // Data Product (Suite)
    const colKPI = findKey("analytics product") || findKey("kpi");
    const colConsumer = findKey("consumer align");
    const colAggregated = findKey("aggregated");

    // Metadata columns (NOT used in Sankey, but preserved)
    const colSourceAlign = findKey("source align");
    const colSourceSystem = findKey("source system name");
    const colSourceType = findKey("source system type");

    const finalDataset = data.map(row => ({
        // ===== Sankey columns =====
        "Functions": row[colFunctions],
        "Value Chain": row[colValueChain],
        "Data Product (Suite)": row[colDataProduct],
        "Analytics Product / KPI": row[colKPI],
        "Consumer Align Data Product": row[colConsumer],
        "Aggregated Data Product": row[colAggregated],

        // ===== Metadata (future use) =====
        "Source Align Data Product": row[colSourceAlign],
        "Source System Name": row[colSourceSystem],
        "Source System Type": row[colSourceType]
    }));

    console.log(
        `Dataset Shape: ${finalDataset.length} rows x ${Object.keys(finalDataset[0]).length} columns`
    );

    fs.writeFileSync(outputPath, JSON.stringify(finalDataset, null, 2));
    console.log(`Saved to ${outputPath}`);

} catch (error) {
    console.error("Error transforming data:", error);
}
