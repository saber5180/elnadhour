# Push ONLY the frontend folder to the server and rebuild the frontend container.
# Usage:  .\push-frontend.ps1

$ErrorActionPreference = "Stop"

$ServerUser = "debian"
$ServerIp   = "51.255.47.221"
$RemoteApp  = "/var/www/elnadhour"
$Remote     = "$ServerUser@$ServerIp"
$ProjectDir = $PSScriptRoot
$Frontend   = Join-Path $ProjectDir "frontend"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Push FRONTEND only" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if (-not (Test-Path $Frontend)) {
    Write-Host "frontend folder not found." -ForegroundColor Red
    exit 1
}

# --- Pack frontend (exclude node_modules + dist) ---
Write-Host "`n[1/3] Packing frontend..." -ForegroundColor Yellow

$tmpTar = Join-Path $env:TEMP "elnadhour-frontend.tar"
if (Test-Path $tmpTar) { Remove-Item $tmpTar -Force }

Push-Location $Frontend
tar -cf $tmpTar --exclude=node_modules --exclude=dist .
Pop-Location

$sizeKB = [math]::Round((Get-Item $tmpTar).Length / 1KB, 1)
Write-Host "  Archive: $sizeKB KB" -ForegroundColor Green

# --- Upload ---
Write-Host "`n[2/3] Uploading to $ServerIp ..." -ForegroundColor Yellow
Write-Host "  (enter your debian password when asked)" -ForegroundColor DarkGray

scp $tmpTar "${Remote}:/tmp/elnadhour-frontend.tar"
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  Upload failed. Check:" -ForegroundColor Red
    Write-Host "    - Server is on and IP is correct: $ServerIp" -ForegroundColor Red
    Write-Host "    - You can SSH: ssh $Remote" -ForegroundColor Red
    exit 1
}

# --- Extract + rebuild on server ---
Write-Host "`n[3/3] Rebuilding frontend on server..." -ForegroundColor Yellow

$remoteScript = @"
set -e
sudo mkdir -p $RemoteApp/frontend
sudo tar -xf /tmp/elnadhour-frontend.tar -C $RemoteApp/frontend
rm -f /tmp/elnadhour-frontend.tar
cd $RemoteApp
sudo docker compose build --no-cache frontend
sudo docker compose up -d frontend
sudo docker compose ps
"@

ssh $Remote $remoteScript

Remove-Item $tmpTar -Force -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  Rebuild failed. If you are root on server, run manually:" -ForegroundColor Red
    Write-Host "  cd $RemoteApp && docker compose build --no-cache frontend && docker compose up -d frontend" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  Frontend pushed and rebuilt!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "`n  https://elnadhoure-cafe.tn" -ForegroundColor Cyan
Write-Host "  Hard refresh: Ctrl+Shift+R`n" -ForegroundColor DarkGray
