@echo off
setlocal enabledelayedexpansion
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%a
echo Branch is: %CURRENT_BRANCH%
pause
