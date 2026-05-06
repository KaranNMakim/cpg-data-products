import DataProductDetails from "../pages/DataProductDetails";
import DataProductSuiteDetails from "../pages/DataProductSuiteDetails";
import FunctionOverview from "../pages/FunctionOverview";
import SankeyDashboard from "../pages/SankeyDashboard";

export const APP_FLOW = {
    global: {
        overview: `
The Data Products App helps users understand how enterprise data is organized,
connected, and consumed across the business.

Users start by exploring value chains and functions, then move into
data product relationships, KPIs, source systems, and finally
table-level lineage and attributes.
    `
    },

    screens: {
        FunctionOverview: {
            purpose: "High-level overview of the value chain along with functions and data products belonging to them",
            userJourney: [
                "Understand the CG&S Value Chain",
                "Identify relevant data products",
                "Drill down into details"
            ]
        },

        SankeyDashboard: {
            purpose: `This page allows users to explore how data products are connected
across functions and value chains using a Sankey visualization.

It helps users understand relationships, dependencies, and coverage
between data products, analytics products, and consumer-aligned views,
enabling both high-level insight and deeper drill-down.`,
            explains: `
The Sankey dashboard visually represents how data products are connected
across the application.

Each node represents a data product or analytics layer, and the flowing
links show how data moves from one product to another.

The width of each flow indicates the strength or volume of the relationship.

This view helps users understand dependencies, coverage, and how
business outcomes are supported by underlying data products.

In Executive mode, the view is simplified to highlight high-level
connections and business impact.

In Detailed mode, users can drill down further and click on individual
data products to explore their structure and lineage.
      `
        },

        DataProductDetails: {
            purpose: `This page provides a structured, business-level view of a selected data product.
It helps users understand what the product is, where it fits in the value chain,
which analytics it supports, and which systems it depends on.`,
            flow: [
                "Select filters such as Value Chain, Function, Analytics Product, or Data Product",
                "Review the tabular summary of matching data products",
                "Understand business ownership, KPIs, and source systems",
                "Click on a Data Product to drill down into technical lineage and tables"
            ],
            explains: `
The Product Details page presents key metadata about data products in a clear,
tabular format.

Each row represents a data product and shows:
• The business function and value chain it supports
• The analytics product it enables
• The KPIs delivered by the data product
• The source systems supplying the data and their type (internal or external)

This page acts as a bridge between business understanding and technical detail,
allowing users to validate relevance and then move deeper into data lineage
when required.
      `
        },
        DataProductSuiteDetails: {
            purpose: "Explain the structural design and table-level composition of a data product",
            flow: [
                "Source Tables → Raw & Derived Inputs",
                "Key Relationships → Primary & Foreign Keys",
                "Target Tables → Analytical Fact Models",
                "Generate ER Diagram → Visual Entity Relationships",
                "ETL Code → ETL Pipeline Code"
            ],
            explains: `
This screen explains how a data product is structured internally.
It shows the source tables feeding the product, the target fact tables created,
and the primary and foreign key relationships that connect them.
Users can also generate an ER diagram to visually understand table relationships
and data model design.
    `
        },
        AnalyticsProductDetails: {
            purpose: "Explain the business use case and value of an analytics product",
            flow: [
                "Analytics Product → Business Use Case",
                "Business Context → Purpose & Industry",
                "Stakeholders → Key Consumers",
                "Core Objects → Primary Entities",
                "Outcomes → Business Impact",
                "Export → Download as Excel"
            ],
            explains: `
This screen provides a business-facing view of an analytics product (use case).
It explains why the analytics product exists, the industry it applies to,
who consumes it, the primary business entities involved,
and the impact it delivers to the organization.
Users can also export the details as an Excel file for documentation or sharing.
    `
        },
        GenerateERDiagram: {
            purpose: "Visualize the entity-relationship structure of a data product",
            flow: [
                "Source Tables → Entities",
                "Target Tables → Fact Models",
                "Primary & Foreign Keys → Relationships",
                "ER Diagram → Visual Data Model",
                "Export → Download ER metadata as CSV"
            ],
            explains: `
This screen generates a visual ER diagram for the selected data product.
It shows how source and target tables are connected through primary
and foreign key relationships, helping users understand the underlying
data model and table dependencies.
Users can also export the ER diagram metadata in CSV format for
documentation, validation, or offline analysis.
    `
        }



    }
};
