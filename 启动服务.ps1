# 启动损益归因分析系统服务脚本
# 解决中文路径编码问题

Write-Host "正在启动损益归因分析系统..." -ForegroundColor Green

# 获取脚本所在目录
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"
$frontendPath = Join-Path $scriptPath "frontend"

# 停止现有进程
Write-Host "`n清理现有进程..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8002 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Get-NetTCPConnection -LocalPort 8083 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# 启动后端服务
Write-Host "`n启动后端服务 (端口 8002)..." -ForegroundColor Cyan
Push-Location $backendPath
Start-Process -FilePath "python" -ArgumentList "main.py" -WindowStyle Hidden
Pop-Location
Start-Sleep -Seconds 4

# 启动前端服务
Write-Host "启动前端服务 (端口 8083)..." -ForegroundColor Cyan
Push-Location $frontendPath
Start-Process -FilePath "python" -ArgumentList "-m","http.server","8083" -WindowStyle Hidden
Pop-Location
Start-Sleep -Seconds 3

# 检查服务状态
Write-Host "`n检查服务状态..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

$backendOk = $false
$frontendOk = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8002/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        $backendOk = $true
        Write-Host "✓ 后端服务正常 (http://localhost:8002)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ 后端服务启动失败" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083/index.html" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        $frontendOk = $true
        Write-Host "✓ 前端服务正常 (http://localhost:8083)" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ 前端服务启动失败" -ForegroundColor Red
}

Write-Host "`n" + "="*50 -ForegroundColor Cyan
if ($backendOk -and $frontendOk) {
    Write-Host "服务启动成功！" -ForegroundColor Green
    Write-Host "`n访问地址:" -ForegroundColor Yellow
    Write-Host "  前端页面: http://localhost:8083" -ForegroundColor White
    Write-Host "  后端API: http://localhost:8002" -ForegroundColor White
    Write-Host "  API文档: http://localhost:8002/docs" -ForegroundColor White
} else {
    Write-Host "部分服务启动失败，请检查错误信息" -ForegroundColor Red
}
Write-Host "="*50 -ForegroundColor Cyan

