name: Update Pinned Repositories

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: pinned-repos-update
  cancel-in-progress: true

jobs:
  update-pinned:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Fetch repositories (safe)
        env:
          GH_USER: zvielkoren
        run: |
          curl -s --fail "https://api.github.com/users/$GH_USER/repos?per_page=100" > repos.json

          if [ ! -s repos.json ]; then
            echo "GitHub API failed"
            exit 1
          fi

      - name: Build ranking engine v2 (stable)
        run: |
          cat repos.json | jq '
            map(select(.fork == false)) |
            map({
              name,
              description,
              stars: .stargazers_count,
              forks: .forks_count,
              updated: .updated_at
            }) |
            sort_by([- .stars, - .forks]) |
            .[0:5] |
            map("- **\(.name)** → \(.description // "No description") (⭐\(.stars))")
          ' > pinned.txt

      - name: Inject into README safely
        run: |
          awk '
          /<!--PINNED_REPOS_START-->/ {
[
  "- **self-streme** → A Powerful Self-Hosted Streaming Server with Stremio Integration (⭐3)",
  "- **AutoGalleryTool-old** → The AutoGalleryTool system is an automated solution for sharing media files, allowing for filtering and cataloging of images and videos. It enables automatic retrieval from SD cards and sending temporary links to clients. The system is designed to save time and streamline the workflow for photographers and media professionals. (⭐2)",
  "- **Unovia** → This First My game (⭐2)",
  "- **DigiArt** → Transform your photo library into a stunning visual gallery. Our tool intelligently categorizes and presents your images. (⭐1)",
  "- **ItemCompact** → No description (⭐1)"
]
          /<!--PINNED_REPOS_END-->/ {
            skip=0;
            print;
            next;
          }
          !skip { print }
          ' README.md > README.tmp

          mv README.tmp README.md

      - name: Commit changes only if needed
        run: |
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"

          git add README.md

          git diff --cached --quiet && exit 0

          git commit -m "chore: update pinned repositories"
          git push
