# Product Roadmap
## CPG.ai Data Products Tool

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-04-28

---

## Vision

> **Become the single front door for every CPG data product on Azure** — from value-chain discovery to KPI lineage to one-click access to the underlying ADF pipelines, ADLS layers, and analytics outputs.

---

## Strategic Pillars

1. **Discoverability** — Any user can find the right data product in <30 seconds.
2. **Lineage Transparency** — Every KPI traceable from raw source to dashboard.
3. **Self-Service Onboarding** — Stewards can register a new data product in <5 minutes.
4. **Azure Native** — One-click navigation to ADF, ADLS, Synapse, Power BI.
5. **Trust & Governance** — Status, ownership, freshness, and quality visible everywhere.

---

## Release Timeline at a Glance

```
2026     Q2 ────── Q2/Q3 ────── Q3 ────── Q4 ────── 2027 Q1 ──── Q2
         │         │            │         │         │            │
         ├ v1.0   ├ v1.1       ├ v1.5   ├ v2.0    ├ v2.5       ├ v3.0
         │ MVP    │ Agentic    │ Auth   │ Live    │ Intelligent│ Marketplace
         │        │ Backend    │ + ETL  │ Lineage │ Catalog    │
         │        │            │ Code   │         │ (AI)       │
```

---

## Phase 1 — MVP ✅ (v1.0 — Released 2026 Q2)

**Goal:** Deliver a working catalog with browsing, lineage visualization, and creation flow.

### Delivered
- [x] React + Vite frontend with Tailwind CSS
- [x] Express + SQLite backend (15+ REST endpoints)
- [x] Data Product Registry with filtering, search, CSV export
- [x] Data Product detail page (KPIs, source tables, properties)
- [x] Function Mapping page
- [x] Function Overview (Executive view) with value-chain hierarchy
- [x] Sankey-based Lineage Dashboard (Executive + Detailed modes)
- [x] Analytics Product Details with multi-select filter and Excel export
- [x] Data Product Suite Details with ADF/ADLS deep links
- [x] Auto-generated ER Diagram via Mermaid
- [x] **3-step Create Data Product wizard** (Basic → KPIs → Source Tables)
- [x] Status badges (New / Active)
- [x] FlowGuide Bot for in-app guidance

---

## Phase 1.5 — Agentic Backend (v1.1 — 2026 Q2/Q3)

**Goal:** Replace manual data-product onboarding with a multi-agent system that formulates KPIs, discovers tables, synthesizes sample data, generates ADF pipelines, and wires everything end-to-end into the existing backend and frontend.

**Why now:** The MVP exposes the *shape* of a data product (KPIs, tables, lineage) but every field is filled by hand. The bottleneck is no longer the UI — it's the human effort to produce the metadata, the data, and the pipelines. A constellation of specialized agents collapses that effort from hours to minutes and creates a foundation for the AI features in v2.5.

### Agent Roster

| Agent | Responsibility | Inputs | Outputs |
|---|---|---|---|
| **KPI Agent** | Formulate and tag KPIs for a use case | Function, value chain, data product name, business context | KPI list with definitions, formulas, units; tags (function, value chain, business impact) written to `sankey_dataset.kpi` and `analytics_product_details` |
| **Table Discovery Agent** | Find relevant raw / staging tables and create them if missing | KPI list, source system catalog, ADLS metadata | Source table list (with schema), entries in `data_catalog` (raw → fact mapping), entries in `source_table_paths` |
| **Data Synthesis Agent** | Generate realistic synthetic data for the use case | Table schemas, KPI definitions, industry context (CPG personas, geographies, time windows) | Parquet/CSV files written to ADLS `raw/` zone; row counts and realism profile recorded |
| **ADF Pipeline Agent** | Generate Azure Data Factory pipeline JSON (raw → staging → transformed) | `data_catalog` entries with `transformation_logic`, source/target table names | Pipeline JSON, dataset JSON, linked-service JSON; deployed to ADF; pipeline names written to `etl_mapping` |
| **Integration Agent** | Wire everything to backend + frontend, validate end-to-end | Outputs of the four agents above | DB rows committed atomically; smoke-test results; "Active" status flip on the data product |

### Orchestration

- **Conductor** — a top-level agent that drives the workflow:
  1. Receives a use-case brief (function, value chain, name, plain-English description)
  2. Invokes **KPI Agent** → confirms KPIs with the steward
  3. Invokes **Table Discovery Agent** → confirms table list
  4. Invokes **Data Synthesis Agent** in parallel with **ADF Pipeline Agent**
  5. Invokes **Integration Agent** to commit and validate
  6. Surfaces a single approval card in the UI per stage (human-in-the-loop)
- Built on **Azure OpenAI Assistants API** or **LangGraph** (TBD); state persisted per run for replay/debug
- Tool-use functions map 1:1 to existing Express endpoints (`/api/data-products`, `/api/data-catalog`, etc.)

### Frontend Surface

