import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSankeyData } from '../../api';

const AggregatedProductDetails = () => {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        getSankeyData()
            .then(data => setRows(data.filter(r => r["Aggregated Data Product"] === decodedName)))
            .catch(console.error);
    }, [decodedName]);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Aggregated Data Product: {decodedName}
            </h1>

            <div className="overflow-auto border rounded">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            {[
                                "Functions",
                                "Analytics Product / KPI",
                                "Data Product (Suite)",
                                "Value Chain",
                                "Consumer Align Data Product",
                                "Aggregated Data Product",
                                "Source Align Data Product",
                                "Source System Name",
                                "Source System Type"
                            ].map(col => (
                                <th key={col} className="px-3 py-2 text-left font-semibold">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-t">
                                <td className="px-3 py-2">{row["Functions"]}</td>
                                <td className="px-3 py-2">{row["Analytics Product / KPI"]}</td>
                                <td className="px-3 py-2">{row["Data Product (Suite)"]}</td>
                                <td className="px-3 py-2">{row["Value Chain"]}</td>
                                <td className="px-3 py-2">{row["Consumer Align Data Product"]}</td>
                                <td className="px-3 py-2">{row["Aggregated Data Product"]}</td>
                                <td className="px-3 py-2">{row["Source Align Data Product"]}</td>
                                <td className="px-3 py-2">{row["Source System Name"]}</td>
                                <td className="px-3 py-2">{row["Source System Type"]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AggregatedProductDetails;
