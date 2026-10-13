@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Сборка mobilniki.mp4 из частей...
copy /b mobilniki.mp4.001 + mobilniki.mp4.002 + mobilniki.mp4.003 + mobilniki.mp4.004 mobilniki.mp4
echo Готово: mobilniki.mp4
pause
