# Downloads the latest successful Build Android APK artifact and publishes a GitHub release.
# Requires: gh CLI authenticated (gh auth login) OR GITHUB_TOKEN env var with repo scope.
param(
  [string]$Tag = "v1.0.0",
  [string]$RunId = "",
  [switch]$PreRelease = $true
)

$ErrorActionPreference = "Stop"
$repo = "mregan508/Garden"
$version = $Tag.TrimStart("v")
$releasesDir = Join-Path $PSScriptRoot ".." "releases"
$apkPath = Join-Path $releasesDir "garden-map.apk"

function Get-GitHubToken {
  if ($env:GITHUB_TOKEN) { return $env:GITHUB_TOKEN }
  $gh = Get-Command gh -ErrorAction SilentlyContinue
  if ($gh) {
    $token = gh auth token 2>$null
    if ($token) { return $token.Trim() }
  }
  throw "No GitHub auth. Run 'gh auth login' or set GITHUB_TOKEN."
}

function Invoke-GitHubApi {
  param([string]$Method, [string]$Uri, [object]$Body = $null, [hashtable]$Headers = @{})
  $token = Get-GitHubToken
  $params = @{
    Method      = $Method
    Uri         = $Uri
    Headers     = @{
      Authorization = "Bearer $token"
      Accept        = "application/vnd.github+json"
      "X-GitHub-Api-Version" = "2022-11-28"
    } + $Headers
  }
  if ($Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
    $params.ContentType = "application/json"
  }
  Invoke-RestMethod @params
}

if (-not $RunId) {
  $runs = Invoke-GitHubApi -Method GET -Uri "https://api.github.com/repos/$repo/actions/workflows/build-android-apk.yml/runs?status=success&per_page=1"
  if ($runs.total_count -eq 0) {
    throw "No successful Build Android APK runs found."
  }
  $RunId = $runs.workflow_runs[0].id
}

Write-Host "Using workflow run $RunId"

$artifacts = Invoke-GitHubApi -Method GET -Uri "https://api.github.com/repos/$repo/actions/runs/$RunId/artifacts"
$artifact = $artifacts.artifacts | Where-Object { $_.name -eq "garden-map-apk" } | Select-Object -First 1
if (-not $artifact) {
  throw "Artifact garden-map-apk not found on run $RunId"
}

New-Item -ItemType Directory -Force -Path $releasesDir | Out-Null
$zipPath = Join-Path $releasesDir "garden-map-apk.zip"
Invoke-GitHubApi -Method GET -Uri "https://api.github.com/repos/$repo/actions/artifacts/$($artifact.id)/zip" -Headers @{ Accept = "application/vnd.github+json" } | Out-Null
# Download zip with proper binary handling
$token = Get-GitHubToken
Invoke-WebRequest -Uri "https://api.github.com/repos/$repo/actions/artifacts/$($artifact.id)/zip" `
  -Headers @{ Authorization = "Bearer $token"; Accept = "application/vnd.github+json" } `
  -OutFile $zipPath
Expand-Archive -Path $zipPath -DestinationPath $releasesDir -Force
Remove-Item $zipPath -Force
if (-not (Test-Path $apkPath)) {
  $found = Get-ChildItem -Path $releasesDir -Filter "*.apk" -Recurse | Select-Object -First 1
  if ($found) { Copy-Item $found.FullName $apkPath -Force }
}
if (-not (Test-Path $apkPath)) {
  throw "APK not found after extracting artifact"
}

$sha256 = (Get-FileHash -Path $apkPath -Algorithm SHA256).Hash.ToLower()
$sizeMb = [math]::Round((Get-Item $apkPath).Length / 1MB, 1)
$commitSha = (Invoke-GitHubApi -Method GET -Uri "https://api.github.com/repos/$repo/actions/runs/$RunId").head_sha

$notes = @"
## Garden Map for Android v$version

First Android sideload release of **Garden Map** — place and track plants on a satellite garden map, synced with the web app at [mregan.xyz/garden](https://mregan.xyz/garden).

### Install

1. Download **garden-map.apk** below.
2. On your Android device, allow installs from unknown sources when prompted.
3. Open the APK and complete installation.
4. Sign in with the same account you use on the web app.

### Verify download

| | |
|---|---|
| **File** | ``garden-map.apk`` |
| **SHA-256** | ``$sha256`` |
| **Size** | ${sizeMb} MB |
| **Built from** | [$commitSha](https://github.com/$repo/commit/$commitSha) |

> **Note:** This is a debug sideload build from CI, not a Google Play release. For production distribution, a signed release build should replace this.

### Features

- Satellite map with plant pins
- 100-plant reference catalog
- Care reminders and activity feed
- Weather forecast for your garden
- Sync with web app via Supabase
"@

$gh = Get-Command gh -ErrorAction SilentlyContinue
if ($gh) {
  $preFlag = if ($PreRelease) { "--prerelease" } else { "" }
  gh release view $Tag -R $repo 2>$null
  if ($LASTEXITCODE -eq 0) {
    gh release upload $Tag $apkPath --clobber -R $repo
    gh release edit $Tag -R $repo --title "Garden Map v$version (Android)" --notes $notes $(if ($PreRelease) { "--prerelease" })
  } else {
    $args = @("release", "create", $Tag, $apkPath, "--repo", $repo, "--target", $commitSha, "--title", "Garden Map v$version (Android)", "--notes", $notes)
    if ($PreRelease) { $args += "--prerelease" }
    & gh @args
  }
} else {
  throw "gh CLI required for release upload. Install from https://cli.github.com/"
}

Write-Host ""
Write-Host "Release published: https://github.com/$repo/releases/tag/$Tag"
Write-Host "Download URL:      https://github.com/$repo/releases/latest/download/garden-map.apk"
Write-Host "SHA-256:           $sha256"
Write-Host "APK saved to:      $apkPath"
