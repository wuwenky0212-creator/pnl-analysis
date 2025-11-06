@echo off
echo Starting Current P&L Analysis Frontend Server...
echo Frontend will be available at http://localhost:8083
python -m http.server 8083 --directory frontend
pause


