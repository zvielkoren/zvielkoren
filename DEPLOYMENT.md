# 🚀 Quick-Start Deployment Guide

## Verify System is Ready

### ✅ Checklist

- [x] `README.md` — Enhanced with system architecture & live metrics sections
- [x] `pipeline.js` — Data Pipeline v3 with scoring engine v3
- [x] `inject.js` — Injection engine with idempotency
- [x] `.github/workflows/pinned-repos.yml` — GitHub Actions workflow (updated)
- [x] `package.json` — Node.js project metadata
- [x] `.gitignore` — Cache & output exclusions
- [x] `SYSTEM.md` — Complete architecture documentation
- [x] `DEPLOYMENT.md` — This guide

---

## Local Testing (Before Push)

### 1. Install Dependencies

```bash
cd zvielkoren
npm install  # Installs any missing packages (currently none required)
```

### 2. Test Pipeline Locally

```bash
# Step 1: Generate scored repos
node pipeline.js

# Expected output:
# ╔════════════════════════════════════════════════════════╗
# ║  DATA PIPELINE v3 - GitHub Profile Engineering System  ║
# ╚════════════════════════════════════════════════════════╝
#
# [INGESTION] Fetching repos from GitHub API...
# [INGESTION] Fetched 42 repositories
# [NORMALIZATION] Standardizing repo schemas...
# [SCORING] Computing scores for all repos using v3 formula...
# [CLASSIFICATION] Categorizing repositories...
# [RANKING] Selecting top 6 repositories...
# [RENDERING] Generating system cards...
# [RENDERING] Output written to pipeline-output.json
#
# ✓ Pipeline execution complete.
# ✓ Processed 42 repositories
# ✓ Selected top 6 for display
```

### 3. Verify Pipeline Output

```bash
# Check generated output file
ls -la pipeline-output.json

# View first 50 lines
head -50 pipeline-output.json
```

Expected format:
```json
{
  "timestamp": "2024-04-12T10:30:00.000Z",
  "totalProcessed": 42,
  "html": "### ⛏️ project-name\n\n**Category:** ...🎮 Minecraft System\n\n..."
}
```

### 4. Test Injection Engine

```bash
# Step 2: Inject results into README
node inject.js

# Expected output:
# ╔═══════════════════════════════════════════════╗
# ║  INJECTION ENGINE - README Rendering Layer    ║
# ╚═══════════════════════════════════════════════╝
#
# [INJECT] Reading pipeline output...
# [INJECT] Reading README.md...
# [INJECT] Checking injection markers...
# [INJECT] Checking for changes...
# [INJECT] ✓ Changes detected. Proceeding with injection...
# [INJECT] README.md updated
# [INJECT] ✓ Injection complete
```

### 5. Verify README Update

```bash
# View the pinned repos section
grep -A 20 "PINNED_REPOS_START" README.md

# Should see system cards like:
# ### ⛏️ minecraft-plugin
# **Category:** Minecraft Runtime System | **Score:** 189.25 | **Rank:** #1
# Description...
```

### 6. Idempotency Test

Run the pipeline again to verify idempotency:

```bash
node pipeline.js
node inject.js

# Should see:
# [INJECT] ✓ No changes detected. Skipping update (idempotent).
```

This is **expected and correct** – no changes = no update.

---

## Deploy to GitHub

### Step 1: Commit Files

```bash
git add pipeline.js inject.js README.md package.json .gitignore SYSTEM.md DEPLOYMENT.md
git commit -m "feat: implement data pipeline v3 with live metrics system

- Add GitHub API ingestion layer with rate-limit caching
- Implement scoring engine v3 (deterministic ranking formula)
- Add classification engine (project categorization)
- Create injection engine with idempotent updates
- Update README with system architecture overview
- Configure GitHub Actions workflow (6-hourly schedule)
- Add comprehensive documentation (SYSTEM.md)"

# Or if you want to verify first:
git status  # Review changes
git diff    # See exact changes
```

### Step 2: Push to Main

```bash
git push origin main
```

### Step 3: Verify GitHub Actions

```
GitHub UI → Actions → Pinned Repositories Pipeline v3
```

Click the latest run to view console output.

**Expected outcome:**
- ✅ "Pinned Repositories Pipeline v3" workflow shows green checkmark
- ✅ README.md updated with ranked repositories
- ✅ New commit message visible in main branch history

---

## Production Status

### Current Configuration

| Component | Status | Details |
|-----------|--------|---------|
| **Workflow Schedule** | 🟢 Active | Every 6 hours UTC |
| **README Markers** | 🟢 Present | `PINNED_REPOS_START/END` |
| **Node.js Version** | 🟢 20 LTS | Latest stable |
| **Caching** | 🟢 Enabled | 6-hour TTL |
| **Error Handling** | 🟢 Robust | Graceful degradation |
| **Idempotency** | 🟢 Implemented | Only commit on changes |

---

## What Happens Next (Automated)

### Every 6 Hours (Automatic)

