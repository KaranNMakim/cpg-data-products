# Functional Requirements Document (FRD)
## CPG.ai Data Products Tool

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-04-28

---

## 1. Introduction

### 1.1 Purpose
The CPG.ai Data Products Tool is a web-based application designed to catalog, visualize, and manage end-to-end Consumer Packaged Goods (CPG) data products built on Microsoft Azure. It provides a single pane of glass for business users, data engineers, and analytics teams to discover data products, trace lineage from source systems to KPIs, and navigate to the underlying Azure resources (ADF pipelines, ADLS containers).

### 1.2 Scope
This tool enables:
- Browsing and creating CPG data products organized by Value Chain → Function hierarchy
- Viewing analytics products (KPIs) addressed by each data product
- Visualizing schema, source tables, and ER relationships
- Linking to Azure Data Factory pipelines and Azure Data Lake Storage (ADLS) containers
- Exporting catalog metadata for reporting and compliance

### 1.3 Definitions and Acronyms

| Term | Definition |
|---|---|
| CPG | Consumer Packaged Goods (e.g., food, beverage, personal care) |
| Data Product | A curated, reusable dataset addressing one or more business KPIs |
| Value Chain | High-level CPG operational stage (Innovate, Plan, Source, Make, Deliver, Market, Sell, Support, Sustainability, Data Foundation) |
| Function | Business function within a value chain (e.g., Marketing, Finance, Supply Chain) |
| KPI | Key Performance Indicator tracked by a data product |
| Analytics Product | Pre-packaged analytics solution (e.g., "Brand Equity Tracking", "Trade Promotion Optimization") |
| ADF | Azure Data Factory — Microsoft's cloud ETL/ELT orchestration service |
| ADLS | Azure Data Lake Storage Gen2 |
| ERD | Entity Relationship Diagram |
| Layer (Raw / Staging / Transformed) | Medallion architecture zones in ADLS |

### 1.4 Target Users

| Role | Primary Need |
|---|---|
| **Business Analyst** | Discover existing data products, view tracked KPIs, browse value chains |
| **Data Engineer** | Inspect source tables, view ETL pipeline links, trace lineage |
| **Data Steward** | Register new data products, assign KPIs, document source systems |
| **Executive / Sponsor** | High-level Function/Value Chain coverage view, executive Sankey |

---

## 2. Functional Requirements

### 2.1 Authentication

| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system shall present a login screen at the root URL `/`. |
| FR-AUTH-02 | Upon successful login, the user is redirected to the Data Product Registry (`/screen-1`). |
| FR-AUTH-03 | All application routes (except `/`) shall be wrapped in an authenticated layout. |

### 2.2 Data Product Registry (Landing Page)

| ID | Requirement |
|---|---|
| FR-REG-01 | The system shall display all registered data products as a card grid. |
| FR-REG-02 | Each card shall show product name, source system, status badge, and tag pills (Function, Value Chain). |
| FR-REG-03 | Status badge shall be **green "Active"** for established products and **amber "New"** for newly created products without ETL/Azure linkage. |
| FR-REG-04 | The page shall display 4 KPI stats: total Data Products, total Functions, total Value Chains, and Active count. |
| FR-REG-05 | Users shall be able to filter by Function (multi-select) and Value Chain (multi-select). |
| FR-REG-06 | Function and Value Chain filter dropdowns shall be cross-aware — selecting one narrows the options of the other. |
| FR-REG-07 | A search bar shall filter products by name (case-insensitive substring match). |
| FR-REG-08 | An **Export** button shall download the filtered list as a CSV file. |
| FR-REG-09 | A **+ Create Data Product** button shall navigate to the creation wizard. |
| FR-REG-10 | Clicking a card shall navigate to the Data Product detail page (`/screen-2/<name>`). |

### 2.3 Create Data Product (Multi-Step Wizard)

