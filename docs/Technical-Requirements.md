# Technical Requirements Document (TRD)
## CPG.ai Data Products Tool

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-04-28

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  React 19 + Vite 7 (Port 5173)                   │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  Pages: Registry, Detail, Sankey, ERD, Wizard, Mapping   │   │
│   │  Components: Modal, Cards, KPI, Sankey, ReactFlow        │   │
│   │  API Client: src/api.js (centralized fetch)              │   │
│   └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ /api/* (Vite proxy)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Express 4 API (Port 5000)                      │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  Routes: data-products, sankey, analytics-products,      │   │
│   │          etl-mapping, data-catalog, source-table-paths   │   │
│   │  DB Layer: db/index.js (better-sqlite3 wrapper)          │   │
│   └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ SQL
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  SQLite (db/app.db, WAL mode)                    │
│   Tables: data_products, sankey_dataset, analytics_product_      │
│   details, source_table_paths, etl_mapping, data_catalog         │
└──────────────────────────────────────────────────────────────────┘

           ┌──────────────────────────────────────────┐
           │   AZURE (External, deep-linked from UI)  │
           │   ┌──────────────┐    ┌────────────────┐ │
           │   │  Data        │    │  ADLS Gen2     │ │
           │   │  Factory     │    │  (raw/staging/ │ │
           │   │  (pipelines) │    │   transformed) │ │
           │   └──────────────┘    └────────────────┘ │
           └──────────────────────────────────────────┘
```

### 1.2 Deployment Topology (Phase 1 — Local Dev)
- **Frontend**: Vite dev server on `localhost:5173` (production build → Azure Static Web App)
- **Backend**: Node.js Express on `localhost:5000` (production → Azure App Service)
- **Database**: SQLite file `db/app.db` (production → Azure SQL Database or Cosmos DB)
- **Azure resources**: Existing CPG environment (subscription `8f75a913-...`, RG `cpgai-engineering-rg`)

---

## 2. Technology Stack

### 2.1 Frontend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | React | 19.2 | UI framework |
| Build tool | Vite | 7.2 | Dev server, bundler |
| Routing | react-router-dom | 7.11 | SPA routing |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS |
| Charts | @nivo/sankey, d3-sankey | 0.99 / 0.12 | Sankey diagrams |
| Diagrams | mermaid | 11.12 | Auto-generated ERDs |
| Flow viz | reactflow | 11.11 | Function flow graphs |
| Tour | react-joyride | 2.9 | Onboarding overlays |
| Icons | lucide-react, react-icons | 0.561 / 5.5 | Icon library |
| Excel/CSV | xlsx | 0.18 | Export to spreadsheet |
| PDF | jspdf | 4.0 | (Future) Print export |

### 2.2 Backend

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | 22.x | Server runtime |
| Web framework | Express | 4.18 | HTTP API |
| Database driver | better-sqlite3 | latest | Synchronous SQLite client |
| Module system | ESM (`"type": "module"`) | — | Native ES modules |

### 2.3 Database
- **SQLite 3** with WAL journaling for concurrent reads
- 6 tables, ~2,600 seed rows from JSON source files
- Foreign keys enabled but soft-enforced via app logic

### 2.4 Azure Integrations
- **Azure Data Factory** — pipeline orchestration (raw → staging → transformed)
- **Azure Data Lake Storage Gen2** — sample data files
- **Azure SDK** packages installed but unused in Phase 1: `@azure/identity`, `@azure/storage-blob`

---

## 3. Database Schema

### 3.1 Tables

#### `data_products` — Core registry
```sql
CREATE TABLE data_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  s_no INTEGER UNIQUE,
  functions TEXT NOT NULL DEFAULT '',
  analytics_product_kpi TEXT DEFAULT '',
  value_chain TEXT DEFAULT '',
  consumer_align_data_product TEXT DEFAULT '',
  source_align_data_product TEXT DEFAULT '',
  source_system_name TEXT DEFAULT '',
  source_system_type TEXT DEFAULT 'Internal',
  data_product TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',  -- 'Active' | 'New'
  created_at TEXT DEFAULT (datetime('now'))
);
```

#### `sankey_dataset` — Lineage flow rows (with KPI column)
```sql
CREATE TABLE sankey_dataset (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  functions TEXT, value_chain TEXT, data_product_suite TEXT,
  analytics_product_kpi TEXT, consumer_align_data_product TEXT,
  source_align_data_product TEXT, source_system_name TEXT,
  source_system_type TEXT, kpi TEXT
);
```

#### `analytics_product_details` — Business context for each KPI
```sql
CREATE TABLE analytics_product_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analytics_product TEXT, business_purpose TEXT,
  industry TEXT, key_consumers TEXT,
  entities TEXT, business_impact TEXT
);
```

#### `source_table_paths` — Suite → ADLS abbreviation mapping
```sql
CREATE TABLE source_table_paths (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_product_suite TEXT UNIQUE,
  analytics_product TEXT, abbreviation TEXT
);
```

#### `etl_mapping` — Suite → ADF pipeline associations
```sql
CREATE TABLE etl_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_product_suite TEXT, analytics_product TEXT, pipeline TEXT
);
```

#### `data_catalog` — Attribute-level lineage (raw → fact, transformations)
```sql
CREATE TABLE data_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_product_suite TEXT, analytics_product TEXT,
  consumption_table_group TEXT, fact_table TEXT,
  raw_table TEXT, consumption_table_attribute TEXT,
  attribute_type TEXT, data_type TEXT,
  range_val TEXT, transformation_logic TEXT
);
```

### 3.2 Seed Data
- Sourced from 6 JSON files in `src/data/`
- Loaded by `db/setup.js` (idempotent — drops and recreates DB)
- ~2,631 total rows on initial seed

---

## 4. API Specification

### 4.1 Base URL
- Dev: `http://localhost:5000`
- Frontend access: `/api/*` (proxied by Vite)

### 4.2 Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/data-products` | List all data products |
| POST | `/api/data-products` | Create a new data product (status defaults to "New") |
| PUT | `/api/data-products/:id` | Update a data product |
| DELETE | `/api/data-products/:id` | Delete a data product |
| GET | `/api/sankey` | All sankey rows |
| GET | `/api/sankey/:suite` | Sankey rows for one suite |
| POST | `/api/sankey` | Create a sankey row (used by wizard) |
| GET | `/api/analytics-products` | All analytics product details |
| GET | `/api/analytics-products/:name` | Single analytics product |
| GET | `/api/source-table-paths` | Returns nested object: `{ suite: { analyticsProduct, abbreviation } }` |
| GET | `/api/etl-mapping` | Returns nested object: `{ suite: { analyticsProducts: { name: { pipelines: [] } } } }` |
| GET | `/api/etl-mapping/:suite` | Pipelines for one suite |
| GET | `/api/data-catalog/:suite` | Nested catalog: `{ analyticsProduct: { tableGroup: { factTable: [attrs] } } }` |
| POST | `/api/data-catalog` | Bulk-create catalog entries (used by wizard) |

### 4.3 Request/Response Conventions
- Request bodies and responses use JSON with the **original column names** as keys (e.g., `"Data Product"`, `"Source System Name"`) to maintain frontend compatibility with legacy JSON shape.
- All errors return `{ "error": "<message>" }` with appropriate HTTP status (400, 404, 500).
- All endpoints are stateless — no session cookies in Phase 1.

---

## 5. Frontend Architecture

### 5.1 Routing

```
/                              → Login
/screen-1                      → Data Product Registry
/screen-2/:name                → Data Product Detail
/screen-3                      → Function Mapping
/overview                      → Function Overview (Executive)
/details                       → Sankey Lineage Dashboard
/data-product-details          → Aggregated lineage table
/data-product-suite-details    → Suite detail with ETL links
/generate-er-diagram           → Auto-generated ERD
/analytics-product-details     → Analytics product table
/create-data-product           → 3-step creation wizard
```

### 5.2 Component Organization

```
src/
├── pages/                  # Route-level full-screen views
├── components/
│   ├── Layout/             # Navbar, Breadcrumbs, AppLayout
│   ├── Visualizations/     # SankeyDiagram, ReactFlow nodes
│   ├── KPICard/
│   ├── AggregatedProductDetails/
│   ├── CreateDataProductModal.jsx (legacy)
│   └── ...
├── api.js                  # Centralized API client (fetch wrappers)
├── data/
│   ├── *.json              # Source-of-truth seed data
│   ├── mockData.js         # Helpers (processDataForSankey)
│   └── appFlowConfig.js    # FlowGuideBot script
└── App.jsx                 # Router setup
```

### 5.3 State Management
- **Local component state** via `useState` and `useEffect` — no Redux/Zustand
- URL query params used to share filter state across pages (Sankey, Analytics)
- `location.state` used for one-off navigation hints (e.g., `selectedFunction`)

### 5.4 Async Data Loading Pattern
```js
const [data, setData] = useState([]);
useEffect(() => {
  getDataProducts().then(setData).catch(console.error);
}, []);

// Memos must include async-loaded state in deps:
const derived = useMemo(() => compute(data), [data]);
```

---

## 6. Azure Integration Layer

### 6.1 Environment Variables (`.env`)

```env
VITE_AZ_STORAGE_ACCOUNT_NAME=cpgdataproduct
VITE_AZ_STORAGE_CONTAINER_NAME=inputfiles
VITE_AZ_SUBSCRIPTION_ID=8f75a913-2d07-46c2-ba88-770d8a73ccec
VITE_AZ_RESOURCE_GROUP=cpgai-engineering-rg
VITE_AZ_ADF_NAME=cpgai-engineering-adf
```

### 6.2 Deep Link Construction

**ADF Factory:**
```
https://adf.azure.com/en/authoring?factory=<encoded-factory-path>
```
where `factoryPath = /subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.DataFactory/factories/<adf>`

**ADF Pipeline:**
```
https://adf.azure.com/en/authoring/pipeline/<encoded-pipeline-name>?factory=<encoded-factory-path>
```

**ADLS Container:**
```
https://portal.azure.com/#view/Microsoft_Azure_Storage/ContainerMenuBlade/
~/overview/storageAccountId/<encoded-storage-id>/path/<container>
```

### 6.3 Medallion Layers (Data Flow in Azure)
```
Source Systems  →  raw_*  →  staging_*  →  fact_*  →  Power BI / Apps
   (PLM, ERP)      (ADLS)     (ADLS)      (ADLS)
                          ↑      ADF Pipelines      ↑
```

---

## 7. Local Setup & Operational Guide

### 7.1 Prerequisites
- Node.js 22.x
- npm 10.x

### 7.2 First-Time Setup
```bash
cd "Data App"
npm install --legacy-peer-deps
node db/setup.js          # Create + seed db/app.db
```

### 7.3 Running
```bash
# Terminal 1 — API
npm run server            # http://localhost:5000

# Terminal 2 — Frontend
npm run dev               # http://localhost:5173
```

### 7.4 Resetting the Database
```bash
node db/setup.js          # Wipes app.db and re-seeds from JSON
```

---

## 8. Security & Compliance Requirements

| Concern | Phase 1 Approach | Production Plan |
|---|---|---|
| Auth | Stub login | Azure AD / Entra ID via MSAL.js |
| API auth | None | Bearer token validation in Express middleware |
| RBAC | None | Role claims from Entra ID; route guards |
| SQL injection | Parameterized queries via better-sqlite3 | Same |
| XSS | React escaping by default | CSP headers |
| Secrets | `.env` (gitignored) | Azure Key Vault |
| HTTPS | Vite dev (HTTP) | Azure Front Door / App Gateway |

---

## 9. Performance Requirements

| Operation | Target | Mitigation |
|---|---|---|
| Registry load | <1.5s | SQLite read; in-memory cache for hot endpoints |
| Sankey render | <2s | Pre-computed nodes/links via `processDataForSankey` |
| ER diagram | <3s | Mermaid SVG rendering, attribute cap (5 + "+N more") |
| Create data product | <500ms | Single transaction across 3 tables |

---

## 10. Logging & Observability (Phase 2)

- Server logs to stdout (Phase 1)
- Phase 2: Azure Application Insights for both frontend and backend
- Health check endpoint: `GET /api/health` (TBD)

---

## 11. Backup & Disaster Recovery

- **Phase 1**: SQLite file is local; relies on git-versioned source JSON for re-seeding.
- **Phase 2 (production)**: Azure SQL automated backups (PITR 7 days), geo-redundant storage for ADLS.

---

## 12. Known Technical Constraints

1. **`assert { type: "json" }` deprecated** — switched to `with { type: "json" }` for Node 22.
2. **Vite proxy** — frontend `/api/*` requests forwarded to `localhost:5000` only in dev. Production deployment requires same-origin or CORS configuration.
3. **better-sqlite3 native binding** — must be rebuilt if Node major version changes.
4. **Status column added via ALTER TABLE** on existing DB — `db/setup.js` includes it for fresh installs.
