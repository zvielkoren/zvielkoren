<h1 align="center">Zviel Koren</h1>

<p align="center">
Systems Engineer · Mobile Architect · Open-Source Builder · Privacy-First Software · Minecraft Systems Developer
</p>

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:1e293b&height=140&section=header" />
</p>

---

# 🚀 Engineering Portfolio

A systems-oriented engineering portfolio focused on event-driven architecture, stateless backend design, and modular runtime systems. This profile operates as a **live engineering system dashboard** with automated data pipelines, deterministic scoring, and real-time metric updates.

---

## 📊 Live Profile Metrics

> Auto-generated via GitHub Actions (Data Pipeline v3, 6-hourly refresh)

```
Platform Status:    🟢 Online
Last Update:        Via pipeline-generated metrics
Pipeline Version:   v3.0.0
Cache Status:       Optimized
API Integration:    Active
Update Frequency:   Every 6 hours (scheduled)
```

---

## 🧠 Core Engineering Identity

### Architectural Domains

| Domain | Focus | Approach |
|--------|-------|----------|
| **Distributed Systems** | Event-driven architecture | Event-first design primitive |
| **Backend Engineering** | Orchestration layers | Stateless, composable services |
| **Client-Owned Data** | User-controlled storage | BYO storage, external authority |
| **Cross-Platform** | Flutter, iOS, Android | Unified mobile systems |
| **Minecraft Runtime** | Paper, Spigot, Bukkit | Plugin architecture, modularity |

### System Principles

* **Backend = Orchestration, Not Authority** — Backend services orchestrate workflows without owning data
* **Events = Primary Primitive** — Event-driven flows as first-class design element
* **Storage = External & User-Owned** — Data lives with users, not in backend
* **Failure = Design Constraint** — Resilience embedded in architecture
* **Modularity > Monoliths** — Composition over integration

---

## ⚙️ System Architecture

