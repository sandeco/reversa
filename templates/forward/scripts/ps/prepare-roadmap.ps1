# prepare-roadmap.ps1
# Helper specific to the /reversa-plan skill.
# Ensures the active feature folder exists and returns ready-to-use absolute paths.
#
# Usage:
#   prepare-roadmap.ps1 [-Json]
#
# Exit codes: 0 ok, 1 active-requirements missing/invalid, 2 could not create feature-dir, 3 invalid usage.

[CmdletBinding()]
param(
  [switch]$Json
)

$ErrorActionPreference = 'Stop'

$scriptDir   = Split-Path -Parent $PSCommandPath
$projectRoot = (Resolve-Path (Join-Path $scriptDir '..\..')).Path
$reversaDir  = Join-Path $projectRoot '.reversa'
$sddDir      = Join-Path $projectRoot '_reversa_sdd'
$active      = Join-Path $reversaDir 'active-requirements.json'

if (-not (Test-Path -LiteralPath $active)) {
  Write-Error "$active does not exist. Run reversa-requirements first."
  exit 1
}

try {
  $payload = Get-Content -LiteralPath $active -Raw -Encoding utf8 | ConvertFrom-Json
} catch {
  Write-Error "active-requirements.json is invalid: $($_.Exception.Message)"
  exit 1
}

$rel = $payload.'feature-dir'
if (-not $rel) {
  Write-Error "feature-dir field is missing in $active"
  exit 1
}

$featureDir    = Join-Path $projectRoot $rel
$interfacesDir = Join-Path $featureDir 'interfaces'

try {
  New-Item -ItemType Directory -Force -Path $interfacesDir | Out-Null
} catch {
  Write-Error "could not create $interfacesDir: $($_.Exception.Message)"
  exit 2
}

$requirementsPath  = Join-Path $featureDir 'requirements.md'
$roadmapPath       = Join-Path $featureDir 'roadmap.md'
$investigationPath = Join-Path $featureDir 'investigation.md'
$dataDeltaPath     = Join-Path $featureDir 'data-delta.md'
$onboardingPath    = Join-Path $featureDir 'onboarding.md'

$result = [ordered]@{
  'project-root' = $projectRoot
  'sdd-dir'      = $sddDir
  'feature-dir'  = $featureDir
  'requirements' = [ordered]@{
    path    = $requirementsPath
    present = (Test-Path -LiteralPath $requirementsPath)
  }
  'roadmap' = [ordered]@{
    path             = $roadmapPath
    'already-exists' = (Test-Path -LiteralPath $roadmapPath)
  }
  'investigation'  = $investigationPath
  'data-delta'     = $dataDeltaPath
  'onboarding'     = $onboardingPath
  'interfaces-dir' = $interfacesDir
  'template'       = (Join-Path $reversaDir 'templates\roadmap-template.md')
}

if ($Json) {
  $result | ConvertTo-Json -Compress -Depth 4 | Write-Output
} else {
  Write-Output "feature-dir: $featureDir"
  Write-Output "requirements present: $($result.requirements.present)"
  Write-Output "roadmap already exists: $($result.roadmap.'already-exists')"
}

exit 0