- [ ] **"Generate with Agents"** entry on the Create Data Product wizard (alternative to the manual 3-step flow)
- [ ] **Agent Run Console** showing live progress per agent (streamed status, intermediate artifacts, retry buttons)
- [ ] **Approval gates** at each stage — steward reviews KPIs, tables, synthetic data preview, and pipeline diff before committing
- [ ] **Run history** per data product: who triggered, which agents ran, audit trail of changes
- [ ] **Agent telemetry tab** — token usage, latency, cost per run

### Backend Additions

- [ ] New service: `agents/` module with one file per agent + a conductor
- [ ] New tables:
  - `agent_runs` — run id, status, started_at, finished_at, triggered_by, data_product_id
  - `agent_steps` — run_id, agent_name, input_json, output_json, status, started_at, finished_at
  - `agent_artifacts` — run_id, step_id, artifact_type (kpi | schema | sample_data | pipeline_json), blob_url
- [ ] New endpoints:
  - `POST /api/agents/runs` — start a new run
  - `GET /api/agents/runs/:id` — poll status
  - `POST /api/agents/runs/:id/approve/:step` — human approval
  - `GET /api/agents/runs/:id/stream` — SSE for live updates
- [ ] Azure integrations:
  - **Azure OpenAI** — agent reasoning (GPT-4o or successor)
  - **Azure Storage Blob SDK** — write synthesized data to ADLS
  - **ADF Management API** — deploy generated pipelines
  - **Azure Key Vault** — agent service principal credentials

### Quality Gates

- [ ] Each agent's output validated by a deterministic checker before committing (schema validation, KPI formula sanity, ADF JSON schema compliance)
- [ ] All agent runs are idempotent and reversible (rollback endpoint)
- [ ] No production deploy without explicit human approval at the final gate
- [ ] Cost guardrails: per-run token budget, daily org-wide cap

### Success Criteria

- Steward creates a fully wired data product (KPIs + tables + sample data + ADF pipelines) in **<10 minutes** vs. ~hours today
- Generated ADF pipelines run successfully on first deploy in **>80%** of cases
- Agent suggestions accepted by stewards without edits in **>60%** of cases (rising to 80% by v2.5)

---

## Phase 2 — Production Hardening (v1.5 — 2026 Q3)

**Goal:** Make it deployable, secure, and operationally sound.

### Authentication & Authorization
- [ ] **Azure Entra ID (Azure AD) login** via MSAL.js
- [ ] Role-based access:
  - **Viewer** — read-only browsing
  - **Steward** — create/edit data products
  - **Admin** — manage users, delete entries
- [ ] Backend middleware to validate bearer tokens
- [ ] Route-level guards on the frontend

### Database Migration
- [ ] Migrate from SQLite → **Azure SQL Database** (or PostgreSQL Flexible Server)
- [ ] Schema versioning via `node-pg-migrate` or `umzug`
- [ ] Connection pooling, retry policies

### ETL Code Generation
- [ ] **Implement `POST /api/etl/download`** — generate ZIP of ADF pipeline JSON for a data product
- [ ] Template-based ADF pipeline generation from `data_catalog` rows
- [ ] Bicep / Terraform output option for Infrastructure-as-Code

### DevOps
- [ ] CI/CD pipeline (GitHub Actions → Azure App Service + Static Web Apps)
- [ ] Application Insights for both frontend and backend
- [ ] Health check endpoints (`/api/health`, `/api/version`)
- [ ] Secrets in Azure Key Vault (not `.env`)

---

## Phase 3 — Live Lineage & Quality (v2.0 — 2026 Q4)

**Goal:** Move beyond static catalog → real-time, observable lineage.

### Live ADF Integration
- [ ] **ADF pipeline status panel** on data product detail page
  - Last run timestamp, success/failure, duration
  - Triggered via Azure Resource Graph or ADF REST API
- [ ] One-click pipeline trigger from UI (with permission checks)
- [ ] Run history sparkline per pipeline

### ADLS Browse Embedded
- [ ] Inline ADLS file browser (top N files per zone) using `@azure/storage-blob`
- [ ] Sample data preview (CSV / Parquet) directly in the UI

### Data Quality Dashboards
- [ ] Per-data-product DQ score: completeness, freshness, uniqueness
- [ ] Pulled from existing Databricks / Microsoft Purview integrations
- [ ] DQ trend sparklines on registry cards

### Enhanced ERD
- [ ] Drill-down: click a table → see full attribute list, transformations
- [ ] Cross-data-product lineage (shared dimensions: Customer, Product, Outlet)
- [ ] Export ERD as PNG / PDF / draw.io XML

---

## Phase 4 — Intelligent Catalog (v2.5 — 2027 Q1)

**Goal:** Reduce manual effort. Use AI to suggest, classify, and validate.

### AI-Assisted Onboarding
- [ ] **GenAI suggestion engine** in the Create Data Product wizard:
  - Suggest KPIs based on Function + Value Chain
  - Suggest source tables based on existing similar products
  - Auto-generate description from name + tags
