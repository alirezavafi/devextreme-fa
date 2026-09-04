# Builds the multi-calendar showcase and stages it for the container image.
#
# The Vite playground compiles the library's TypeScript sources directly, so
# this has to run in the workspace; the Dockerfile only copies the result.
[CmdletBinding()]
param(
    # Sub-path the site is served from. Baked into every asset URL, so it has to
    # match the location nginx publishes.
    [string] $BasePath = '/devextreme-fa/'
)

$ErrorActionPreference = 'Stop'

$deployDir = $PSScriptRoot
$repoRoot = Split-Path -Parent $deployDir
$devextreme = Join-Path $repoRoot 'packages\devextreme'
$viteOut = Join-Path $devextreme 'artifacts\playground'
$stage = Join-Path $deployDir 'site'

Write-Host "Building playground with base '$BasePath'..."
Push-Location $devextreme
try {
    $env:PLAYGROUND_BASE = $BasePath
    & node 'node_modules/vite/bin/vite.js' build
    if ($LASTEXITCODE -ne 0) { throw "vite build failed with exit code $LASTEXITCODE" }
} finally {
    Remove-Item Env:\PLAYGROUND_BASE -ErrorAction SilentlyContinue
    Pop-Location
}

$target = Join-Path $stage ($BasePath.Trim('/'))
Write-Host "Staging into $target..."
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $target | Out-Null
Copy-Item -Path (Join-Path $viteOut '*') -Destination $target -Recurse -Force

$count = (Get-ChildItem $target -Recurse -File).Count
$size = [math]::Round(((Get-ChildItem $target -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 1)
Write-Host "Staged $count files ($size MB). Next: scripts\deploy-compose.ps1 -ProjectName devextreme-fa-demos -File deploy\docker-compose.yml -Sites 'demos.dev-box.ir=8094'"
