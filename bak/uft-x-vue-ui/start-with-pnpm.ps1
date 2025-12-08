# 全自动代码优化系统 - pnpm PowerShell启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   全自动代码优化系统 - pnpm启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ 检测到pnpm版本: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 检测到系统未安装pnpm" -ForegroundColor Red
    Write-Host "📥 正在安装pnpm..." -ForegroundColor Yellow
    
    try {
        npm install -g pnpm
        Write-Host "✅ pnpm安装成功！" -ForegroundColor Green
    } catch {
        Write-Host "❌ pnpm安装失败，请手动安装" -ForegroundColor Red
        Write-Host "运行: npm install -g pnpm" -ForegroundColor Yellow
        pause
        exit 1
    }
}

Write-Host "📦 开始安装依赖..." -ForegroundColor Yellow

# 安装依赖
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "✅ 依赖安装完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 启动开发服务器..." -ForegroundColor Cyan
Write-Host "📊 访问地址: http://localhost:3000" -ForegroundColor Blue
Write-Host "💻 代码优化器: http://localhost:3000/code-optimizer" -ForegroundColor Blue
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 启动开发服务器
pnpm dev