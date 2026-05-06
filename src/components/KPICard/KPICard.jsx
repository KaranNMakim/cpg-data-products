export default function KPICard({ title, value, description }) {
    return (
        <div className="bg-white rounded-md border px-2.5 py-1.5 shadow-sm hover:shadow-md transition">

            {/* Title */}
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                {title}
            </div>

            {/* Value */}
            <div className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                {value}
            </div>

            {/* Description */}
            {description && (
                <div className="text-[9px] text-gray-400 mt-0.5 leading-snug">
                    {description}
                </div>
            )}

        </div>
    );
}
