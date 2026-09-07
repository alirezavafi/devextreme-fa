# Builds the multi-calendar showcase and stages it for the container image.
#
# The Vite playground compiles the library's TypeScript sources directly, so
# this has to run in the workspace; the Dockerfile only copies the result.
[CmdletBinding()]
param(
    # Sub-path the site is served from. Baked into every asset URL, so it has to
    # match the location nginx publishes.
    [string] $BasePath = '/devextreme-fa/',

    # Ship every built demo rather than only this fork's multi-calendar ones.
    # Each demo bundles the whole library, so all 500 come to ~1.6 GB against
    # ~25 MB for the multi-calendar set.
    [switch] $AllDemos
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

# The demo bundles are built separately (apps/demos: prepare-js, then
# make-demos-bundle per framework); stage whatever is currently there.
$publishDemos = Join-Path $repoRoot 'apps\demos\publish-demos'
if (Test-Path (Join-Path $publishDemos 'Demos')) {
    $demosTarget = Join-Path $target 'demos'
    Write-Host "Staging demos into $demosTarget ($(if ($AllDemos) { 'all' } else { 'multi-calendar only' }))..."
    New-Item -ItemType Directory -Force -Path $demosTarget | Out-Null

    # The shared theme/data/script assets every demo page links to.
    Get-ChildItem $publishDemos -Exclude 'Demos' | Copy-Item -Destination $demosTarget -Recurse -Force

    if ($AllDemos) {
        Copy-Item -Path (Join-Path $publishDemos 'Demos') -Destination $demosTarget -Recurse -Force
    } else {
        Get-ChildItem (Join-Path $publishDemos 'Demos') -Directory -Filter 'MultipleCalendars' -Recurse |
            ForEach-Object {
                $relative = $_.FullName.Substring($publishDemos.Length).TrimStart('\')
                $destination = Join-Path $demosTarget $relative
                New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
                Copy-Item -Path $_.FullName -Destination $destination -Recurse -Force
            }
    }
    & node (Join-Path $deployDir 'make-demos-index.js') $demosTarget (Join-Path $demosTarget 'index.html')
    if ($LASTEXITCODE -ne 0) { throw "demos index generation failed" }
} else {
    Write-Warning "No apps/demos/publish-demos found - the site will ship without the demos."
}

$count = (Get-ChildItem $target -Recurse -File).Count
$size = [math]::Round(((Get-ChildItem $target -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 1)
Write-Host "Staged $count files ($size MB). Next: scripts\deploy-compose.ps1 -ProjectName devextreme-fa-demos -File deploy\docker-compose.yml -Sites 'demos.dev-box.ir=8094'"
