import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSankeyData } from "../api";

const ZOOM_LEVEL = 0.65;

const VALUE_CHAIN_ORDER = [
    "Innovate", "Plan", "Source", "Make", "Deliver",
    "Market", "Sell", "Support", "Sustainability",
];

const ICONS = {
    Innovate: "src/assets/function-page-icons/Innovate.png",
    Plan: "src/assets/function-page-icons/Plan.png",
    Source: "src/assets/function-page-icons/Source.png",
    Make: "src/assets/function-page-icons/Make.png",
    Deliver: "src/assets/function-page-icons/Deliver.png",
    Market: "src/assets/function-page-icons/Market.png",
    Sell: "src/assets/function-page-icons/Sell.png",
    Support: "src/assets/function-page-icons/Support.png",
    Sustainability: "src/assets/function-page-icons/Sustainability.png",
    "Data Foundation": "src/assets/function-page-icons/Data Foundation.png",
};

const TOOLTIP_CONTENT = {
    Innovate: ["Create new and better products that customers want to buy"],
    Plan: ["Decide what to make, how much to sell, and where to focus"],
    Source: ["Buy materials and services at the right cost and quality"],
    Make: ["Produce goods efficiently, safely, and consistently"],
    Deliver: ["Get products to stores and customers on time"],
    Market: ["Understand customers and competitors to drive demand"],
    Sell: ["Sell products at the right price to grow revenue and profit"],
    Support: ["Run and control the business smoothly and compliantly"],
    Sustainability: ["Grow the business responsibly while protecting the environment"],
    "Data Foundation": [
        "Build a trusted base of shared data that all teams use to run the business consistently.",
    ],
};

const FUNCTION_TOOLTIPS = {
    "Growth, Innovation, R&D": "Create new products and optimize portfolios using formulation and sensory metrics.",
    "Commercial Planning": "Aligning sales targets with supply capabilities through gap and variance analysis.",
    "Supply Chain & Procurement": "Managing vendor relationships and material costs to ensure stable inbound logistics.",
    Manufacturing: "Driving production efficiency and quality control through asset and defect tracking.",
    "Supply Chain": "Managing the movement and storage of finished goods from warehouse to customer.",
    Marketing: "Building brand equity and demand through market share analysis and competitive benchmarking.",
    "Commercial / Finance": "Optimizing revenue growth through strategic pricing, discounts, and mix performance.",
    Commercial: "Driving trade efficiency and promo ROI to maximize sell-through.",
    Sales: "Improving retail execution through distribution metrics and shelf-share tracking.",
    Finance: "Maintaining fiscal health through accrual tracking and liquidity management.",
    "Legal & Compliance": "Mitigating corporate risk and ensuring regulatory adherence across operations.",
    "IT & Data": "Supporting business continuity through system uptime and technical infrastructure health.",
    Sustainability: "Reducing environmental impact by monitoring ESG scores and waste reduction KPIs.",
    "Data Management & IT": "Building a trusted, unified data layer through master data and quality governance.",
};

const DP_DEFINITION =
    "A unified collection of cross-functional datasets curated to provide a single source of truth for business analysis.";

const SharedTooltip = ({ type, name, description, isDP = false }) => (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-black text-[10px] px-2 py-1.5 rounded-lg shadow-xl border border-gray-100 min-w-[180px] pointer-events-none z-[99999] text-center">
        <div className="font-bold uppercase text-[9px] mb-0.5 text-[#5C2D91]">
            {isDP ? "Data product" : `${type}: ${name}`}
        </div>
        <div className="text-gray-600 leading-tight font-medium normal-case">
            {isDP ? DP_DEFINITION : description}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white"></div>
    </div>
);

