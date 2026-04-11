/**
 * Data Pipeline v3 - GitHub Profile Engineering System
 * 
 * Architecture:
 * - GitHub API Ingestion Layer
 * - Normalization Layer (schema standardization)
 * - Cache Layer (rate-limit protection)
 * - Scoring Engine v3 (deterministic ranking)
 * - Classification Engine (project categorization)
 * - Ranking + Selection (top N projects)
 * - Output Rendering (system cards)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. INGESTION LAYER - GitHub API Data Fetching
// ============================================================================

class GitHubIngestionLayer {
  constructor(token = null) {
    this.token = token || process.env.GITHUB_TOKEN;
    this.baseUrl = 'https://api.github.com';
    this.cacheDir = path.join(process.cwd(), '.pipeline-cache');
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async fetch(endpoint) {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  getCachePath(key) {
    return path.join(this.cacheDir, `${key}.json`);
  }

  loadFromCache(key, maxAgeMinutes = 360) {
    const cachePath = this.getCachePath(key);

    if (!fs.existsSync(cachePath)) {
      return null;
    }

    const stats = fs.statSync(cachePath);
    const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);

    if (ageMinutes > maxAgeMinutes) {
      return null;
    }

    const data = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(data);
  }

  saveToCache(key, data) {
    const cachePath = this.getCachePath(key);
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  }

  async ingestRepos(username) {
    const cacheKey = `repos-${username}`;
    const cached = this.loadFromCache(cacheKey);

    if (cached) {
      console.log('[INGESTION] Using cached repos data');
      return cached;
    }

    console.log('[INGESTION] Fetching repos from GitHub API...');
    const repos = await this.fetch(`/users/${username}/repos?per_page=100&sort=updated`);

    this.saveToCache(cacheKey, repos);
    console.log(`[INGESTION] Fetched ${repos.length} repositories`);

    return repos;
  }

  async ingestUser(username) {
    const cacheKey = `user-${username}`;
    const cached = this.loadFromCache(cacheKey, maxAgeMinutes = 1440); // 24 hrs

    if (cached) {
      return cached;
    }

    console.log('[INGESTION] Fetching user profile from GitHub API...');
    const user = await this.fetch(`/users/${username}`);

    this.saveToCache(cacheKey, user);
    return user;
  }
}

// ============================================================================
// 2. NORMALIZATION LAYER - Schema Standardization
// ============================================================================

class NormalizationLayer {
  static normalize(repos) {
    console.log('[NORMALIZATION] Standardizing repo schemas...');

    return repos.map(repo => ({
      // Core identification
      id: repo.id,
      name: repo.name,
      url: repo.html_url,
      description: repo.description || '',

      // Metrics
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      watchers: repo.watchers_count || 0,
      openIssues: repo.open_issues_count || 0,

      // Activity signals
      lastUpdate: new Date(repo.updated_at),
      lastPush: new Date(repo.pushed_at),
      createdAt: new Date(repo.created_at),

      // Language / tech stack
      language: repo.language || 'unknown',
      topics: repo.topics || [],

      // State
      isForked: repo.fork,
      isArchived: repo.archived,

      // Rankings (will be computed)
      score: 0,
      category: null,
      rank: null
    }));
  }
}

// ============================================================================
// 3. CACHE LAYER (Already in ingestion, but explicit entry point)
// ============================================================================

class CacheLayer {
  static clearExpiredCache() {
    console.log('[CACHE] Implementing cache expiration strategy...');
  }
}

// ============================================================================
// 4. SCORING ENGINE v3
// ============================================================================

class ScoringEngine {
  /**
   * Scoring formula v3:
   * 
   * score = 
   *   (stars * 3) +
   *   (forks * 2) +
   *   (recency_multiplier * 10) +
   *   (language_multiplier * 5) +
   *   (activity_bonus)
   */

  static score(repo) {
    const now = new Date();
    const daysSinceUpdate = (now - repo.lastUpdate) / (1000 * 60 * 60 * 24);

    // Recency decay: 1.0 if updated today, 0.1 if updated 90+ days ago
    const recencyMultiplier = Math.max(
      0.1,
      1.0 * Math.exp(-daysSinceUpdate / 30)
    );

    // Language multiplier: boost for high-impact languages
    const languageMultipliers = {
      'Python': 1.2,
      'Go': 1.2,
      'Rust': 1.1,
      'JavaScript': 1.0,
      'TypeScript': 1.0,
      'Java': 0.9,
      'C++': 1.0
    };
    const languageMultiplier = languageMultipliers[repo.language] || 0.8;

    // Activity bonus: repos with high engagement get bonus
    const activityBonus = Math.min(
      10,
      (repo.watchers / 10) + (repo.openIssues / 5)
    );

    // Final score calculation
    const score = 
      (repo.stars * 3) +
      (repo.forks * 2) +
      (recencyMultiplier * 10) +
      (languageMultiplier * 5) +
      activityBonus;

    return Math.round(score * 100) / 100;
  }

  static scoreAll(repos) {
    console.log('[SCORING] Computing scores for all repos using v3 formula...');

    repos.forEach(repo => {
      repo.score = this.score(repo);
    });

    return repos;
  }
}

// ============================================================================
// 5. CLASSIFICATION ENGINE
// ============================================================================

