# ============================================
# El Nadhour - Incremental Push to OVH VPS
# ============================================
# Uploads ONLY the files that changed since the
# last push, then rebuilds the affected container.
#
# Usage:
#   .\push.ps1            # push changed files, rebuild what's needed
#   .\push.ps1 -All       # force full upload
#   .\push.ps1 -DryRun    # show what would be pushed
# ============================================

param(
    [switch]$All,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$ServerUser = "debian"
$ServerIp   = "51.255.47.221"
$RemoteApp  = "/var/www/elnadhour"
$Remote     = "$ServerUser@$ServerIp"

$ProjectDir   = $PSScriptRoot
$ManifestPath = Join-Path $ProjectDir ".push-manifest.json"

# Folders/files never uploaded
$ExcludeDirs = @('node_modules', '.git', '.pgdata', '.pgdata-menu', 'dist', 'ssl', 'uploads')
$ExcludeFiles = @('.env', '.push-manifest.json')

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  El Nadhour - Incremental Push" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# --- Build current file list with hashes ---
Write-Host "`n[1/4] Scanning project..." -ForegroundColor Yellow

$current = @{}
Get-ChildItem $ProjectDir -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($ProjectDir.Length + 1)
    $parts = $rel -split '[\\/]'

    # Skip excluded folders anywhere in the path
    foreach ($p in $parts) {
        if ($ExcludeDirs -contains $p) { return }
    }
    if ($ExcludeFiles -contains $_.Name) { return }
    if ($_.Extension -eq '.log') { return }

    $hash = (Get-FileHash $_.FullName -Algorithm MD5).Hash
    $current[$rel] = $hash
}

Write-Host "  $($current.Count) files tracked." -ForegroundColor Green

# --- Compare with last push ---
$previous = @{}
if ((Test-Path $ManifestPath) -and -not $All) {
    $json = Get-Content $ManifestPath -Raw | ConvertFrom-Json
    $json.PSObject.Properties | ForEach-Object { $previous[$_.Name] = $_.Value }
}

$changed = @()
foreach ($file in $current.Keys) {
    if (-not $previous.ContainsKey($file) -or $previous[$file] -ne $current[$file]) {
        $changed += $file
    }
}

if ($changed.Count -eq 0) {
    Write-Host "`n  Nothing changed since last push. Done." -ForegroundColor Green
    exit 0
}

Write-Host "`n[2/4] $($changed.Count) file(s) changed:" -ForegroundColor Yellow
$changed | Sort-Object | ForEach-Object { Write-Host "  ~ $_" -ForegroundColor DarkGray }

# --- Decide what to rebuild ---
$needFrontend = $changed | Where-Object { $_ -like 'frontend*' }
$needBackend  = $changed | Where-Object { $_ -like 'backend*' }
$needCompose  = $changed | Where-Object { $_ -like 'docker-compose*' }

if ($needCompose) {
    $services = ""            # rebuild all
    $label = "all services"
} else {
    $list = @()
    if ($needFrontend) { $list += "frontend" }
    if ($needBackend)  { $list += "backend" }
    $services = $list -join " "
    $label = if ($services) { $services } else { "nothing (config only)" }
}

Write-Host "`n  Will rebuild: $label" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`n  [DryRun] Stopping here. Nothing uploaded.`n" -ForegroundColor Magenta
    exit 0
}

# --- Upload changed files (single SSH session via tar) ---
Write-Host "`n[3/4] Uploading changed files..." -ForegroundColor Yellow

$tmpTar = Join-Path $env:TEMP "elnadhour-push.tar"
if (Test-Path $tmpTar) { Remove-Item $tmpTar -Force }

# Write file list for tar (relative paths, forward slashes).
# Must be UTF8 *without* BOM — Windows tar misreads a BOM as a filename.
$listFile = Join-Path $env:TEMP "elnadhour-push-files.txt"
$relPaths = $changed | ForEach-Object { $_ -replace '\\', '/' }
[System.IO.File]::WriteAllLines($listFile, $relPaths, (New-Object System.Text.UTF8Encoding $false))

Push-Location $ProjectDir
tar -cf $tmpTar -T $listFile
Pop-Location

if (-not (Test-Path $tmpTar)) {
    Write-Host "  Failed to create archive." -ForegroundColor Red
    exit 1
}

$sizeKB = [math]::Round((Get-Item $tmpTar).Length / 1KB, 1)
Write-Host "  Archive: $sizeKB KB (vs ~18000 KB full push)" -ForegroundColor Green

scp $tmpTar "${Remote}:/tmp/elnadhour-push.tar"
if ($LASTEXITCODE -ne 0) { Write-Host "  Upload failed." -ForegroundColor Red; exit 1 }

# --- Extract + rebuild on server ---
Write-Host "`n[4/4] Applying on server..." -ForegroundColor Yellow

if ($services) {
    $buildCmd = "sudo docker compose up -d --build $services"
} else {
    $buildCmd = "sudo docker compose up -d"
}

$remoteScript = @"
set -e
sudo tar -xf /tmp/elnadhour-push.tar -C $RemoteApp
rm -f /tmp/elnadhour-push.tar
cd $RemoteApp
sudo find . -maxdepth 1 -name '*.sh' -exec sed -i 's/\r`$//' {} \;
$buildCmd
sudo docker compose ps
"@

ssh $Remote $remoteScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  Deploy failed — manifest not updated, retry after fixing." -ForegroundColor Red
    exit 1
}

# --- Save manifest only on success ---
$current | ConvertTo-Json -Depth 2 | Set-Content $ManifestPath -Encoding UTF8
Remove-Item $tmpTar, $listFile -Force -ErrorAction SilentlyContinue

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "  Pushed $($changed.Count) file(s)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "`n  https://elnadhoure-cafe.tn  (Ctrl+Shift+R to refresh)`n" -ForegroundColor Cyan