export default function FunctionOverview() {
    const navigate = useNavigate();
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        getSankeyData().then(setRawData).catch(console.error);
    }, []);

    const hierarchy = useMemo(() => {
        const map = {};
        rawData.forEach(r => {
            const vc = r["Value Chain"];
            const fn = r["Functions"];
            const dp = r["Data Product (Suite)"];
            if (!vc || !fn || !dp) return;
            map[vc] ??= {};
            map[vc][fn] ??= new Set();
            map[vc][fn].add(dp);
        });
        return map;
    }, [rawData]);

    const dataFoundationProducts = useMemo(() => {
        return [
            ...new Set(
                rawData
                    .filter(
                        r =>
                            r["Value Chain"] === "Data Foundation" &&
                            r["Functions"] === "Data Management & IT"
                    )
                    .map(r => r["Data Product (Suite)"])
            ),
        ];
    }, [rawData]);

    return (
        <div className="h-screen w-screen bg-[#E6DFF3] relative overflow-hidden flex flex-col">

            {/* NAV BAR */}
            <div className="w-full z-[10000] flex justify-center items-start pt-0">
                <div className="flex items-center gap-3 bg-[#7B2CBF] px-6 py-1.5 rounded-full shadow-xl">
                    {["Value Chain Overview", "Data Product Lineage", "Product Details", "Data Product Details"].map(step => (
                        <span
                            key={step}
                            className={`px-5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all duration-300 ${step === "Value Chain Overview"
                                ? "bg-white text-[#5C2D91]"
                                : "text-white/80 hover:text-white"
                                }`}
                        >
                            {step}
                        </span>
                    ))}
                </div>
            </div>

            <div style={{ zoom: ZOOM_LEVEL }} className="flex-1 px-8 flex flex-col justify-start pb-6 mt-6">

                {/* VALUE CHAINS */}
                <div className="grid grid-cols-9 gap-x-6 items-start w-full mx-auto mb-1">
                    {VALUE_CHAIN_ORDER.map((vc, index) => {
                        const functions = hierarchy[vc];
                        if (!functions) return null;

                        return (
                            <div key={vc} className="relative flex flex-col items-center">
                                <div
                                    onClick={() => navigate(`/details?valueChain=${encodeURIComponent(vc)}`)}
                                    className="relative cursor-pointer group text-center mb-2"
                                >
                                    <SharedTooltip
                                        type="Value Chain"
                                        name={vc}
                                        description={TOOLTIP_CONTENT[vc][0]}
                                    />
                                    <img
                                        src={ICONS[vc]}
                                        alt={vc}
                                        className="w-16 h-16 object-contain transition-all duration-500 group-hover:scale-[1.40]"
                                    />
                                    <div className="mt-1 font-bold text-gray-800 text-md">{vc}</div>
                                </div>

                                {index !== VALUE_CHAIN_ORDER.length - 1 && (
                                    <div className="absolute top-7 right-[-24px] text-black text-4xl font-black">
                                        →
                                    </div>
                                )}

                                <div className="space-y-2 w-full">
                                    {Object.entries(functions).map(([fn, dps]) => (
                                        <div key={fn} className="flex flex-col shadow-lg rounded-2xl bg-white relative">
                                            <div
                                                onClick={() =>
                                                    navigate(
                                                        `/details?valueChain=${encodeURIComponent(vc)}&function=${encodeURIComponent(fn)}`
                                                    )
                                                }
                                                className="group cursor-pointer bg-[#5C2D91] text-white font-semibold py-2 text-[12px] uppercase text-center transition-all duration-300 hover:scale-110 hover:z-[50] hover:shadow-2xl hover:bg-[#7B2CBF] rounded-t-2xl relative px-1"
                                            >
                                                {fn}
                                                <SharedTooltip
                                                    type="Function"
                                                    name={fn}
                                                    description={FUNCTION_TOOLTIPS[fn] || "Function overview"}
                                                />
                                            </div>

                                            <div className="p-2 flex flex-col items-start space-y-1 relative group transition-all duration-300 hover:scale-110 hover:z-[40] hover:bg-white hover:rounded-b-2xl">
                                                <SharedTooltip isDP />
                                                {[...dps].map(dp => (
                                                    <div key={dp} className="w-full text-left px-1 flex items-start gap-1.5">
                                                        <span className="text-[10px] text-gray-400 mt-[1px]">•</span>
                                                        <span className="text-[10px] text-gray-600 font-bold leading-tight">
                                                            {dp}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* DATA FOUNDATION */}
                <div className="mt-6 flex flex-col items-center w-full px-1">
                    <div className="flex flex-col items-center mb-2 w-full">
                        <div className="flex items-center w-full justify-center gap-6">

                            {/* LEFT ARROW (OUTWARD) */}
                            <div className="relative flex-grow h-[3px] bg-black">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2
                                    border-t-[6px] border-t-transparent
                                    border-b-[6px] border-b-transparent
                                    border-r-[8px] border-r-black" />
                            </div>

                            <div
                                onClick={() => navigate(`/details?valueChain=Data Foundation`)}
                                className="relative cursor-pointer group"
                            >
                                <img
                                    src={ICONS["Data Foundation"]}
                                    alt="DF"
                                    className="w-20 h-20 object-contain transition-all duration-500 group-hover:scale-[1.40]"
                                />
                                <SharedTooltip
                                    type="Value Chain"
                                    name="Data Foundation"
                                    description={TOOLTIP_CONTENT["Data Foundation"][0]}
                                />
                            </div>

                            {/* RIGHT ARROW (OUTWARD) */}
                            <div className="relative flex-grow h-[3px] bg-black">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2
                                    border-t-[6px] border-t-transparent
                                    border-b-[6px] border-b-transparent
                                    border-l-[8px] border-l-black" />
                            </div>
                        </div>

                        <span className="mt-0.5 font-bold text-gray-800 text-md text-center">
                            Data Foundation
                        </span>
                    </div>

                    <div className="w-auto min-w-[300px] max-w-fit flex flex-col items-center">
                        <div className="w-full flex flex-col shadow-lg rounded-2xl bg-white relative">
                            <div
                                onClick={() =>
                                    navigate(`/details?valueChain=Data Foundation&function=Data Management & IT`)
                                }
                                className="group cursor-pointer bg-[#5C2D91] text-white font-semibold py-2.5 px-6 text-[12px] uppercase text-center transition-all duration-300 hover:scale-[1.05] hover:z-[50] hover:shadow-lg hover:bg-[#7B2CBF] rounded-t-2xl tracking-wider whitespace-nowrap"
                            >
                                Data Management & IT
                                <SharedTooltip
                                    type="Function"
                                    name="Data Management & IT"
                                    description={FUNCTION_TOOLTIPS["Data Management & IT"]}
                                />
                            </div>

                            <div className="p-3 flex flex-col items-start border-t border-gray-50 w-full relative group rounded-b-2xl">
                                <SharedTooltip isDP />
                                <div className="flex flex-col items-start space-y-1 w-full">
                                    {dataFoundationProducts.map(dp => (
                                        <div key={dp} className="w-full text-left px-2 flex items-start gap-2">
                                            <span className="text-[11px] text-gray-400 mt-[1px]">•</span>
                                            <span className="text-[11px] text-gray-700 font-bold leading-tight whitespace-nowrap">
                                                {dp}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LEGEND */}
                <div className="fixed bottom-6 right-18 flex gap-4 items-center bg-white/40 p-2 rounded-lg backdrop-blur-md border border-white/50 shadow-md z-[10001]">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#5C2D91] rounded-sm"></div>
                        <span className="text-gray-800 font-bold text-[9px] uppercase">Function</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div>
                        <span className="text-gray-800 font-bold text-[9px] uppercase">Data Product</span>
                    </div>
                </div>

            </div>
        </div>
    );
}