- [ ] **Schema inference** — point the wizard at an ADLS path, infer raw tables and columns

### Search Upgrades
- [ ] Semantic search across data products, KPIs, business purposes
- [ ] Natural language Q&A ("Show me all data products for Marketing in EMEA")
- [ ] Backed by Azure OpenAI + embeddings on existing metadata

### Auto-Tagging
- [ ] Suggest function and value chain from product name + description
- [ ] PII / sensitivity tagging via Microsoft Purview integration

### Notifications
- [ ] Subscribe to a data product → get email/Teams alert on schema change, pipeline failure, or KPI redefinition

---

## Phase 5 — Marketplace & Federation (v3.0 — 2027 Q2)

**Goal:** Scale beyond a single Azure environment.

### Multi-Environment / Multi-Region
- [ ] Federation across Dev / UAT / Prod environments
- [ ] Cross-region catalog sync
- [ ] Per-region governance and access policies

### Marketplace Features
- [ ] **Subscribe / Bookmark** data products
- [ ] Usage metrics: who's using each data product, which KPIs are most viewed
- [ ] Ratings and reviews from consumers
- [ ] **Request Access** workflow with steward approval

### Domain Federation (Data Mesh)
- [ ] Each function (Marketing, Finance, Supply Chain) operates as a domain owner
- [ ] Per-domain branding, governance, SLAs
- [ ] Cross-domain dependency tracking

### External Sharing
- [ ] Share data product catalog (read-only) with external partners (retailers, distributors)
- [ ] OAuth-protected public catalog API

---

## Continuous Improvement Streams (All Phases)

### UX / Accessibility
- WCAG 2.1 AA compliance audit (Q3 2026)
- Mobile-responsive layouts for stewards on tablets
- Keyboard navigation for all interactive elements
- Dark mode support

### Performance
- Virtualized lists for >1,000 data products
- Lazy-load detail pages
- Edge-cached read endpoints (Azure Front Door)

### Documentation
- Public API reference (OpenAPI/Swagger)
- Steward handbook (how to register, name, tag)
- End-user video walkthroughs

---

## KPIs to Track

| Metric | v1.0 Baseline | v1.1 Target (Agentic) | v2.0 Target | v3.0 Target |
|---|---|---|---|---|
| Active monthly users | 50 | 100 | 250 | 1,000+ |
| Data products registered | 39 (seed) | 75 | 150 | 500+ |
| Avg time to find a data product | n/a | <45s | <30s | <15s |
| Avg time to create a data product (steward) | ~10 min manual | **<10 min agent-driven** | <5 min | <2 min |
| % onboarding done by agents | 0% | >50% | >75% | >90% |
| Agent-suggestion acceptance rate | n/a | >60% | >70% | >80% |
| First-deploy success rate (generated ADF) | n/a | >80% | >90% | >95% |
| ADF pipeline link click-through | n/a | n/a | >40% | >60% |
| % data products with status "Active" | ~95% | >95% | >95% | >98% |
| User satisfaction (NPS) | — | >20 | >30 | >50 |

---

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Azure Entra rollout delays | Medium | High | Begin auth POC in Q2 2026 |
| ADF API rate limits | Low | Medium | Cache pipeline metadata; batch refresh |
| Catalog drift vs. actual ADF state | High | Medium | Phase 3 sync job; status freshness indicator |
| Stewardship adoption (low data quality) | Medium | High | Steward enablement program; gamification |
| GenAI hallucination on suggestions | Medium | Medium | Always show "AI-suggested" with confirm step |
| **Agent generates invalid ADF JSON** (v1.1) | Medium | High | Deterministic validators per agent; dry-run deploy; rollback endpoint |
| **Agent runaway costs** (v1.1) | Medium | Medium | Per-run token budget, daily org cap, cost dashboard |
| **Synthetic data leaks PII patterns** (v1.1) | Low | High | Synthesis from schema only — no real PII inputs; Purview scan post-write |
| **Agents bypass governance** (v1.1) | Medium | High | Mandatory human approval at every commit gate; full audit trail in `agent_runs` |

---

## Open Questions (For Stakeholder Alignment)

1. **Scope of v2.0 ETL download** — generate from-scratch or wrap existing pipelines?
2. **DQ tooling** — build in-app vs. embed Databricks DLT / Purview dashboards?
3. **Multi-tenancy** — single CPG company instance or SaaS for multiple CPGs?
4. **Power BI integration** — embed reports in detail pages, or just deep-link?
5. **Glossary management** — separate business glossary or merge into this tool?

---

## Out of Scope (Through v3.0)

- Real-time data ingestion (orchestrate via ADF, do not replace it)
- Custom dashboarding (link to Power BI; do not duplicate)
- Source code repository for ADF pipelines (link to Azure DevOps / GitHub)
- General data warehouse SQL editor (use Synapse Studio)
