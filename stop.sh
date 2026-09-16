#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"

if ! command -v powershell.exe >/dev/null 2>&1; then
  printf 'MooNsEvents uses the foreground launcher. Return to its window and press Ctrl+C.\n'
  exit 0
fi

printf 'Stopping native MooNsEvents services on ports 4000, 8080 and 3001...\n'
powershell.exe -NoProfile -Command '
  $ports = 4000, 8080, 3001
  $owners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $ports -contains $_.LocalPort } |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $owners) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    if ($process -and ($process.Name -match "^(node|npm|cmd)" -or $process.CommandLine -match "MooNsEvents|MooNsEWeb")) {
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
  }
' | tr -d '\r'

printf 'MooNsEvents is stopped. The moonsevents database, uploads, and native Redis data were preserved.\n'
