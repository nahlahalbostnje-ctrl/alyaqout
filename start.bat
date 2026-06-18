@echo off
taskkill /f /im php.exe >nul 2>&1
timeout /t 1 /nobreak >nul
start cmd /k "cd /d C:\Users\HP\Desktop\Yaqoot\codes\backend && php artisan serve"
start cmd /k "cd /d C:\Users\HP\Desktop\Yaqoot\codes\frontend && npm run dev"
