import React from 'react';
import { ChevronDown } from 'lucide-react';

const Navbar = ({
    functions = [],
    valueChains = [],
    selectedFunction,
    selectedValueChain,
    onFunctionChange,
    onValueChainChange
}) => {
    return (
        <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50" style={{
            zoom: 0.65
        }}>

            {/* Left: Title */}
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                    Explore Data Products
                </h1>
            </div>

            {/* Right: Filters */}
            <div className="flex items-center space-x-6">

                {/* Function Filter */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                        Function
                    </label>
                    <select
                        value={selectedFunction}
                        onChange={(e) => onFunctionChange(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-900
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                   w-64 min-w-[16rem] max-w-[16rem] truncate"
                    >
                        {functions.map(fn => (
                            <option key={fn} value={fn} className="truncate">
                                {fn}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Value Chain Filter */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                        Value Chain
                    </label>
                    <select
                        value={selectedValueChain}
                        onChange={(e) => onValueChainChange(e.target.value)}
                        disabled={!selectedFunction}
                        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-900
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                   w-64 min-w-[16rem] max-w-[16rem] truncate
                                   disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">All</option>
                        {valueChains.map(vc => (
                            <option key={vc} value={vc} className="truncate">
                                {vc}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-8 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

            </div>
        </nav>
    );
};

export default Navbar;