### Data Pipeline v3 - Engineering System Generator

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub API Ingestion Layer                    │
│         (Fetch repos, normalize schema, rate-limit cache)        │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                 Normalization Layer                              │
│        (Standardize repository schemas, validate fields)        │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Cache Layer                                    │
│         (Rate-limit protection, 6-hour TTL strategy)            │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              Scoring Engine v3                                   │
│  score = (stars×3) + (forks×2) + (recency×10)                   │
│        + (language×5) + activity_bonus                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│           Classification Engine                                  │
│   (Categorize: minecraft, automation, product, infra, data)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│        Ranking & Top-N Selection                                 │
│        (Filter forked/archived, rank by score, select top 6)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│         Rendering Layer & Injection Engine                       │
│    (Generate system cards, inject into README, commit changes)  │
└─────────────────────────────────────────────────────────────────┘
```

### GitHub Actions Automation

* **Trigger:** Scheduled cron every 6 hours + manual dispatch
* **Concurrency:** Single-instance protection (no race conditions)
* **Execution:**
  1. Checkout repository
  2. Setup Node.js 20
  3. Execute Data Pipeline v3 (scoring, classification, ranking)
  4. Render system cards
  5. Inject into README between markers
  6. Idempotent commit (only if changes detected)
  7. Push to main branch

---

## 🎯 Pinned Engineering Projects

> Dynamically ranked via Data Pipeline v3 scoring engine (every 6 hours)

<!--PINNED_REPOS_START-->

### 🔧 Featured Projects

*System cards auto-generated and injected by pipeline. Check back soon as projects are ranked by:*
- **Star engagement** (3x weight)
- **Community adoption** (2x forks)
- **Recency decay** (10x freshness multiplier)
- **Language impact** (5x tech-stack multiplier)
- **Activity signals** (watchers + open issues)

Each project is categorized by system type, scored deterministically, and rendered as an architecture card.

Example scoring for context:
```
Minecraft Plugin (updated today, 50 stars, 10 forks, Python)
= (50×3) + (10×2) + (1.0×10) + (1.2×5) + activity_bonus
= 150 + 20 + 10 + 6 + bonus
≈ 186+ points (rank varies by day)
```

<!--PINNED_REPOS_END-->

---

## 🎮 Minecraft System Status

### Build & Deployment Metrics

```
Build Status:               [ 🔄 Running via GitHub Actions ]
Latest Pipeline Run:        Every 6 hours
Deployment Frequency:       Continuous (on main branch)
Last Successful Pipeline:   Auto-tracked
```

### Version Tracking

| Component | Badge | Status |
|-----------|-------|--------|
| **GitHub Actions** | [![Pipeline Status](https://github.com/zvielkoren/zvielkoren/actions/workflows/pinned-repos.yml/badge.svg)](https://github.com/zvielkoren/zvielkoren/actions) | ✓ Active |
| **Release Channel** | ![GitHub Release](https://img.shields.io/github/v/release/zvielkoren/zvielkoren?display_name=tag) | Latest |
| **Last Commit** | ![GitHub Last Commit](https://img.shields.io/github/last-commit/zvielkoren/zvielkoren/main) | Live |
| **Repo Size** | ![GitHub Repo Size](https://img.shields.io/github/repo-size/zvielkoren/zvielkoren) | — |

---

## 🔌 System Integrations

### GitHub API Integration

* **Method:** REST API v3 with rate-limit aware caching
* **Authentication:** Token-based (GITHUB_TOKEN)
* **Rate Limit:** 60 req/hr unauthenticated, 5000/hr authenticated
* **Cache Strategy:** 6-hour TTL for repo data, 24-hour for user profile
* **Failure Handling:** Graceful degradation with cached fallback

### GitHub Actions CI/CD

* **Workflow:** `pinned-repos.yml` (Data Pipeline v3 orchestration)
* **Schedule:** `0 */6 * * *` (every 6 hours)
* **Runtime:** Ubuntu latest + Node.js 20
* **Permissions:** `contents: write` (README modification)
* **Idempotency:** Commit only on actual changes

---

## 🛠️ Technical Stack

### Languages & Runtimes

* **Primary:** Go, Rust, TypeScript, Python
* **Mobile:** Flutter, Swift, Kotlin
* **Game:** Java (Paper/Spigot), C#
* **Scripting:** Node.js, Bash

### Architecture Patterns

* Event-driven systems (message queues, event streams)
* Microservices & service mesh (orchestration focus)
* Serverless/FaaS (stateless, event-triggered)
* Plugin architectures (Minecraft, Discord)
* Data pipeline orchestration (ETL/ELT patterns)

### DevOps & Infrastructure

* **CI/CD:** GitHub Actions (primary workflow automation)
* **Containerization:** Docker, container registries
* **Version Control:** Git workflow, branching strategies
* **Monitoring:** GitHub API insights, runtime metrics
* **Infrastructure Code:** Terraform, CloudFormation patterns

---

## 📈 Engineering Metrics

### Activity Timeline

- **Active Development:** High-frequency updates across systems
- **Domain Focus:** Backend services, event systems, cross-platform mobile
- **Open Source Contribution:** Community-driven plugins and tools
- **Architecture Research:** Exploring edge-optimized, distributed patterns

### Quality Signals

* Deterministic scoring system ✓
* Automated data pipeline ✓
* Rate-limit aware caching ✓
* Idempotent deployments ✓
* Schema normalization ✓
* Graceful error handling ✓

---

## 🤝 Let's Build

Interested in event-driven systems, cross-platform engineering, or Minecraft plugin architecture?

* 📧 Reach out: GitHub Issues or Discussions
* 🔗 Connect: [GitHub Profile](https://github.com/zvielkoren)
* 🌐 Explore: Featured projects (auto-ranked above)

---

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1e293b,100:0f172a&height=140&section=footer&text=Systems%20Engineering&fontSize=28&fontColor=e0e7ff" />
</p>

<div align="center">

**Made with 🧠 + ⚙️ + 🚀**

*Profile README generated via Data Pipeline v3 — A fully automated, deterministic, API-driven engineering system.*

</div>

# 🧩 System Cards

## 🟦 OpenSpend

### Privacy-first financial event system

**Type:** Stateless Event Pipeline
**Model:** BYO Storage

**Core Flow**

```
Client → Event → Transformation Layer → External Storage
```

**Capabilities**

* Google Sheets integration
* Notion / Airtable adapters
* Webhook-based pipelines

**Status:** Production

---

## 🟩 Z Quest

### Mobile interaction engineering system

**Type:** Flutter-based UX system
**Model:** Lightweight backend coupling

**Capabilities**

* Cross-platform mobile runtime
* Event-driven UI state transitions
* Minimal backend dependency design

**Status:** Published App

---

## 🟥 Minecraft Engineering System

### Modular Paper plugin architecture

**Type:** JVM runtime system
**Model:** Event-driven plugin kernel

**Runtime Architecture**

```
Minecraft Server
  → Bukkit Event System
  → Internal EventBus
  → Module System
  → Gameplay / World Effects
