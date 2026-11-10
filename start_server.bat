@echo off
title Earthlingo - Local Server
echo ===================================================
echo             Starting Earthlingo Local Server
echo ===================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting Python HTTP server on port 8000...
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting Python HTTP server on port 8000...
    start http://localhost:8000
    py -m http.server 8000
    goto end
)

where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting Node serve on port 8000...
    start http://localhost:8000
    npx --yes serve -l 8000
    goto end
)

echo Notice: Neither Python nor Node.js was found in PATH.
echo Good news: Earthlingo is pre-bundled to work directly!
echo Opening index.html in your default browser...
start index.html

:end
pause

