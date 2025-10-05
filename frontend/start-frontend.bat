@echo off
echo ========================================
echo   🤖 Starting GRIT-X-Awa Frontend
echo   AI Chatbot Enabled (GPT-3.5 Turbo)
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ❌ ERROR: .env file not found!
    echo.
    echo 📝 Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env and add your OPENAI_API_KEY
    echo    Then run this script again.
    echo.
    pause
    exit /b 1
)

REM Check if OPENAI_API_KEY is set
findstr /C:"OPENAI_API_KEY=sk-" .env >nul
if errorlevel 1 (
    echo ⚠️  WARNING: OPENAI_API_KEY not configured in .env
    echo    AI Chatbot will not work until you add your API key.
    echo.
    echo 📖 See AI_CHATBOT_README.md for setup instructions
    echo.
    pause
)

echo ✅ Environment configured
echo 🚀 Starting development server...
echo.
echo 📍 Frontend will be available at: http://localhost:4321
echo 🤖 AI Chatbot endpoint: http://localhost:4321/api/chat
echo.
echo ⏳ Please wait for "VITE ready" message...
echo.

npm run dev