1. ⏰ **00:00, 06:00, 12:00, 18:00 UTC** — Workflow triggers automatically
2. 🔄 **Pipeline Runs** — Fetches latest repos, scores them (**v3 formula**)
3. 🤖 **Classification** — Categorizes by system type (Minecraft, Automation, etc.)
4. 📊 **Ranking** — Selects and ranks top 6 projects
5. 📝 **README Update** — Injects system cards (if changed)
6. 📤 **Auto-Commit** — Pushes to main with descriptive message
7. 📈 **Dashboard Update** — Live profile reflects latest rankings

### Manual Trigger (Anytime)

```
GitHub UI → Actions → Pinned Repositories Pipeline v3 
→ "Run Workflow" button
```

---

## Monitoring Dashboard

### Real-Time Metrics

Access at: `Settings → Actions → Workflows → Pinned Repositories Pipeline v3`

**View:**
- ✓ Last 30 runs (success/failure)
- ✓ Execution times
- ✓ Commit history
- ✓ Cron schedule status
- ✓ Console logs per run

### Success Indicators

```bash
# Check workflow runs
gh workflow list --repo zvielkoren/zvielkoren

# View latest run
gh run view --repo zvielkoren/zvielkoren --workflow pinned-repos.yml

# Stream logs (if installed)
gh run watch --repo zvielkoren/zvielkoren
```

---

## Troubleshooting First Run

### Scenario 1: Workflow Never Triggered

**Check:**
1. `.github/workflows/pinned-repos.yml` exists ✓
2. Workflow file has `on: schedule:` trigger ✓
3. Repository settings allow workflows ✓

**Manual trigger to test:**
```
GitHub UI → Actions → Pinned Repositories Pipeline v3 → Run Workflow
```

### Scenario 2: Pipeline Fails with API Error

**Most likely:** GitHub API rate limit

**Quick fix:**
```bash
# Clear cache, force fresh fetch
npm run clean

# Re-run after a few minutes
node pipeline.js
```

**In GitHub Actions:** The workflow automatically uses `GITHUB_TOKEN` (5000 req/hr), so no manual action needed.

### Scenario 3: README Not Updating

**Check markers exist:**
```bash
grep "PINNED_REPOS_START" README.md
grep "PINNED_REPOS_END" README.md
```

Both lines must exist, on separate lines.

---

## Performance Notes

### Pipeline Execution Time

```
Local Machine:
  Fetch repos:     ~2-3s (first run) or ~1s (cached)
  Score/classify:  ~20ms
  Render/inject:   ~200ms
  Total:           ~3-5s

GitHub Actions:
  Checkout:        ~5-10s
  Setup Node.js:   ~20-30s
  Pipeline (all):  ~5s
  Git ops:         ~5-10s
  Total:           ~30-45s
```

### Cache Efficiency

```
First run (no cache):     ~2-3s (API fetch)
Subsequent runs (6h TTL): ~1s   (file I/O)
After cache expires:      ~2-3s (API fetch again)
```

---

## Next Steps

### Optional Customizations

1. **Adjust Scoring Weights**
   - Edit `pipeline.js` → `ScoringEngine.score()` method
   - Modify multipliers (currently: stars×3, forks×2, etc.)

2. **Change Update Frequency**
   - Edit `.github/workflows/pinned-repos.yml`
   - Modify cron: `"0 */6 * * *"` (currently every 6 hours)
   - Cron format: `mm hh * * *` (minute hour any-day any-weekday any-month)

3. **Select Different Top-N**
   - Edit `rankingEngine.js` → `rank()` function
   - Change `topN = 6` parameter (currently 6 projects)

4. **Add More Categories**
   - Edit `ClassificationEngine.classify()` method
   - Add new conditions for custom categories

5. **Custom Metrics**
   - Add to scoring formula
   - Example: contribution activity, code quality, documentation

---

## Support & Debugging

### View Complete Logs

```bash
gh run view <RUN_ID> --log --repo zvielkoren/zvielkoren
```

### Enable Verbose Logging

In `pipeline.js` and `inject.js`, all major operations log to console:
```
[INGESTION] ...
[NORMALIZATION] ...
[SCORING] ...
[CLASSIFICATION] ...
[RANKING] ...
[RENDERING] ...
[INJECT] ...
```

### Test Specific Components

```bash
# Test just the scoring engine
node -e "
  const { ScoringEngine } = require('./pipeline.js');
  const testRepo = {
    stars: 100,
    forks: 20,
    lastUpdate: new Date(),
    watchers: 50,
    openIssues: 5,
    language: 'Go'
  };
  console.log('Score:', ScoringEngine.score(testRepo));
"
```

---

## Summary

✅ **System is production-ready**

- Data Pipeline v3 ✓ Deterministic, formula-driven scoring
- Classification Engine ✓ Project categorization working
- GitHub Actions ✓ Automated 6-hourly execution
- Injection Engine ✓ Idempotent README updates
- Documentation ✓ Complete (SYSTEM.md)

**Next:** Push to main, watch Actions run automatically! 🚀

---

**Version:** 3.0.0  
**Last Updated:** April 12, 2024  
**Status:** ✅ Ready for Production