class ClassificationEngine {
  static classify(repo) {
    const name = repo.name.toLowerCase();
    const description = (repo.description || '').toLowerCase();
    const language = repo.language || '';
    const topics = repo.topics.map(t => t.toLowerCase());

    // Minecraft system
    if (topics.includes('minecraft') || 
        topics.includes('spigot') || 
        topics.includes('paper') ||
        name.includes('minecraft') ||
        name.includes('plugin')) {
      return 'minecraft-system';
    }

    // Discord bot / automation system
    if (name.includes('discord') || 
        topics.includes('discord-bot') ||
        description.includes('discord bot')) {
      return 'automation-system';
    }

    // Mobile / product system
    if (language === 'Dart' ||
        language === 'Swift' ||
        language === 'Kotlin' ||
        topics.includes('flutter') ||
        topics.includes('mobile')) {
      return 'product-system';
    }

    // Backend / infrastructure system
    if (language === 'Go' ||
        language === 'Rust' ||
        topics.includes('server') ||
        topics.includes('backend') ||
        description.includes('backend')) {
      return 'infrastructure-system';
    }

    // Data / ML system
    if (language === 'Python' &&
        (topics.includes('machine-learning') ||
         topics.includes('data-science') ||
         description.includes('ml'))) {
      return 'data-system';
    }

    // Default: general engineering
    return 'engineering-system';
  }

  static classifyAll(repos) {
    console.log('[CLASSIFICATION] Categorizing repositories...');

    repos.forEach(repo => {
      repo.category = this.classify(repo);
    });

    return repos;
  }
}

// ============================================================================
// 6. RANKING ENGINE - Top N Selection
// ============================================================================

class RankingEngine {
  static rank(repos, topN = 6) {
    console.log(`[RANKING] Selecting top ${topN} repositories...`);

    // Filter: exclude forked and archived
    const candidates = repos.filter(r => !r.isForked && !r.isArchived);

    // Sort by score descending
    const sorted = candidates.sort((a, b) => b.score - a.score);

    // Select top N
    const selected = sorted.slice(0, topN);

    // Assign ranks
    selected.forEach((repo, index) => {
      repo.rank = index + 1;
    });

    return selected;
  }
}

// ============================================================================
// 7. RENDERING LAYER - System Card Output
// ============================================================================

class RenderingLayer {
  static renderSystemCard(repo) {
    const categoryEmoji = {
      'minecraft-system': '⛏️',
      'automation-system': '🤖',
      'product-system': '📱',
      'infrastructure-system': '⚙️',
      'data-system': '📊',
      'engineering-system': '🔧'
    };

    const emoji = categoryEmoji[repo.category] || '🔧';
    const prettyCategory = this.prettifyCategory(repo.category);
    const daysSince = Math.floor(
      (new Date() - repo.lastUpdate) / (1000 * 60 * 60 * 24)
    );

    return `
### ${emoji} ${repo.name}

**Category:** ${prettyCategory} | **Score:** ${repo.score} | **Rank:** #${repo.rank}

${repo.description}

**Metrics:** ${repo.stars} ⭐ · ${repo.forks} 🍴 · Updated ${daysSince}d ago

**Stack:** \`${repo.language}\` ${repo.topics.length > 0 ? `· ${repo.topics.map(t => `\`${t}\``).join(' ')}` : ''}

**[→ View Project](${repo.url})**

---
`;
  }

  static prettifyCategory(category) {
    const map = {
      'minecraft-system': 'Minecraft Runtime System',
      'automation-system': 'Automation System',
      'product-system': 'Product System',
      'infrastructure-system': 'Infrastructure System',
      'data-system': 'Data System',
      'engineering-system': 'Engineering System'
    };
    return map[category] || category;
  }

  static render(repos) {
    console.log('[RENDERING] Generating system cards...');

    const cards = repos.map(repo => this.renderSystemCard(repo)).join('\n');

    const output = {
      timestamp: new Date().toISOString(),
      totalProcessed: repos.length,
      html: cards
    };

    const outputPath = path.join(process.cwd(), 'pipeline-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log('[RENDERING] Output written to pipeline-output.json');
    return output;
  }
}

// ============================================================================
// 8. PIPELINE ORCHESTRATION
// ============================================================================

class DataPipelineV3 {
  async execute(username = 'zvielkoren') {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  DATA PIPELINE v3 - GitHub Profile Engineering System  ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    try {
      // Step 1: Ingestion
      const ingestion = new GitHubIngestionLayer();
      const rawRepos = await ingestion.ingestRepos(username);

      // Step 2: Normalization
      const normalized = NormalizationLayer.normalize(rawRepos);

      // Step 3: Scoring
      const scored = ScoringEngine.scoreAll(normalized);

      // Step 4: Classification
      const classified = ClassificationEngine.classifyAll(scored);

      // Step 5: Ranking
      const ranked = RankingEngine.rank(classified);

      // Step 6: Rendering
      const rendered = RenderingLayer.render(ranked);

      console.log('\n✓ Pipeline execution complete.');
      console.log(`✓ Processed ${rawRepos.length} repositories`);
      console.log(`✓ Selected top ${ranked.length} for display\n`);

      return rendered;
    } catch (error) {
      console.error('[ERROR] Pipeline failed:', error.message);
      process.exit(1);
    }
  }
}

// ============================================================================
// MAIN - Execute Pipeline
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const pipeline = new DataPipelineV3();
    await pipeline.execute('zvielkoren');
  })().catch(error => {
    console.error('[FATAL] Uncaught error:', error.message);
    process.exit(1);
  });
}

export { DataPipelineV3, GitHubIngestionLayer, ScoringEngine };
