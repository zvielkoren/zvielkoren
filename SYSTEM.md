# Data Pipeline v3 - System Architecture Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Scoring Engine v3](#scoring-engine-v3)
4. [Classification System](#classification-system)
5. [GitHub Actions Integration](#github-actions-integration)
6. [Setup & Execution](#setup--execution)
7. [Troubleshooting](#troubleshooting)

---

## System Overview

The **Data Pipeline v3** is a production-grade, fully automated engineering system that transforms your GitHub profile into a **live metrics dashboard**. It runs every 6 hours via GitHub Actions, fetches your repositories, applies intelligent scoring and classification, and automatically injects the results into your README.md.

### Key Features

✓ **Deterministic Ranking** — Reproducible scoring with formula-driven calculations
✓ **Multi-Layer Architecture** — Separation of concerns (ingest → normalize → score → classify → render)
✓ **Rate-Limit Aware** — 6-hour cache layer prevents GitHub API overuse
✓ **Idempotent Updates** — Changes committed only when content actually changes
✓ **Zero Manual Maintenance** — Fully automated, no placeholder management
✓ **Production-Grade** — Error handling, logging, schema validation

---

## Architecture Layers

### 1. GitHub API Ingestion Layer

**Responsibility:** Fetch repository data from GitHub API

```javascript
const ingestion = new GitHubIngestionLayer();
const repos = await ingestion.ingestRepos('zvielkoren');
```

**What it does:**
- Fetches up to 100 repos per user (paginated)
- Implements caching with 6-hour TTL
- Uses `GITHUB_TOKEN` for rate-limit increases (5000 req/hr vs 60 req/hr)
- Stores cache in `.pipeline-cache/` directory
- Gracefully handles API errors

**Cache Strategy:**
```
Fresh data available? → Use GitHub API (expensive)
           ↓
Cached data < 6 hours old? → Use cache (fast)
           ↓
Fallback to old cache (graceful degradation)
```

---

### 2. Normalization Layer

**Responsibility:** Standardize all repo data into consistent schema

```javascript
const normalized = NormalizationLayer.normalize(rawRepos);
```

**Input (GitHub API JSON):**
```json
{
  "id": 12345,
  "name": "awesome-project",
  "stargazers_count": 150,
  "forks_count": 30,
  "topics": ["python", "discord-bot"]
}
```

**Output (Normalized Schema):**
```javascript
{
  id: 12345,
  name: "awesome-project",
  url: "https://github.com/...",
  description: "...",
  
  // Metrics
  stars: 150,
  forks: 30,
  watchers: 45,
  openIssues: 8,
  
  // Activity
  lastUpdate: Date,
  lastPush: Date,
  createdAt: Date,
  
  // Tech
  language: "Python",
  topics: ["python", "discord-bot"],
  
  // State
  isForked: false,
  isArchived: false,
  
  // Computed
  score: 0,      // Computed by scoring engine
  category: null, // Computed by classification engine
  rank: null      // Computed by ranking engine
}
```

---

### 3. Cache Layer (Integrated with Ingestion)

**Responsibility:** Manage cache expiration and rate-limit protection

**TTL Strategy:**
- **Repository Data:** 6 hours (repos change frequently)
- **User Profile:** 24 hours (profile metadata changes rarely)
- **Manual Invalidation:** `npm run clean` removes all caches

**Rate-Limit Protection:**
```
GITHUB_TOKEN present?
  ├─ Yes: 5000 requests/hour available
  └─ No:  60 requests/hour (shared IP limit)
```

---

### 4. Scoring Engine v3

**Responsibility:** Assign deterministic scores to each repository

#### Scoring Formula

```
score = (stars × 3) 
      + (forks × 2) 
      + (recency_multiplier × 10)
      + (language_multiplier × 5)
      + activity_bonus
```

#### Component Breakdown

**1. Star Weight (3x multiplier)**
- Primary engagement metric
- Reflects community interest
- Example: 50 stars → +150 points

**2. Fork Weight (2x multiplier)**
- Community adoption signal
- Shows practical utility
- Example: 10 forks → +20 points

**3. Recency Multiplier (10x weight)**
- Exponential decay over 30-day window
- Penalizes stale projects
- Formula: `exp(-days_since_update / 30)`
- Range: 1.0 (updated today) → 0.1 (90+ days old)
- Example: 
  - Updated 0 days ago: 1.0 × 10 = +10
  - Updated 30 days ago: 0.37 × 10 = +3.7
  - Updated 90 days ago: 0.05 × 10 = +0.5

**4. Language Multiplier (5x weight)**
- Strategic tech-stack scoring
- Boosting high-impact languages
- Table:
  ```
  Python:     1.2 (+6 points base)
  Go:         1.2 (+6 points base)
  Rust:       1.1 (+5.5 points base)
  JavaScript: 1.0 (+5 points base)
  TypeScript: 1.0 (+5 points base)
  Java:       0.9 (+4.5 points base)
  C++:        1.0 (+5 points base)
  Other:      0.8 (+4 points base)
  ```

**5. Activity Bonus (Unbounded)**
- Engagement signals: watchers + open issues
- Formula: `min(10, watchers/10 + openIssues/5)`
- Caps at +10 points
- Example:
  - 100 watchers + 20 open issues = min(10, 10+4) = +10
  - 50 watchers + 5 open issues = min(10, 5+1) = +6

#### Example Calculation

**Repository: "minecraft-plugin"**
```
metrics:
  - stars: 50
  - forks: 10
  - last_updated: 0 days ago
  - language: Python
  - watchers: 30
  - open_issues: 3

score = (50×3) + (10×2) + (1.0×10) + (1.2×5) + min(10, 3+0.6)
      = 150 + 20 + 10 + 6 + 3
      = 189 points
```

---

### 5. Classification Engine

**Responsibility:** Categorize repos by system type

**Categories:**

| Category | Emoji | Triggers | Example |
|----------|-------|----------|---------|
| **Minecraft System** | ⛏️ | Topics include `minecraft`, `spigot`, `paper` OR name contains `minecraft`, `plugin` | Paper extensions, Spigot plugins |
| **Automation System** | 🤖 | Name/topics include `discord`, `discord-bot` | Discord bots, CI automation |
| **Product System** | 📱 | Language is `Dart`/`Swift`/`Kotlin` OR topics include `flutter`, `mobile` | Mobile apps, cross-platform |
| **Infrastructure System** | ⚙️ | Language is `Go`/`Rust` OR topics include `server`, `backend` | Backend services, servers |
| **Data System** | 📊 | Language `Python` AND topics include `machine-learning`, `data-science` | ML models, analytics |
| **Engineering System** | 🔧 | Default fallback | Libraries, tools, utilities |

**Classification Algorithm:**
```javascript
classify(repo) {
  if (repo.topics.includes('minecraft')) return 'minecraft-system';
  if (repo.name.includes('discord')) return 'automation-system';
  if (['Dart', 'Swift', 'Kotlin'].includes(repo.language)) return 'product-system';
  if (['Go', 'Rust'].includes(repo.language)) return 'infrastructure-system';
  if (repo.language === 'Python' && repo.topics.includes('ml')) return 'data-system';
  return 'engineering-system'; // fallback
}
```

---

### 6. Ranking & Selection Engine

**Responsibility:** Filter and rank top repositories

**Filtering:**
1. Exclude forked repositories (`isForked: true`)
2. Exclude archived repositories (`isArchived: true`)
3. Keep only active, original projects

**Ranking:**
1. Sort by score (descending)
2. Select top N (default: 6)
3. Assign sequential ranks (#1, #2, #3, ...)

**Result:**
```
Rank  Repository          Score    Category
────────────────────────────────────────────
  #1  awesome-backend      289.50  Infrastructure System
  #2  minecraft-plugin     189.25  Minecraft System
  #3  mobile-app           156.75  Product System
  #4  discord-automation   145.00  Automation System
  #5  data-pipeline        132.50  Data System
  #6  utils-lib            98.75   Engineering System
```

---

### 7. Rendering Layer & Injection Engine

**Responsibility:** Generate markdown system cards and inject into README

**System Card Template:**
```markdown
### ⛏️ project-name

**Category:** Minecraft Runtime System | **Score:** 189.25 | **Rank:** #1

Project description text here...

**Metrics:** 50 ⭐ · 10 🍴 · Updated 2d ago

**Stack:** `Python` · `minecraft` · `spigot`

**[→ View Project](https://github.com/...)**

---
```

**Injection Process:**
1. Read `pipeline-output.json` (generated by pipeline)
2. Read current `README.md`
3. Find markers: `<!--PINNED_REPOS_START-->` and `<!--PINNED_REPOS_END-->`
4. Extract old content between markers
5. Compare: changed?
   - **Yes:** Write new content, mark for commit
   - **No:** Exit silently (idempotent)
6. Write updated README to disk
7. Return exit code for GitHub Actions

---

## GitHub Actions Integration

### Workflow: `pinned-repos.yml`

**Trigger:** Every 6 hours + manual dispatch
```yaml
on:
  schedule:
    - cron: "0 */6 * * *"  # UTC timezone
  workflow_dispatch:
```

**Execution Timeline:**
```
UTC Time        Trigger              Status
00:00           Cron fires           ✓ Pipeline runs
06:00           Cron fires           ✓ Pipeline runs
12:00           Cron fires           ✓ Pipeline runs
18:00           Cron fires           ✓ Pipeline runs
Anytime         Manual dispatch      ✓ On-demand run
```

**Concurrency Control:**
```yaml
concurrency:
  group: pinned-repos-v3      # Single instance per group
  cancel-in-progress: true    # Cancel old runs if new triggered
```

**Runtime Environment:**
- **OS:** Ubuntu Latest
- **Node:** v20 LTS
- **Permissions:** `contents: write` (README.md modification)
- **Token:** `${{ secrets.GITHUB_TOKEN }}` (auto-provided)

**Step-by-Step Execution:**
```
1. Checkout repository
   └─ Fetch latest code
   
2. Setup Node.js v20
   └─ Install dependencies
   
3. Execute Data Pipeline v3
   └─ Run: node pipeline.js
   └─ Output: pipeline-output.json
   
4. Render & Inject Content
   └─ Run: node inject.js
   └─ Output: Updated README.md
   
5. Git Config
   └─ Set user: github-actions[bot]
   └─ Set email: github-actions[bot]@users.noreply.github.com
   
6. Idempotent Commit
   └─ Check: git diff --cached --quiet
   └─ If no changes: exit silently
   └─ If changed: commit with message
   
7. Push to Repository
   └─ git push origin main
```

**Commit Message Format:**
```
chore: update pinned repos via pipeline v3

- Executed scoring engine v3 (deterministic ranking)
- Applied recency decay & language multipliers
- Classified projects by system type
- Selected top 6 repositories
- Injected system cards into README

[skip ci]
```

The `[skip ci]` marker prevents infinite loop of workflow triggers.

---

## Setup & Execution

### Prerequisites

- Node.js 20+
- Git repository with remote origin
- GitHub token (optional, for rate-limit increase)

### Local Installation

```bash
# Clone repository
git clone https://github.com/zvielkoren/zvielkoren.git
cd zvielkoren

# Install dependencies (if any)
npm install

# Test pipeline locally
npm run pipeline
npm run inject

# Or combined
npm run dev
```

### Running the Pipeline Locally

```bash
# Fetch repos, score, classify, rank
node pipeline.js

# Inject results into README
node inject.js

# Clean cache if needed
npm run clean
```

### Environment Variables

**Optional (recommended in GitHub Actions):**
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

This increases rate limit from 60 req/hr to 5000 req/hr.

### GitHub Actions Setup

No additional setup needed! The workflow file is already configured:
- `.github/workflows/pinned-repos.yml` is in place
- `GITHUB_TOKEN` is automatically available in Actions
- Scheduled cron runs automatically

**To manually trigger:**
```
GitHub UI → Actions → Pinned Repositories Pipeline v3 → Run Workflow
```

---

## Troubleshooting

### Issue: Pipeline fails with "Injection markers not found"

**Symptoms:**
```
[ERROR] Injection failed: Injection markers (PINNED_REPOS_START/END) not found
```

**Solution:**
Ensure README.md contains the markers:
```markdown
## 🎯 Pinned Engineering Projects

<!--PINNED_REPOS_START-->
(old content here)
<!--PINNED_REPOS_END-->
```

---

### Issue: No commits despite pipeline running

**Symptoms:**
```
[INJECT] No changes detected. Skipping update (idempotent).
```

**Cause:** Content hasn't changed since last run - this is normal!

**Verify:** Check GitHub Actions run logs. If you see the message above, it's working correctly.

---

### Issue: API rate limit exceeded

**Symptoms:**
```
[ERROR] GitHub API error: 403 Forbidden
```

**Solution:**

1. **In GitHub Actions (recommended):**
   - The workflow automatically uses `GITHUB_TOKEN` (5000 req/hr)
   - No action needed

2. **Locally:**
   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   node pipeline.js
   ```

3. **Check rate limit:**
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/rate_limit
   ```

---

### Issue: Cached data is stale

**Solution:**
```bash
npm run clean
npm run dev
```

This removes `.pipeline-cache/**` and forces fresh API fetch.

---

### Issue: README injection breaks formatting

**Symptoms:**
```
Markdown syntax errors after injection
```

**Cause:** Injection markers not on separate lines

**Fix:**
```markdown
<!-- WRONG -->
content here <!--PINNED_REPOS_START--> bad

<!-- RIGHT -->
content here
<!--PINNED_REPOS_START-->
...
<!--PINNED_REPOS_END-->
more content
```

---

## Monitoring & Metrics

### GitHub Actions Dashboard

View pipeline history:
```
GitHub UI → Actions → Pinned Repositories Pipeline v3
```

Shows:
- ✓ Successful runs
- ✗ Failed runs
- ⏱ Execution time
- 📝 Commit logs

### Log Output

Each run shows:
```
[INGESTION] Fetched 42 repositories
[NORMALIZATION] Standardizing repo schemas...
[SCORING] Computing scores for all repos...
[CLASSIFICATION] Categorizing repositories...
[RANKING] Selecting top 6 repositories...
[RENDERING] Generating system cards...
[INJECT] README.md updated
```

---

## File Structure

```
zvielkoren/
├── README.md                    # Profile dashboard (dynamically updated)
├── pipeline.js                  # Data Pipeline v3 engine
├── inject.js                    # Injection/rendering engine
├── pipeline-output.json         # Pipeline output (generated)
├── package.json                 # Node.js metadata
├── .gitignore                   # Git exclusions
├── SYSTEM.md                    # This file (documentation)
│
├── .github/
│   └── workflows/
│       └── pinned-repos.yml     # GitHub Actions workflow
│
└── .pipeline-cache/             # Cache directory (gitignored)
    ├── repos-zvielkoren.json
    └── user-zvielkoren.json
```

---

## Performance Metrics

| Operation | Time | Notes |
|-----------|------|-------|
| GitHub API fetch (cold) | ~2-3s | 100 repos, 1 request batched |
| GitHub API fetch (cached) | ~1s | File I/O only |
| Scoring engine | ~10ms | O(n) linear computation |
| Classification | ~5ms | Topic/name pattern matching |
| Ranking | ~2ms | Sort + top-N selection |
| Rendering | ~50ms | Markdown generation |
| README injection | ~100ms | File read/write |
| **Total pipeline** | **~3-5s** | Full cycle time |
| **GitHub Actions run** | **~30-45s** | Including checkout, Node setup |

---

## Future Enhancements

Potential v4 improvements:
- [ ] Multi-user support (aggregate stats)
- [ ] Custom scoring weights (config file)
- [ ] Batch repository statistics (trending by language)
- [ ] Pull request metrics
- [ ] Contributor analytics
- [ ] Archive old metrics (time-series)
- [ ] Webhook notifications (Discord, Slack)
- [ ] Static site generation (profile homepage)

---

**Version:** 3.0.0  
**Last Updated:** 2024  
**Maintainer:** Zviel Koren