| ID | Requirement |
|---|---|
| FR-CRT-01 | The wizard shall be a full-page experience with a 3-step indicator (Basic Details → KPIs → Source Tables). |
| FR-CRT-02 | **Step 1 — Basic Details** shall capture: Data Product Name (required), Analytics Product/KPI, Function (required, dropdown), Value Chain (required, dropdown), Consumer Align Data Product, Source Align Data Product, Source System Name, Source System Type (Internal / External / Internal + External). |
| FR-CRT-03 | Free-text fields with established options shall provide **autocomplete suggestions** filtered from existing values. |
| FR-CRT-04 | **Step 2 — KPIs** shall allow users to add one or more KPI tags via tag-input control with autocomplete from existing KPIs. KPIs may be removed via an "×" affordance. |
| FR-CRT-05 | **Step 3 — Source Tables** shall allow users to add one or more raw source table names. |
| FR-CRT-06 | A **Preview** panel on Step 3 shall summarize all entered values before submission. |
| FR-CRT-07 | The user shall be able to navigate **Back** to any previous step without losing data, or **Skip** ahead from Step 2. |
| FR-CRT-08 | On submit, the system shall persist:<br>– A row in `data_products` (status defaults to "New")<br>– A row in `sankey_dataset` (with concatenated KPI list)<br>– One row per source table in `data_catalog`. |
| FR-CRT-09 | After successful creation, the user shall be redirected to the new product's detail page. |
| FR-CRT-10 | If the API call fails, an inline error message shall appear without losing form state. |

### 2.4 Data Product Detail Page

| ID | Requirement |
|---|---|
| FR-DP-01 | The page shall display the product title, status badge, and source-system summary. |
| FR-DP-02 | A **Resource Mapping** panel shall show: Data Product → Tagged Function → Tagged Value Chain. |
| FR-DP-03 | A **Properties** panel shall list source system, source type, function, value chain, and analytics product. |
| FR-DP-04 | The **Function** chip shall navigate to the Function Mapping page filtered by that function. |
| FR-DP-05 | The **Value Chain** chip shall navigate to the Lineage page filtered by that value chain and function. |
| FR-DP-06 | The **Analytics Product** link shall navigate to the Analytics Product Details page pre-filtered by that analytics product. |
| FR-DP-07 | A **KPIs Tracked** panel shall display all KPIs as orange tag pills. |
| FR-DP-08 | A **Source Tables** panel shall display all raw source tables as blue tag pills with a count. |
| FR-DP-09 | A **Back to Data Product Registry** link shall return the user to the registry. |

### 2.5 Function Mapping Page

| ID | Requirement |
|---|---|
| FR-FM-01 | The page shall list all data products grouped or filtered by Function. |
| FR-FM-02 | Function and Value Chain filter dropdowns shall be available. |
| FR-FM-03 | When entered with a `selectedFunction` from another page, the function filter shall be pre-applied. |
| FR-FM-04 | Users shall be able to export the filtered table to CSV. |

### 2.6 Function Overview Page (Executive View)

| ID | Requirement |
|---|---|
| FR-FO-01 | The page shall present a value-chain-level visual: 9 ordered value chains (Innovate → Sustainability) plus Data Foundation. |
| FR-FO-02 | Each value chain shall display its functions with associated data products as expandable groups. |
| FR-FO-03 | Hover tooltips shall describe each value chain and function in business language. |
| FR-FO-04 | Clicking a data product shall navigate to its detail page. |

### 2.7 Data Product Lineage (Sankey Dashboard)

| ID | Requirement |
|---|---|
| FR-LIN-01 | The page shall render a Sankey diagram showing flow across Function → Value Chain → Data Product (Suite) → Analytics Product → Consumer Align → Aggregated Data Product. |
| FR-LIN-02 | Two view modes shall be supported: **Executive** (3-column overview) and **Detailed** (4+ column lineage). |
| FR-LIN-03 | Filters shall include Value Chain (single-select via URL param) and Functions (multi-select). |
| FR-LIN-04 | Filter state shall be reflected in the URL query string for shareable links. |
| FR-LIN-05 | Clicking a node shall navigate to the corresponding detail page. |
| FR-LIN-06 | A **Back to Data Products Page** link shall be present at the top of the page. |

### 2.8 Analytics Product Details Page

