@echo off
echo ========================================
echo   全自动代码优化系统 - pnpm启动脚本
echo ========================================
echo.

REM 检查是否安装了pnpm
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 检测到系统未安装pnpm
    echo 📥 正在安装pnpm...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ❌ pnpm安装失败，请手动安装
        pause
        exit /b 1
    )
    echo ✅ pnpm安装成功！
)

echo 📦 开始安装依赖...
pnpm install

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装完成！
echo.
echo 🚀 启动开发服务器...
echo 📊 访问地址: http://localhost:3000
echo 💻 代码优化器: http://localhost:3000/code-optimizer
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

REM 启动开发服务器
pnpm dev

pause