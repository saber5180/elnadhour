# ============================================
# El Nadhour - Push to OVH VPS (Windows)
# ============================================
# Copies the project (without node_modules) to the
# server, then rebuilds the Docker containers.
#
# Usage:
#   .\push-to-server.ps1              # push everything
#   .\push-to-server.ps1 frontend     # rebuild frontend only
#   .\push-to-server.ps1 backend      # rebuild backend only
# ============================================

param(
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

$ServerUser = "debian"
$ServerIp   = "51.255.47.221"
$RemoteTmp  = "~/cafe-app-push"
$RemoteApp  = "/var/www/elnadhour"

$ProjectDir = $PSScriptRoot
$StageDir   = Join-Path (Split-Path $ProjectDir -Parent) "cafe-app-upload"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  El Nadhour - Push to server" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# --- Step 1: Stage a clean copy (no node_modules, no local DB) ---
Write-Host "`n[1/3] Preparing clean copy..." -ForegroundColor Yellow

if (Test-Path $StageDir) {
    Remove-Item $StageDir -Recurse -Force
}

# robocopy exit codes 0-7 are success
robocopy $ProjectDir $StageDir /E /NFL /NDL /NJH /NJS /NP `
    /XD node_modules .git .pgdata .pgdata-menu dist ssl `
    /XF *.log .env | Out-Null

if ($LASTEXITCODE -ge 8) {
    Write-Host "  robocopy failed (code $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}
$global:LASTEXITCODE = 0

$fileCount = (Get-ChildItem $StageDir -Recurse -File).Count
Write-Host "  Staged $fileCount files." -ForegroundColor Green

# --- Step 2: Upload ---
Write-Host "`n[2/3] Uploading to $ServerIp ..." -ForegroundColor Yellow
Write-Host "  (enter your server password when asked)" -ForegroundColor DarkGray

ssh "$ServerUser@$ServerIp" "rm -rf $RemoteTmp && mkdir -p $RemoteTmp"
if ($LASTEXITCODE -ne 0) { Write-Host "  SSH failed." -ForegroundColor Red; exit 1 }

scp -r "$StageDir/*" "${ServerUser}@${ServerIp}:$RemoteTmp/"
if ($LASTEXITCODE -ne 0) { Write-Host "  Upload failed." -ForegroundColor Red; exit 1 }

Write-Host "  Upload complete." -ForegroundColor Green

# --- Step 3: Deploy on server ---
Write-Host "`n[3/3] Rebuilding containers ($Target)..." -ForegroundColor Yellow

switch ($Target) {
    "frontend" { $BuildCmd = "sudo docker compose up -d --build frontend" }
    "backend"  { $BuildCmd = "sudo docker compose up -d --build backend" }
    default    { $BuildCmd = "sudo docker compose up -d --build" }
}

$RemoteScript = @"
set -e
sudo cp -r $RemoteTmp/. $RemoteApp/
cd $RemoteApp
sudo find . -maxdepth 1 -name '*.sh' -exec sed -i 's/\r$//' {} \;
$BuildCmd
sudo docker compose ps
"@

ssh "$ServerUser@$ServerIp" $RemoteScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  Deploy failed. Check the output above." -ForegroundColor Red
    exit 1
}

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  Done!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "`n  https://elnadhoure-cafe.tn" -ForegroundColor Cyan
Write-Host "  Press Ctrl+Shift+R in the browser to clear cache.`n" -ForegroundColor DarkGray
