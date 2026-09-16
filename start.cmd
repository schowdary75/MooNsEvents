@echo off
setlocal
set "CRM_DIR=%~dp0"
set "GIT_BASH=C:\Program Files\Git\bin\bash.exe"

if not exist "%GIT_BASH%" (
  echo Error: Git Bash was not found at %GIT_BASH%.
  echo Install Git for Windows or run start.sh from an existing Bash terminal.
  pause
  exit /b 1
)

cd /d "%CRM_DIR%"
"%GIT_BASH%" start.sh
set "RESULT=%ERRORLEVEL%"

if not "%RESULT%"=="0" (
  echo.
  echo MooNsEvents did not start successfully.
  echo See storage\logs\start.log for details.
  pause
)

endlocal & exit /b %RESULT%
