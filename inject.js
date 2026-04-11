/**
 * Injection Engine - README.md Dynamic Content Renderer
 * 
 * Responsible for:
 * - Reading generated pipeline output
 * - Finding injection markers in README
 * - Rendering system cards with idempotency check
 * - Preserving manual content
 */

const fs = require('fs');
const path = require('path');

class InjectionEngine {
  constructor() {
    this.readmePath = path.join(process.cwd(), 'README.md');
    this.pipelineOutput = path.join(process.cwd(), 'pipeline-output.json');
  }

  /**
   * Read pipeline output
   */
  readPipelineOutput() {
    if (!fs.existsSync(this.pipelineOutput)) {
      throw new Error(`Pipeline output not found: ${this.pipelineOutput}`);
    }

    const content = fs.readFileSync(this.pipelineOutput, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Read current README
   */
  readReadme() {
    if (!fs.existsSync(this.readmePath)) {
      throw new Error(`README not found: ${this.readmePath}`);
    }

    return fs.readFileSync(this.readmePath, 'utf-8');
  }

  /**
   * Check if injection markers exist in README
   */
  hasInjectionMarkers(content) {
    return (
      content.includes('<!--PINNED_REPOS_START-->') &&
      content.includes('<!--PINNED_REPOS_END-->')
    );
  }

  /**
   * Extract content between markers
   */
  extractInjectionContent(content) {
    const startMarker = '<!--PINNED_REPOS_START-->';
    const endMarker = '<!--PINNED_REPOS_END-->';

    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      return null;
    }

    return content.substring(startIndex + startMarker.length, endIndex).trim();
  }

  /**
   * Check if content has changed (idempotency check)
   */
  hasContentChanged(oldContent, newContent) {
    const oldExtracted = this.extractInjectionContent(oldContent) || '';
    const oldNormalized = oldExtracted.trim();
    const newNormalized = newContent.trim();

    return oldNormalized !== newNormalized;
  }

  /**
   * Inject content into README between markers
   */
  injectContent(readmeContent, newContent) {
    const startMarker = '<!--PINNED_REPOS_START-->';
    const endMarker = '<!--PINNED_REPOS_END-->';

    const startIndex = readmeContent.indexOf(startMarker);
    const endIndex = readmeContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Injection markers not found in README');
    }

    // Build new content with proper spacing
    const beforeMarker = readmeContent.substring(0, startIndex + startMarker.length);
    const afterMarker = readmeContent.substring(endIndex);

    return `${beforeMarker}\n${newContent}\n${afterMarker}`;
  }

  /**
   * Write updated README
   */
  writeReadme(content) {
    fs.writeFileSync(this.readmePath, content, 'utf-8');
    console.log('[INJECT] README.md updated');
  }

  /**
   * Generate live metrics section
   */
  generateMetricsSection() {
    return `
## 📊 Live Profile Metrics

> Auto-generated via GitHub Actions (Data Pipeline v3, 6-hourly)

\`\`\`
Platform Status:    🟢 Online
Last Update:        ${new Date().toLocaleString()}
Pipeline Version:   v3.0.0
Cache Status:       Ready
API Integration:    Active
\`\`\`

---
`;
  }

  /**
   * Generate architecture overview
   */
  generateArchitectureSection() {
    return `
## ⚙️ System Architecture

### Pipeline Stack

\`\`\`
GitHub API Ingestion ──→ Normalization Layer ──→ Cache Layer
                             ↓
                        Scoring Engine v3
                             ↓
                    Classification Engine
                             ↓
                      Ranking + Selection
                             ↓
                      Rendering Layer ──→ README Injection
\`\`\`

### Scoring Formula v3

\`\`\`
score = (stars × 3) + (forks × 2) + (recency_decay × 10) 
      + (language_multiplier × 5) + activity_bonus
\`\`\`

### Classification Categories

| Category | Identifier | Example |
|----------|-----------|---------|
| Minecraft System | \`⛏️\` | Paper plugins, Spigot extensions |
| Automation System | \`🤖\` | Discord bots, CI/CD automation |
| Infrastructure System | \`⚙️\` | Backend services, data pipelines |
| Product System | \`📱\` | Mobile apps, cross-platform products |
| Data System | \`📊\` | ML models, analytics engines |
| Engineering System | \`🔧\` | Libraries, tools, utilities |

---
`;
  }

  /**
   * Main execution - perform injection with idempotency check
   */
  execute() {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║  INJECTION ENGINE - README Rendering Layer    ║');
    console.log('╚═══════════════════════════════════════════════╝\n');

    try {
      // Step 1: Read source files
      console.log('[INJECT] Reading pipeline output...');
      const pipelineData = this.readPipelineOutput();

      console.log('[INJECT] Reading README.md...');
      const currentReadme = this.readReadme();

      // Step 2: Validate markers exist
      console.log('[INJECT] Checking injection markers...');
      if (!this.hasInjectionMarkers(currentReadme)) {
        throw new Error('Injection markers (PINNED_REPOS_START/END) not found in README');
      }

      // Step 3: Extract new content from pipeline (pinned repos)
      const newInjection = pipelineData.html;

      // Step 4: Idempotency check
      console.log('[INJECT] Checking for changes...');
      if (!this.hasContentChanged(currentReadme, newInjection)) {
        console.log('[INJECT] ✓ No changes detected. Skipping update (idempotent).');
        process.exit(0);
      }

      console.log('[INJECT] ✓ Changes detected. Proceeding with injection...');

      // Step 5: Generate dynamic sections
      const metricsSection = this.generateMetricsSection();
      const architectureSection = this.generateArchitectureSection();

      // Step 6: Inject updated content
      let updatedReadme = this.injectContent(currentReadme, newInjection);

      // Note: If you want to add metrics/architecture sections dynamically,
      // you could add additional markers and inject them similarly

      // Step 7: Write to disk
      this.writeReadme(updatedReadme);

      console.log('[INJECT] ✓ Injection complete');
      console.log('[INJECT] ✓ README.md is ready for commit\n');

      // Exit with status indicating changes were made (used by GitHub Actions)
      process.exit(0);

    } catch (error) {
      console.error('[ERROR] Injection failed:', error.message);
      process.exit(1);
    }
  }
}

// ============================================================================
// MAIN - Execute Injection
// ============================================================================

if (require.main === module) {
  const injection = new InjectionEngine();
  injection.execute();
}

module.exports = { InjectionEngine };
