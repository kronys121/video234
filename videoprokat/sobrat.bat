@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Сборка videoprokat.mp4 из частей...
copy /b videoprokat.mp4.001 + videoprokat.mp4.002 + videoprokat.mp4.003 + videoprokat.mp4.004 videoprokat.mp4
echo Готово: videoprokat.mp4
pause