```

**Modules**

* Player System
* World System
* Command System
* Integration Layer

**Status:** Active Development

---

# 📌 Pinned Systems (Ranking Engine v2)

> Fully automated GitHub ranking engine. Repositories are scored, classified, and rendered as structured system cards (not simple markdown lists).

## 🧠 Ranking Engine v2

Each repository is evaluated using a weighted scoring model:

### 📊 Score Formula

```
score = (stars * 3) + (forks * 2) + recency_boost + language_weight
```

### 🧮 Additional Signals

* Recency Boost: newer updates increase ranking priority
* Language Weight:

  * Rust / Java / Kotlin → high (systems layer)
  * Dart / Flutter → medium (product layer)
  * JS/TS → baseline (web automation)
* Project Type Inference:

  * Minecraft plugin → runtime system
  * Discord bot → event automation system
  * Streaming server → infrastructure system

---

## ⚙️ Execution Pipeline

1. Fetch repositories via GitHub API
2. Filter forks and low-signal repositories
3. Compute composite ranking score
4. Infer project category via heuristics
5. Sort by final score (descending)
6. Render structured system cards into README

---

## 📡 Automation Contract

* Source: GitHub REST API v4
* Engine: Ranking Engine v2 (weighted scoring model)
* Execution: GitHub Actions scheduled workflow
* Update Frequency: every 6 hours
* Output: Structured system-card injection into README

---

# 📡 Minecraft Live Status

> Real-time plugin + server health layer (powered by GitHub Actions + Shields.io)

![Build](https://img.shields.io/github/actions/workflow/status/zvielkoren/minecraft-plugin/minecraft-ci.yml?label=build)
![Release](https://img.shields.io/github/v/release/zvielkoren/minecraft-plugin?label=release)
![Version](https://img.shields.io/github/v/tag/zvielkoren/minecraft-plugin?label=version)

* Runtime Integrity: live via GitHub Actions pipeline

# ⚙️ Engineering Pipeline Layer

All systems are governed by CI-driven automation:

* GitHub Actions build verification
* Gradle-based JVM compilation
* Flutter build validation
* Automated artifact generation
* Release tagging via semantic versioning (planned extension)

--- 

# 🧠 System Design Model

### Execution Flow

```
Client Event → Processing Layer → External State → Stateless Core
```

### Design Constraints

* No persistent backend authority
* Externalized storage ownership
* Deterministic transformation layers
* Modular runtime boundaries

---

# 🧱 Architecture Cards

## Event System

* Primary system primitive
* Fully decoupled components

## Storage Model

* User-owned persistence
* No internal database authority

## Runtime Systems

* JVM (Minecraft)
* Flutter (Mobile)
* Node/Webhook integrations

---

# 🛡️ Trust & Threat Model

* Backend systems are non-authoritative
* Client is source of truth
* External storage is replaceable
* Failures are expected and handled explicitly
* Minimal attack surface via stateless design

---

# 📫 Contact

* Website: [https://zviel.com/](https://zviel.com/)
* Email: mailto:conatct@zviel.com
* LinkedIn: [https://www.linkedin.com/in/zvielkoren](https://www.linkedin.com/in/zvielkoren)
* Discord: zvicraft

---

# 🧭 Closing Principle

Systems should minimize centralized ownership while maximizing composability, autonomy, and long-term architectural independence.
