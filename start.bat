@echo off
setlocal
title EDTools Companion Server
color 0B

echo =======================================================
echo    EDTools - Elite Dangerous 4.2 Keyboard Reference
echo                  Companion Server
echo =======================================================
echo.

set "BUN_CMD="

:: Check if bun is directly in PATH
where bun >nul 2>&1
if not errorlevel 1 (
    set "BUN_CMD=bun"
)

:: Check UserProfile .bun directory
if not defined BUN_CMD (
    if exist "%USERPROFILE%\.bun\bin\bun.exe" (
        set "BUN_CMD=%USERPROFILE%\.bun\bin\bun.exe"
    )
)

:: Check specific location
if not defined BUN_CMD (
    if exist "C:\Users\fary2\.bun\bin\bun.exe" (
        set "BUN_CMD=C:\Users\fary2\.bun\bin\bun.exe"
    )
)

if not defined BUN_CMD (
    echo [ERROR] Bun is not installed or not found in PATH!
    echo Please make sure Bun is installed: https://bun.sh
    echo.
    pause
    exit /b 1
)

echo [INFO] Found Bun runtime: %BUN_CMD%

cd /d "%~dp0"

echo [INFO] Starting global background key listener...
start "EDTools Global KeyListener" /min powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0key_listener.ps1"

echo [INFO] Opening browser in 2 seconds...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

echo [INFO] Starting EDTools server on http://localhost:3000...
echo.
"%BUN_CMD%" run server.ts

if errorlevel 1 (
    echo.
    echo [ERROR] Companion server exited with an error.
)
echo.
echo Companion server has stopped.
pause
