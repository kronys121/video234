@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Сборка stolovaya.mp4 из частей...
copy /b stolovaya.mp4.001 + stolovaya.mp4.002 + stolovaya.mp4.003 + stolovaya.mp4.004 stolovaya.mp4
echo Готово: stolovaya.mp4
pause
