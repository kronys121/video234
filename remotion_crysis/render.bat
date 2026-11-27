@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Crysis - render
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
echo Рендер ролика Crysis 1920x1080, 60 к/с...
call npm run render
if errorlevel 1 ( echo Рендер завершился с ошибкой & pause & exit /b 1 )
echo.
echo Готово: out\crysis_final.mp4
start "" "out"
pause
