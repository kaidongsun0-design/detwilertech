@echo off
REM ============================================================
REM dev-clean.bat — 干净启动 dev server
REM  1. 杀掉占用 3000 端口的 node 进程
REM  2. 清掉 dev 缓存 .next-dev
REM  3. 用新的 distDir(.next-dev)启动 dev,绝不与 build 产物冲突
REM
REM 用法: 双击运行,或在 PowerShell/Cmd 里执行 .\dev-clean.bat
REM ============================================================

setlocal

echo [1/3] Killing node processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
  echo    killing PID %%a
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo [2/3] Cleaning dev cache (.next-dev)...
if exist .next-dev rmdir /s /q .next-dev
if exist dev.log del /q dev.log

echo [3/3] Starting dev server on port 3000 (distDir=.next-dev)...
set NODE_OPTIONS=--no-deprecation
call npx next dev -p 3000 -H 0.0.0.0

endlocal
