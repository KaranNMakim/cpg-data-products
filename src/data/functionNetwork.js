export const functionNetworkData = {
    nodes: [
        { id: "Data Management & Cross-Functional", color: "#3B82F6" },
        { id: "Growth, Innovation & R&D", color: "#8B5CF6" },
        { id: "Supply Chain & Manufacturing", color: "#10B981" },
        { id: "Marketing, Commerce & Sales", color: "#F59E0B" },
        { id: "Finance", color: "#EF4444" },
        { id: "HR (Human Resources)", color: "#06B6D4" }
    ],
    links: [
        { source: "Data Management & Cross-Functional", target: "Growth, Innovation & R&D" },
        { source: "Data Management & Cross-Functional", target: "Supply Chain & Manufacturing" },
        { source: "Marketing, Commerce & Sales", target: "Finance" },
        { source: "Supply Chain & Manufacturing", target: "Marketing, Commerce & Sales" },
        { source: "HR (Human Resources)", target: "Finance" }
    ]
};
