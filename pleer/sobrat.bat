@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Сборка video.mp4 из частей...
copy /b video.mp4.001 + video.mp4.002 + video.mp4.003 + video.mp4.004 video.mp4
echo Готово: video.mp4
pause
