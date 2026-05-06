
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// File path provided by user
const filePath = "c:\\Users\\manasi.s.sonawane\\OneDrive - Accenture\\Documents\\Data App_1\\Data App\\table_sankey_chart - Copy.xlsx";

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Column verification
    if (data.length > 0) {
        // Clean keys: trim whitespace from column names if any
        // And remove any strange keys
        const cleanData = data.map(row => {
            const newRow = {};
            Object.keys(row).forEach(k => {
                newRow[k.trim()] = row[k];
            });
            return newRow;
        });

        const actualColumns = Object.keys(cleanData[0]);
        console.log("Columns found: " + actualColumns.join(", "));
        console.log("Row count: " + cleanData.length);

        const outputPath = path.resolve('src/data/raw_table1.json');
        fs.writeFileSync(outputPath, JSON.stringify(cleanData, null, 2));
        console.log(`Data saved to ${outputPath}`);
    } else {
        console.log("Table is empty.");
    }

} catch (error) {
    console.error("Error reading file:", error);
}
