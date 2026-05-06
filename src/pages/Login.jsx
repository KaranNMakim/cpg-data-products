import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [mode, setMode] = useState("login");
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full overflow-hidden font-sans bg-white relative">

            {/* ================= MAIN LAYOUT ================= */}
            <div className="flex h-full w-full">

                {/* LEFT PANEL */}
                <div className="w-1/2 h-full bg-[#E6DFF3] flex flex-col px-10 relative">

                    {/* Accenture Logo */}
                    <img
                        src="/src/assets/accenture-logo.png"
                        alt="Accenture"
                        className="absolute top-4 left-4 w-[140px] h-auto"
                    />

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col justify-center -mt-10">
                        <h1 className="text-4xl font-bold text-[#5C2D91] mb-4">
                            CGS Data Products
                        </h1>

                        <p className="text-base text-gray-800 max-w-md leading-relaxed">
                            A unified view of enterprise value chains, functions, and data
                            products — designed to enable data-driven decisions at scale.
                        </p>
                    </div>
                    {/* CREATED BY – LEFT ALIGNED */}
                    <div className="absolute bottom-8 left-8 text-[10px] text-gray-600 text-left">
                        <div className="font-semibold mb-1">Created by:</div>
                        <div className="space-y-0.5">
                            <div>Data & AI CGS India</div>

                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-1/2 h-full bg-white flex flex-col justify-center items-center relative">

                    <h2 className="text-2xl font-semibold mb-6">
                        Get started
                    </h2>

                    <div className="flex gap-4 mb-5">
                        <button
                            onClick={() => setMode("login")}
                            className={`px-6 py-2 rounded-full text-sm transition
                                ${mode === "login"
                                    ? "bg-[#5C2D91] text-white"
                                    : "border border-gray-300 text-gray-700"
                                }`}
                        >
                            Log in
                        </button>

                        <button
                            onClick={() => setMode("signup")}
                            className={`px-6 py-2 rounded-full text-sm transition
                                ${mode === "signup"
                                    ? "bg-[#5C2D91] text-white"
                                    : "border border-gray-300 text-gray-700"
                                }`}
                        >
                            Sign up
                        </button>
                    </div>

                    <div className="w-80 space-y-3">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full border px-4 py-2 text-sm rounded focus:ring-2 focus:ring-[#5C2D91]"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border px-4 py-2 text-sm rounded focus:ring-2 focus:ring-[#5C2D91]"
                        />

                        <button
                            onClick={() => navigate("/screen-1")}
                            className="w-full bg-[#5C2D91] text-white py-2 rounded font-medium text-sm hover:opacity-90"
                        >
                            {mode === "login" ? "Log in" : "Create account"}
                        </button>

                        <img
                            src="/src/assets/data-product-image.png"
                            alt="Data Product"
                            className="mx-auto w-[210px] h-[180px] mt-8"
                        />
                    </div>
                </div>
            </div>



            {/* COPYRIGHT */}
            <div className="absolute bottom-6 right-8 text-xs text-gray-500">
                © 2026 Accenture. All Rights Reserved.
            </div>
        </div>
    );
}