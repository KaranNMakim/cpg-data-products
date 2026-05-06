import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const table1Path = path.resolve('src/data/raw_table1.json');
const table2Path =
    "c:\\Users\\manasi.s.sonawane\\OneDrive - Accenture\\Documents\\Data App_1\\Data App\\Mapped dataproduct.xlsx";

// Helper: normalize KPI strings
const normalize = (v) =>
    typeof v === "string"
        ? v.trim().replace(/\s+/g, " ").toLowerCase()
        : "";

try {
    // 1. Read Table 1 (Sankey base)
    const rawTable1 = JSON.parse(fs.readFileSync(table1Path, 'utf8'));

    // 2. Read Table 2 (KPI → Data Product mapping)
    const workbook = XLSX.readFile(table2Path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawTable2 = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Clean keys
    const cleanTable2 = rawTable2.map(row => {
        const newRow = {};
        Object.keys(row).forEach(k => {
            newRow[k.trim()] = row[k];
        });
        return newRow;
    });

    console.log("Table 2 Columns:", Object.keys(cleanTable2[0]).join(", "));
    console.log("Table 2 Row count:", cleanTable2.length);

    // Identify columns
    const kpiKey2 = Object.keys(cleanTable2[0]).find(
        k => k.includes("Analytics Product") || k.includes("KPI")
    );
    const dpKey2 = Object.keys(cleanTable2[0]).find(
        k => k.includes("Data Product (Suite)")
    );

    if (!kpiKey2 || !dpKey2) {
        console.error("Required columns not found in Mapped dataproduct.xlsx");
        process.exit(1);
    }

    // 3. Build KPI → Data Product mapping (normalized)
    const mapping = {};
    const duplicateKPIs = new Set();

    cleanTable2.forEach(row => {
        const kpiNorm = normalize(row[kpiKey2]);
        const dp = row[dpKey2]?.trim();

        if (!kpiNorm || !dp) return;

        if (mapping[kpiNorm] && mapping[kpiNorm] !== dp) {
            duplicateKPIs.add(row[kpiKey2]);
        }

        mapping[kpiNorm] = dp;
    });

    if (duplicateKPIs.size > 0) {
        console.warn("Duplicate KPI mappings detected:", [...duplicateKPIs]);
    }

    // 4. Enrich Table 1 (DROP unmatched rows)
    const table1Keys = Object.keys(rawTable1[0]);
    const kpiKey1 = table1Keys.find(
        k => k.includes("Analytics Product") || k.includes("KPI")
    );

    let matched = 0;
    let dropped = 0;

    const enrichedTable1 = rawTable1
        .map(row => {
            const kpiNorm = normalize(row[kpiKey1]);
            const suite = mapping[kpiNorm];

            if (!suite) {
                dropped++;
                return null; // 🚨 DROP ROW
            }

            matched++;
            return {
                ...row,
                "Data Product": suite
            };
        })
        .filter(Boolean); // remove nulls

    console.log(`Matched KPIs: ${matched}`);
    console.log(`Dropped (unmapped) KPIs: ${dropped}`);

    // 5. Save enriched data
    const outputPath = path.resolve('src/data/enriched_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(enrichedTable1, null, 2));
    console.log(`Enriched data saved to ${outputPath}`);

} catch (error) {
    console.error("Error processing ingest_table_2:", error);
}
