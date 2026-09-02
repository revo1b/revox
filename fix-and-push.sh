#!/usr/bin/env bash
# ============================================================
# fix-and-push.sh
# Fixes a repo that accidentally committed node_modules/.next
# (GitHub rejects pushes over its file-size limit), then pushes
# clean to https://github.com/revo1b/revox.git
#
# Run from the project root (the folder with package.json).
# ============================================================
set -euo pipefail

GITHUB_REPO_URL="https://github.com/revo1b/revox.git"

ls package.json >/dev/null 2>&1 || { echo "ERROR: run this from the revox-next project root (package.json not found)"; exit 1; }

echo "This will delete the local .git history (nothing landed on GitHub yet,"
echo "since the previous push was rejected) and start a clean commit."
read -p "Continue? (y/N) " -n 1 -r CONFIRM
echo
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }

# 1. Wipe the old (bloated) git history
rm -rf .git

# 2. Write a correct .gitignore BEFORE anything is staged
cat > .gitignore << 'EOF'
node_modules
.next
.env
.env.local
.env*.local
.vercel
*.log
.DS_Store
tsconfig.tsbuildinfo
EOF

# 3. Fresh init
git init
git branch -M main

# 4. Sanity check: confirm the heavy folders are actually ignored
for dir in node_modules .next; do
  if [ -d "$dir" ]; then
    if git check-ignore -v "$dir" >/dev/null 2>&1; then
      echo "OK: $dir is ignored"
    else
      echo "ERROR: $dir is NOT ignored — aborting before commit"
      exit 1
    fi
  fi
done
if [ -f .env.local ]; then
  if git check-ignore -v .env.local >/dev/null 2>&1; then
    echo "OK: .env.local is ignored"
  else
    echo "ERROR: .env.local is NOT ignored — aborting before commit"
    exit 1
  fi
fi

# 5. Stage, commit, and confirm nothing huge snuck in
git add .
echo ""
echo "Files about to be committed (spot-check this list for node_modules/.next):"
git status --short | head -30
echo "..."
BAD=$(git status --short | grep -c "node_modules\|\.next/" || true)
if [ "$BAD" != "0" ]; then
  echo "ERROR: node_modules or .next still staged — aborting."
  exit 1
fi

git commit -m "Revox — initial commit"

# 6. Push clean
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$GITHUB_REPO_URL"
else
  git remote add origin "$GITHUB_REPO_URL"
fi

git push -u origin main --force

echo ""
echo "Done — clean push to $GITHUB_REPO_URL"