| ID | Requirement |
|---|---|
| FR-AP-01 | The page shall display a tabular view of analytics products (Business Purpose, Industry, Key Consumers, Primary Entities, Business Impact). |
| FR-AP-02 | A multi-select dropdown shall allow filtering by one or more analytics products. |
| FR-AP-03 | When entered with a `name` URL parameter, the filter shall be pre-applied to that analytics product. |
| FR-AP-04 | A **Reset Filter** button shall clear the selection. |
| FR-AP-05 | A **Download Excel** button shall export the filtered table as `.xlsx`. |

### 2.9 Data Product Suite Details

| ID | Requirement |
|---|---|
| FR-SUITE-01 | The page shall list all analytics products contained in a data product suite. |
| FR-SUITE-02 | For each analytics product, the page shall display source (raw) and target (consumption) tables. |
| FR-SUITE-03 | An **ETL Code** button shall open a modal with links to:<br>– Azure Data Factory authoring URL (factory-level)<br>– Pipeline-specific authoring URLs<br>– Download ZIP of generated ETL code (future). |
| FR-SUITE-04 | Source tables prefixed with `raw_` shall link to the corresponding ADLS container in the Azure portal. |

### 2.10 Generate ER Diagram

| ID | Requirement |
|---|---|
| FR-ERD-01 | Given a data product suite, the system shall auto-generate an ER diagram via Mermaid. |
| FR-ERD-02 | The diagram shall show raw → fact table relationships with `||--o{` cardinality. |
| FR-ERD-03 | Each table shall show up to 5 attributes; additional attributes shall be summarized as `+N more` in an amber-highlighted row. |
| FR-ERD-04 | A **Download CSV** button shall export the ER metadata (Table_Type, Table_Name, Attribute, Data_Type, Key_Type). |
| FR-ERD-05 | The diagram shall scale to fit the viewport without losing readability. |

### 2.11 Azure Integration (Hyperlinks)

| ID | Requirement |
|---|---|
| FR-AZ-01 | The system shall construct Azure portal deep links from environment variables (Subscription ID, Resource Group, ADF Name, Storage Account, Container). |
| FR-AZ-02 | Pipeline links shall follow: `https://adf.azure.com/en/authoring/pipeline/<encoded-pipeline-name>?factory=<encoded-factory-path>`. |
| FR-AZ-03 | ADLS container links shall follow: `https://portal.azure.com/#view/Microsoft_Azure_Storage/ContainerMenuBlade/~/overview/storageAccountId/<encoded-id>/path/<container>`. |
| FR-AZ-04 | Newly created data products **without** Azure assets shall display **"New"** status (no broken links). |

### 2.12 FlowGuide Bot (In-App Help)

| ID | Requirement |
|---|---|
| FR-BOT-01 | A floating help button shall be visible on every authenticated page. |
| FR-BOT-02 | Clicking it shall open a chat-style modal with a guided walk-through of the current page. |

---

## 3. Non-Functional Requirements

### 3.1 Performance
- Registry page shall load <1.5s on a 4G connection with up to 500 data products.
- Sankey diagram shall render <2s for the full dataset.
- ER diagram generation shall complete <3s for a single data product suite.

### 3.2 Usability
- All forms shall provide inline validation with field-level error messages.
- Color-coded badges (green/amber/orange/blue) shall convey status and category at a glance.
- Color contrast shall meet WCAG 2.1 AA.

### 3.3 Security
- API endpoints shall validate input parameters server-side.
- SQL queries shall use parameterized statements (no string concatenation).
- Azure portal links shall use HTTPS only.

### 3.4 Compatibility
- Supported browsers: Chrome 110+, Edge 110+, Firefox 110+, Safari 16+.
- Responsive layout: desktop (≥1280px) is the primary target; tablet support is best-effort.

### 3.5 Maintainability
- All page components shall fetch data via the centralized `src/api.js` client.
- Database schema migrations shall be versioned in `db/setup.js`.

---

## 4. Out of Scope (Phase 1)
- User authentication beyond a stub login screen
- Role-based access control (RBAC)
- Live ETL pipeline execution from the UI
- Real-time data quality dashboards
- Mobile-first responsive design
