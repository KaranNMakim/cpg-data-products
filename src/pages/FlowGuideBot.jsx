import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { APP_FLOW } from "../data/appFlowConfig";

export default function FlowGuideBot() {
    const location = useLocation();

    // ✅ Hide chatbot on Login page
    if (location.pathname === "/") return null;

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi 👋 I can explain how this application works. Ask me about the flow."
        }
    ]);
    const [input, setInput] = useState("");

    /* =====================================================
       MAP ROUTES TO APP_FLOW SCREEN KEYS
    ===================================================== */
    const currentScreen = () => {
        if (location.pathname === "/overview") return "FunctionOverview";
        if (location.pathname === "/details") return "SankeyDashboard";
        if (location.pathname === "/data-product-details") return "DataProductDetails";
        if (location.pathname.startsWith("/data-product-suite-details")) {
            return "DataProductSuiteDetails";
        }

        if (location.pathname === "/generate-er-diagram") return "GenerateERDiagram";
        if (location.pathname === "/analytics-product-details") return "AnalyticsProductDetails";
        return null;
    };

    const generateReply = (question) => {
        const screenKey = currentScreen();
        const flowData = screenKey ? APP_FLOW.screens[screenKey] : null;
        const q = question.toLowerCase();

        if (q.includes("overall") || q.includes("app")) {
            return APP_FLOW.global.overview;
        }

        if (q.includes("purpose") || q.includes("why")) {
            return flowData?.purpose || "This page explains a key part of the application.";
        }

        if (q.includes("flow") || q.includes("journey")) {
            return flowData?.flow
                ? flowData.flow.join(" → ")
                : flowData?.userJourney?.join(" → ");
        }

        if (q.includes("what is this") || q.includes("explain")) {
            return flowData?.explains || "This screen provides contextual insights.";
        }

        return "Try asking: 'What is the purpose of this page?' or 'Explain the flow here.'";
    };

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [
            ...prev,
            { sender: "user", text: input },
            { sender: "bot", text: generateReply(input) }
        ]);
        setInput("");
    };

    return (
        <>
            <button
                className="fixed bottom-6 right-6 bg-[#7B2CBF] text-white p-3 rounded-full shadow-xl z-50"
                onClick={() => setOpen(!open)}
            >
                {open ? <X /> : <MessageCircle />}
            </button>

            {open && (
                <div className="fixed bottom-20 right-12 w-80 bg-white rounded-xl shadow-xl border z-50">
                    <div className="p-3 bg-[#7B2CBF] text-white font-bold text-sm rounded-t-xl">
                        App Flow Guide
                    </div>

                    <div className="p-3 h-72 overflow-y-auto space-y-2 text-sm">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-lg max-w-[90%] ${m.sender === "bot"
                                    ? "bg-gray-100"
                                    : "bg-[#7B2CBF] text-white ml-auto"
                                    }`}
                            >
                                {m.text}
                            </div>
                        ))}
                    </div>

                    <div className="flex border-t">
                        <input
                            className="flex-1 p-2 text-sm outline-none"
                            placeholder="Ask about app flow..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                        />
                        <button
                            className="px-4 font-bold text-[#7B2CBF]"
                            onClick={handleSend}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
