import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";

const SankeyDiagram = ({ data, onNodeClick, onNodeHover, headers }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({
                width: rect.width,
                height: rect.height || 520
            });
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);
        handleResize();

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!data?.nodes?.length || !dimensions.width || !dimensions.height) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        /* ================= TOOLTIP ================= */
        d3.select(containerRef.current).selectAll(".sankey-tooltip").remove();

        const tooltip = d3
            .select(containerRef.current)
            .append("div")
            .attr("class", "sankey-tooltip")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("background", "white")
            .style("border", "1px solid #e5e7eb")
            .style("border-radius", "8px")
            .style("padding", "6px 10px")
            .style("font-size", "12px")
            .style("color", "#111827")
            .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
            .style("opacity", 0)
            .style("z-index", 50);

        /* 🔧 MARGIN FIX (LESS TOP/LEFT, MORE RIGHT) */
        const margin = { top: 20, right: 200, bottom: 15, left: 110 };

        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;
        if (width <= 0 || height <= 0) return;

        const columnColors = [
            "#1E90FF",
            "#3CB371",
            "#FFD700",
            "#FF7F50",
            "#8A2BE2",
            "#FF69B4"
        ];

        const sankeyGenerator = d3Sankey()
            .nodeWidth(8)
            .nodePadding(18)
            .extent([[0, 0], [width, height]]);

        const graph = sankeyGenerator({
            nodes: data.nodes.map(d => ({ ...d })),
            links: data.links.map(d => ({ ...d }))
        });

        svg
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

        const g = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const isDetailedView = headers && headers.length > 3;

        /* ================= LINKS ================= */
        const links = g.append("g")
            .selectAll("path")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke", d => columnColors[d.source.layer] || "#10b981")
            .attr("stroke-width", d => Math.max(4, d.width))
            .attr("fill", "none")
            .attr("stroke-opacity", 0.45)
            .on("mouseenter", (event, d) => {
                const targetColumn =
                    headers && headers[d.target.layer]
                        ? headers[d.target.layer]
                        : "Count";

                tooltip
                    .html(`
                        <div style="font-weight:600; margin-bottom:4px">
                            ${d.source.name} → ${d.target.name}
                        </div>
                        <div style="font-size:11px; color:#374151">
                            ${targetColumn}: <strong>${d.value}</strong>
                        </div>
                    `)
                    .style("opacity", 1);

                links
                    .attr("stroke-opacity", l => (l === d ? 0.9 : 0.08))
                    .attr("stroke-width", l => Math.max(4, l.width));
            })
            .on("mousemove", (event) => {
                const rect = containerRef.current.getBoundingClientRect();
                tooltip
                    .style("left", `${event.clientX - rect.left + 12}px`)
                    .style("top", `${event.clientY - rect.top + 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);

                links
                    .attr("stroke-opacity", 0.45)
                    .attr("stroke-width", d => Math.max(4, d.width));
            });

        /* ================= NODES ================= */
        g.append("g")
            .selectAll("rect")
            .data(graph.nodes)
            .enter()
            .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => Math.max(8, d.y1 - d.y0))
            .attr("rx", 3)
            .attr("fill", d => columnColors[d.layer] || "#10b981")
            .style("cursor", d =>
                headers &&
                    headers[d.layer] === "Data Product (Suite)"
                    ? "pointer"
                    : "default"
            )
            .on("mouseenter", (event, d) => {
                tooltip
                    .html(`
                        <div style="font-weight:600">${d.name}</div>
                        ${isDetailedView && headers[d.layer] === "Data Product (Suite)"
                            ? `<div style="margin-top:4px;font-size:10px;color:#6b7280;font-weight:500">
                                   Click to view details
                               </div>`
                            : ""
                        }
                    `)
                    .style("opacity", 1);

                links
                    .attr("stroke-opacity", l =>
                        l.source === d || l.target === d ? 0.9 : 0.08
                    )
                    .attr("stroke-width", d => Math.max(4, d.width));

                onNodeHover?.(d);
            })
            .on("mousemove", (event) => {
                const rect = containerRef.current.getBoundingClientRect();
                tooltip
                    .style("left", `${event.clientX - rect.left + 12}px`)
                    .style("top", `${event.clientY - rect.top + 12}px`);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);

                links
                    .attr("stroke-opacity", 0.45)
                    .attr("stroke-width", d => Math.max(4, d.width));

                onNodeHover?.(null);
            })
            .on("click", (_, d) => {
                if (
                    isDetailedView &&
                    headers &&
                    headers[d.layer] === "Data Product (Suite)"
                ) {
                    onNodeClick?.(d.name);
                }
            });

        /* ================= NODE LABELS ================= */
        g.append("g")
            .selectAll("text")
            .data(graph.nodes)
            .enter()
            .append("text")
            .attr("x", d => d.x1 + 8)   // 🔧 slightly reduced offset
            .attr("y", d => (d.y0 + d.y1) / 2)
            .attr("dy", "0.35em")
            .text(d => d.name)
            .style("font-size", "10px")
            .style("font-weight", "600")
            .style("fill", "#000")
            .call(wrapSankeyText, 180); // 🔧 more room for wrapping

        /* ================= COLUMN HEADERS ================= */
        if (headers?.length) {
            headers.forEach((h, i) => {
                const layerNodes = graph.nodes.filter(n => n.layer === i);
                if (!layerNodes.length) return;

                const x =
                    layerNodes[0].x0 +
                    (layerNodes[0].x1 - layerNodes[0].x0) / 2;

                g.append("text")
                    .attr("x", x)
                    .attr("y", -8)
                    .attr("text-anchor", "middle")
                    .style("font-size", "10px")
                    .style("font-weight", "800")
                    .style("fill", "#000")
                    .text(h.toUpperCase());
            });
        }
    }, [data, dimensions, headers, onNodeClick, onNodeHover]);

    return (
        <div className="w-full flex justify-center">
            <div
                ref={containerRef}
                className="bg-white rounded-[40px] relative overflow-visible"
                style={{
                    width: "100%",
                    maxWidth: "1400px",
                    height: "331px"
                }}
            >
                <svg ref={svgRef} className="w-full h-full block" />
            </div>
        </div>

    );
};

// =====================
// TEXT WRAP
// =====================
function wrapSankeyText(textSelection, maxWidth) {
    textSelection.each(function () {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word, line = [], lineNumber = 0;
        const lineHeight = 1.1;
        const y = text.attr("y");
        const x = text.attr("x");

        let tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", "0em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > maxWidth) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", `${++lineNumber * lineHeight}em`)
                    .text(word);
            }
        }
    });
}

export default SankeyDiagram;
