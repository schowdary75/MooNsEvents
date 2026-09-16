$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$outputLog = Join-Path $root 'storage/logs/api-diagnostic.log'
$errorLog = Join-Path $root 'storage/logs/api-diagnostic-error.log'
$operations = @(
  'adminGetJourneyBoard',
  'getAllSupportChats',
  'adminGetLocationsAll',
  'adminGetVendorsAll',
  'adminGetListingRevisions',
  'adminGetPipelines',
  'adminGetDeals',
  'adminGetLeads'
)

function Read-EnvValue([string] $name) {
  $line = Get-Content (Join-Path $root '.env') |
    Where-Object { $_ -match "^$([regex]::Escape($name))=" } |
    Select-Object -First 1
  if (-not $line) { throw "Missing $name in the root .env file." }
  return (($line -split '=', 2)[1]).Trim('"')
}

$listener = Get-NetTCPConnection -State Listen -LocalPort 4000 -ErrorAction SilentlyContinue
if ($listener) { Stop-Process -Id $listener.OwningProcess -Force }
Remove-Item -LiteralPath $outputLog, $errorLog -ErrorAction SilentlyContinue

$starter = Start-Process `
  -FilePath (Get-Command node).Source `
  -ArgumentList 'node_modules/tsx/dist/cli.mjs', 'server/src/server.ts' `
  -WorkingDirectory $root `
  -RedirectStandardOutput $outputLog `
  -RedirectStandardError $errorLog `
  -WindowStyle Hidden `
  -PassThru

try {
  $ready = $false
  foreach ($attempt in 1..60) {
    if (Get-NetTCPConnection -State Listen -LocalPort 4000 -ErrorAction SilentlyContinue) {
      $ready = $true
      break
    }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'The API did not start within 60 seconds.' }

  $email = Read-EnvValue 'ADMIN_EMAIL'
  $password = Read-EnvValue 'ADMIN_PASSWORD'
  $loginBody = @{ data = @{ email = $email; password = $password } } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/v1/operations/crmLogin' -ContentType 'application/json' -Body $loginBody
  if (-not $login.data.success) { throw "CRM login failed: $($login.data.error)" }

  $auth = @{ email = $email; sessionToken = $login.data.user.session_token }
  $failed = $false
  foreach ($operation in $operations) {
    try {
      $body = @{ data = @{ auth = $auth } } | ConvertTo-Json -Depth 6
      $response = Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/v1/operations/$operation" -ContentType 'application/json' -Body $body
      if ($response.success -ne $true) { throw "Operation returned an unsuccessful response." }
      Write-Output "$operation`t200"
    } catch {
      $failed = $true
      $status = [int]$_.Exception.Response.StatusCode
      Write-Output "$operation`t$status`t$($_.ErrorDetails.Message)"
    }
  }

  if ($failed) {
    Write-Output '--- API LOG ---'
    Get-Content $outputLog -Tail 400 -ErrorAction SilentlyContinue
    Get-Content $errorLog -Tail 400 -ErrorAction SilentlyContinue
    exit 1
  }
} finally {
  $listener = Get-NetTCPConnection -State Listen -LocalPort 4000 -ErrorAction SilentlyContinue
  if ($listener) { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue }
  Stop-Process -Id $starter.Id -Force -ErrorAction SilentlyContinue
}
