@echo off
echo ====================================
echo ROBTOR Health Assistant - Setup
echo ====================================
echo.

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo Installation failed! Please check the error messages above.
    pause
    exit /b %errorlevel%
)

echo.
echo ====================================
echo Installation completed successfully!
echo ====================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo To build for production, run:
echo   npm run build
echo.
pause
