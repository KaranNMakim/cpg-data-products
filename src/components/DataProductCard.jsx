import React from "react";

export default function DataProductCard({ data, onClick }) {
    return (
        <div
            onClick={onClick}
            className="
                cursor-pointer
                bg-white
                rounded-2xl
                shadow-md
                border border-purple-200
                transition-all
                hover:shadow-xl
                hover:scale-[1.02]
                relative
                overflow-hidden
            "
        >
            {/* LEFT ACCENT BORDER */}
            <div className="absolute left-0 top-0 h-full w-1 bg-[#7B2CBF]" />

            <div className="p-5 flex flex-col h-full">
                {/* HEADER TAG */}
                <div className="text-[10px] uppercase font-extrabold text-[#7B2CBF] tracking-wide mb-2">
                    {data.display_label}
                </div>

                {/* FUNCTION */}
                <div className="text-xs text-gray-500 font-semibold mb-1">
                    {data.functions}
                </div>

                {/* MAIN TITLE */}
                <div className="text-sm font-bold text-gray-900 leading-snug mb-6">
                    {data.name}
                </div>

                {/* FOOTER */}
                <div className="mt-auto flex items-center justify-between">
                    {/* VIEW DETAILS */}
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#7B2CBF]">
                        <span>🔍</span>
                        <span>View Details</span>
                    </div>

                    {/* VALUE CHAIN TAG */}
                    <div className="text-[10px] font-bold uppercase text-gray-400">
                        {data.value_chain}
                    </div>
                </div>
            </div>
        </div>
    );
}
