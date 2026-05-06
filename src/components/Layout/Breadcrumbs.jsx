import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
    const location = useLocation();

    const isFunctions = location.pathname === "/functions";
    const isDetails = location.pathname === "/details";

    return (
        <nav className="flex items-center text-sm text-gray-500 space-x-2">

            {/* Function Overview */}
            {isFunctions ? (
                <span className="font-semibold text-blue-600">
                    Function Overview
                </span>
            ) : (
                <Link
                    to="/functions"
                    className="hover:text-blue-600 transition"
                >
                    Function Overview
                </Link>
            )}

            {/* Separator + Sankey */}
            {isDetails && (
                <>
                    <span className="text-gray-400">›</span>
                    <span className="font-semibold text-blue-600">
                        Sankey
                    </span>
                </>
            )}
        </nav>
    );
}
