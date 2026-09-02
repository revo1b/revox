# ============================================================
# fix-and-push.ps1
# Fixes a repo that accidentally committed node_modules/.next
# AND scans for accidentally-real secrets in .env.example before
# it ever reaches git, then pushes clean to:
#   https://github.com/revo1b/revox.git
#
# Run from the project root (the folder with package.json), in PowerShell.
# ============================================================

# Force this regardless of what your $PROFILE sets globally - git writes
# routine, non-error status output to stderr constantly (normal git
# behavior), and PowerShell (especially Windows PowerShell 5.1, VS Code's
# default terminal) can otherwise treat that as a terminating error.
$ErrorActionPreference = "Continue"
$PSNativeCommandUseErrorActionPreference = $false

$GithubRepoUrl = "https://github.com/revo1b/revox.git"

function Fail($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

# 1. Confirm we're in the right folder
if (-not (Test-Path "package.json")) {
    Fail "run this from the revox-next project root (package.json not found)"
}

# 2. Scan .env.example for anything that looks like a REAL secret.
#    .env.example must only ever contain placeholder text - real values
#    belong in .env.local (gitignored). This is what tripped GitHub's
#    push protection last time.
if (Test-Path ".env.example") {
    $envExampleContent = Get-Content ".env.example" -Raw
    $suspicious = $false

    # Supabase legacy JWT keys always start with "eyJ" (base64 JWT header)
    if ($envExampleContent -match "eyJ[A-Za-z0-9_-]{20,}") { $suspicious = $true }
    # New-format Supabase keys
    if ($envExampleContent -match "sb_secret_[A-Za-z0-9]+") { $suspicious = $true }
    if ($envExampleContent -match "sb_publishable_[A-Za-z0-9]+") { $suspicious = $true }
    # A real Supabase project URL (not the placeholder domain)
    if ($envExampleContent -match "https://[a-z0-9]{15,}\.supabase\.co" -and $envExampleContent -notmatch "your-project") { $suspicious = $true }

    if ($suspicious) {
        Write-Host ""
        Write-Host "STOP: .env.example appears to contain a REAL Supabase key or URL," -ForegroundColor Red
        Write-Host "not a placeholder. This file gets committed to git." -ForegroundColor Red
        Write-Host ""
        Write-Host "Fix this first:" -ForegroundColor Yellow
        Write-Host "  1. Open .env.example and replace any real values with placeholder text"
        Write-Host "     (e.g. NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co)"
        Write-Host "  2. Put your REAL values in .env.local instead (already gitignored)"
        Write-Host "  3. If a real secret key was ever in .env.example, rotate it in the"
        Write-Host "     Supabase dashboard before continuing - it's compromised regardless"
        Write-Host "     of whether the push succeeded (Project Settings -> API)"
        Write-Host ""
        exit 1
    }
    Write-Host "OK: .env.example contains no obvious real secrets" -ForegroundColor Green
}

Write-Host "This will delete the local .git history (safe if nothing has landed on"
Write-Host "GitHub yet) and start a clean commit."
$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Aborted."
    exit 1
}

# 3. Wipe the old (bloated / secret-containing) git history
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
}

# 4. Write a correct .gitignore BEFORE anything is staged
@"
node_modules
.next
.env
.env.local
.env*.local
.vercel
*.log
.DS_Store
tsconfig.tsbuildinfo
"@ | Set-Content -Path ".gitignore" -Encoding UTF8

# 5. Fresh init
git init 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) { Fail "git init failed" }

git branch -M main 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) { Fail "git branch -M main failed" }

# 6. Sanity check: confirm the heavy/sensitive files are actually ignored
foreach ($dir in @("node_modules", ".next")) {
    if (Test-Path $dir) {
        git check-ignore -v $dir 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK: $dir is ignored" -ForegroundColor Green
        } else {
            Fail "$dir is NOT ignored - aborting before commit"
        }
    }
}
if (Test-Path ".env.local") {
    git check-ignore -v ".env.local" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: .env.local is ignored" -ForegroundColor Green
    } else {
        Fail ".env.local is NOT ignored - aborting before commit"
    }
}

# 7. Stage, commit, and confirm nothing huge or sensitive snuck in
git add . 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) { Fail "git add failed" }

Write-Host ""
Write-Host "Files about to be committed (spot-check this list for node_modules/.next):"
$status = git status --short
$status | Select-Object -First 30 | Out-Host
Write-Host "..."

$bad = $status | Select-String -Pattern "node_modules|\.next/"
if ($bad) {
    Fail "node_modules or .next still staged - aborting."
}

git commit -m "Revox - initial commit" 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) { Fail "git commit failed" }

# 8. Push clean
git remote get-url origin 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    git remote set-url origin $GithubRepoUrl 2>&1 | Out-Host
} else {
    git remote add origin $GithubRepoUrl 2>&1 | Out-Host
}
if ($LASTEXITCODE -ne 0) { Fail "failed to configure the 'origin' remote" }

git push -u origin main --force 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) { Fail "git push failed - see the output above for details" }

Write-Host ""
Write-Host "Done - clean push to $GithubRepoUrl" -ForegroundColor Green