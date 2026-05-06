import { getSankeyData } from '../api';

// Now returns a Promise — callers must await or use .then()
export const generateSankeyData = () => {
    return getSankeyData();
};

// Helper to transform flat filtered data into Sankey nodes/links
export const processDataForSankey = (records, viewMode = 'detailed') => {
    const nodes = [];
    const nodeMap = new Map();
    const linksMap = new Map();

    const getOrCreateNode = (name, columnIndex) => {
        const safeName = name || "Unknown";
        const uniqueKey = `${columnIndex}-${safeName}`;

        if (nodeMap.has(uniqueKey)) {
            return nodeMap.get(uniqueKey);
        }
        const newNode = {
            name: safeName,
            layer: columnIndex,
            key: uniqueKey
        };
        const index = nodes.push(newNode) - 1;
        nodeMap.set(uniqueKey, index);
        return index;
    };

    records.forEach(row => {
        let values = [];
        if (viewMode === 'executive') {
            // Executive View: Functions -> Value Chain -> Data Product (Suite)
            values = [
                row["Functions"],
                row["Value Chain"],
                row["Data Product (Suite)"]
            ];
        } else {
            // Detailed View: Data Product (Suite) -> Analytics Product / KPI -> Consumer Align Data Product -> Aggregated Data Product
            values = [
                row["Data Product (Suite)"],
                row["Analytics Product / KPI"],
                row["Consumer Align Data Product"],
                row["Aggregated Data Product"]
                /*      row["Source Align Data Product"],
                      row["Source System Name"],
                      row["Source System Type"]*/
            ];
        }

        for (let c = 0; c < values.length - 1; c++) {
            const sourceName = values[c];
            const targetName = values[c + 1];

            if (!sourceName || !targetName) continue;

            const sourceIndex = getOrCreateNode(sourceName, c);
            const targetIndex = getOrCreateNode(targetName, c + 1);

            const linkKey = `${sourceIndex}-${targetIndex}`;
            const currentVal = linksMap.get(linkKey) || 0;
            linksMap.set(linkKey, currentVal + 1);
        }
    });

    const links = Array.from(linksMap.entries()).map(([key, value]) => {
        const [source, target] = key.split('-').map(Number);
        return { source, target, value };
    });

    return { nodes, links };
};

export const getFilterOptions = (data) => {
    const functions = [...new Set(data.map(d => d["Functions"]).filter(Boolean))].sort();
    const valueChains = [...new Set(data.map(d => d["Value Chain"]).filter(Boolean))].sort();
    const analyticsProducts = [...new Set(data.map(d => d["Analytics Product / KPI"]).filter(Boolean))].sort();

    return {
        functions,
        valueChains,
        analyticsProducts
    };
};

export const getProductDetails = (name) => {
    return {
        name,
        description: "Detailed metrics and lineage for " + name,
        tags: ["Data Product (Suite)", "Analytics"],
    };
};
