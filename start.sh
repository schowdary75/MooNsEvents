#!/usr/bin/env bash
set -Euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
EWEB_DIR="${MOONS_EWEB_DIR:-C:/MooNsEWeb}"
LOG_DIR="${ROOT_DIR}/storage/logs"
START_LOG="${LOG_DIR}/start.log"
API_PID=""
CRM_PID=""
WEB_PID=""
REDIS_PID=""
SHUTTING_DOWN=false

mkdir -p "${LOG_DIR}"
: >"${START_LOG}"

info() {
  printf '==> %s\n' "$*" | tee -a "${START_LOG}"
}

pause_on_windows() {
  if [[ "${MOONS_NO_PAUSE:-false}" == "true" ]]; then return; fi
  printf '\nThe launcher is paused so this window will not close.\n'
  if [[ -t 0 ]]; then
    read -r -p "Press Enter to close..." _ || true
  elif command -v cmd.exe >/dev/null 2>&1; then
    cmd.exe /d /c pause || true
  fi
}

fail() {
  local message="$1"
  printf '\nERROR: %s\nStartup log: %s\n\n' "${message}" "${START_LOG}" | tee -a "${START_LOG}" >&2
  pause_on_windows
  exit 1
}

on_error() {
  local code=$?
  local line="${BASH_LINENO[0]:-unknown}"
  trap - ERR
  fail "Startup command failed at line ${line} with exit code ${code}."
}
trap on_error ERR

cleanup() {
  [[ "${SHUTTING_DOWN}" == "true" ]] && return
  SHUTTING_DOWN=true
  trap - EXIT INT TERM
  info "Stopping MooNsEvents services..."
  local pids=()
  [[ -n "${API_PID}" ]] && pids+=("${API_PID}")
  [[ -n "${CRM_PID}" ]] && pids+=("${CRM_PID}")
  [[ -n "${WEB_PID}" ]] && pids+=("${WEB_PID}")
  [[ -n "${REDIS_PID}" ]] && pids+=("${REDIS_PID}")
  ((${#pids[@]})) && kill "${pids[@]}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

command -v node >/dev/null 2>&1 || fail "Node.js is required."
command -v npm >/dev/null 2>&1 || fail "npm is required."
command -v corepack >/dev/null 2>&1 || fail "Corepack is required for MooNsEWeb."
[[ -f "${EWEB_DIR}/package.json" ]] || fail "MooNsEWeb was not found at ${EWEB_DIR}. Set MOONS_EWEB_DIR to its location."

require_free_port() {
  local port="$1"
  local service="$2"
  if ! node -e "const n=require('net');const s=n.createServer();s.once('error',()=>process.exit(1));s.once('listening',()=>s.close(()=>process.exit(0)));s.listen(Number(process.argv[1]))" "${port}"; then
    fail "Port ${port} is already in use, so ${service} was not started. Stop the existing process and run start.sh again."
  fi
}

require_free_port 4000 "the event API"
require_free_port 8080 "the event CRM"
require_free_port 3001 "the customer website"

ensure_redis() {
  if node -e "const n=require('net');const s=n.connect(6379,'127.0.0.1');s.setTimeout(1000);s.once('connect',()=>{s.end();process.exit(0)});s.once('error',()=>process.exit(1));s.once('timeout',()=>process.exit(1))"; then
    info "Native Redis is already running on port 6379."
    return
  fi

  local redis_exe=""
  redis_exe="$(command -v redis-server 2>/dev/null || true)"
  if [[ -z "${redis_exe}" ]] && command -v powershell.exe >/dev/null 2>&1; then
    redis_exe="$(powershell.exe -NoProfile -Command "Get-ChildItem -Path \"\$env:LOCALAPPDATA\\Microsoft\\WinGet\\Packages\" -Recurse -Filter redis-server.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName" | tr -d '\r')"
  fi
  [[ -n "${redis_exe}" && -f "${redis_exe}" ]] || fail "Native Redis is required. Install it with: winget install --exact --id taizod1024.redis-windows-fork --scope user"

  info "Starting native Redis on port 6379..."
  "${redis_exe}" --bind 127.0.0.1 --port 6379 --save 60 1 >>"${START_LOG}" 2>&1 &
  REDIS_PID=$!
  sleep 2
  kill -0 "${REDIS_PID}" 2>/dev/null || fail "Native Redis stopped during startup."
}

ensure_redis

cd "${ROOT_DIR}"
if [[ ! -d node_modules || ! -d node_modules/@prisma/client ]]; then
  info "Installing MooNsEvents dependencies (first run)..."
  if [[ -f package-lock.json ]]; then
    npm ci --no-audit --no-fund 2>&1 | tee -a "${START_LOG}"
  else
    npm install --no-audit --no-fund 2>&1 | tee -a "${START_LOG}"
  fi
else
  info "MooNsEvents dependencies are already installed."
fi

if [[ ! -d "${EWEB_DIR}/node_modules" ]]; then
  info "Installing MooNsEWeb dependencies (first run)..."
  (cd "${EWEB_DIR}" && corepack pnpm install) 2>&1 | tee -a "${START_LOG}"
else
  info "MooNsEWeb dependencies are already installed."
fi

[[ -f "${ROOT_DIR}/.env" ]] || npm run setup:env 2>&1 | tee -a "${START_LOG}"

if [[ "${MOONS_RUN_SETUP:-false}" == "true" ]]; then
  info "Generating Prisma clients..."
  npm run prisma:generate 2>&1 | tee -a "${START_LOG}"
  info "Deploying the event CRM database baseline..."
  npm run prisma:deploy 2>&1 | tee -a "${START_LOG}"
  info "Ensuring the starter event catalog exists..."
  npm run prisma:seed 2>&1 | tee -a "${START_LOG}"
else
  info "Database setup skipped. Set MOONS_RUN_SETUP=true for first-time migration and seed."
fi

info "Starting the event API on port 4000..."
(cd "${ROOT_DIR}" && npm run dev:server) >>"${START_LOG}" 2>&1 & API_PID=$!

info "Starting the event CRM on port 8080..."
(cd "${ROOT_DIR}" && npm run dev:client) >>"${START_LOG}" 2>&1 & CRM_PID=$!

info "Starting the customer website on port 3001..."
(cd "${EWEB_DIR}" && corepack pnpm dev) >>"${START_LOG}" 2>&1 & WEB_PID=$!

sleep 3
kill -0 "${API_PID}" 2>/dev/null || fail "The event API stopped during startup."
kill -0 "${CRM_PID}" 2>/dev/null || fail "The event CRM stopped during startup."
kill -0 "${WEB_PID}" 2>/dev/null || fail "The customer website stopped during startup."

printf '\nMooNsEvents is running:\n'
printf '  Event CRM:      http://localhost:8080\n'
printf '  Event API:      http://localhost:4000/api/v1\n'
printf '  Customer site:  http://localhost:3001\n'
printf '  Startup log:    %s\n' "${START_LOG}"
printf 'Press Ctrl+C to stop all services.\n\n'

while true; do
  sleep 2
  kill -0 "${API_PID}" 2>/dev/null || fail "The event API exited unexpectedly."
  kill -0 "${CRM_PID}" 2>/dev/null || fail "The event CRM exited unexpectedly."
  kill -0 "${WEB_PID}" 2>/dev/null || fail "The customer website exited unexpectedly."
done
