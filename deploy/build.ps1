# Builds the multi-calendar showcase and stages it for the container image.
#
# The Vite playground compiles the library's TypeScript sources directly, so
# this has to run in the workspace; the Dockerfile only copies the result.
[CmdletBinding()]
param(
    # Sub-path the site is served from. Baked into every asset URL, so it has to
    # match the location nginx publishes.
    [string] $BasePath = '/'
)

$ErrorActionPreference = 'Stop'

$deployDir = $PSScriptRoot
$repoRoot = Split-Path -Parent $deployDir
$devextreme = Join-Path $repoRoot 'packages\devextreme'
$viteOut = Join-Path $devextreme 'artifacts\playground'
$stage = Join-Path $deployDir 'site'

Push-Location $devextreme
try {
    # The DevBox widget themes (playground/themes) compile next to the stock
    # themes in artifacts/css, which the pages import from.
    Write-Host "Compiling the DevBox themes..."
    & node 'playground/themes/build-themes.mjs'
    if ($LASTEXITCODE -ne 0) { throw "theme build failed with exit code $LASTEXITCODE" }

    Write-Host "Building playground with base '$BasePath'..."
    $env:PLAYGROUND_BASE = $BasePath
    & node 'node_modules/vite/bin/vite.js' build
    if ($LASTEXITCODE -ne 0) { throw "vite build failed with exit code $LASTEXITCODE" }
} finally {
    Remove-Item Env:\PLAYGROUND_BASE -ErrorAction SilentlyContinue
    Pop-Location
}

$subPath = $BasePath.Trim('/')
$target = if ($subPath) { Join-Path $stage $subPath } else { $stage }
Write-Host "Staging into $target..."
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $target | Out-Null
Copy-Item -Path (Join-Path $viteOut '*') -Destination $target -Recurse -Force

$count = (Get-ChildItem $target -Recurse -File).Count
$size = [math]::Round(((Get-ChildItem $target -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 1)
Write-Host "Staged $count files ($size MB). Next: scripts\deploy-compose.ps1 -ProjectName devextreme-fa-demos -File deploy\docker-compose.yml -Sites 'devextreme.dev-box.ir=8094','demos.dev-box.ir=8094'"
