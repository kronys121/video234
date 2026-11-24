@echo off
chcp 65001 >nul
cd /d "%~dp0"
title GTA 6 Short - render
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js не найден. Установи Node.js 18 или новее: https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules (
  echo Устанавливаю зависимости, это один раз...
  call npm install
  if errorlevel 1 ( echo Ошибка npm install & pause & exit /b 1 )
)
echo Рендер 3 шортов 1080x1920, 60 к/с...
call npm run render
if errorlevel 1 ( echo Рендер завершился с ошибкой & pause & exit /b 1 )
echo.
echo Готово: out\gta6_short1.mp4, gta6_short2_police.mp4, gta6_short3_tricks.mp4
start "" "out"
pause
