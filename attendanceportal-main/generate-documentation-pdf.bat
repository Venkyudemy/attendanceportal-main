@echo off
echo ========================================
echo   Attendance Portal Documentation PDF
echo ========================================
echo.

echo 📦 Installing required dependencies...
npm install puppeteer marked

echo.
echo 📄 Generating PDF documentation...
node generate-pdf.js

echo.
echo ✅ Process completed!
echo 📁 Check for: Attendance_Portal_Documentation.pdf
echo.
pause
