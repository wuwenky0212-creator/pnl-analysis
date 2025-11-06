@echo off
chcp 65001 >nul
echo ============================================
echo 🚀 当前损益分析系统 - Docker 部署
echo ============================================
echo.

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    echo 访问: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

REM 构建镜像
echo 🔨 构建 Docker 镜像...
docker-compose build
if errorlevel 1 (
    echo ❌ 镜像构建失败
    pause
    exit /b 1
)

echo.
echo 🚀 启动服务...
docker-compose up -d
if errorlevel 1 (
    echo ❌ 服务启动失败
    pause
    exit /b 1
)

echo.
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查健康状态
echo.
echo 🔍 检查服务状态...
curl -f http://localhost:8080/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  服务可能未完全启动，请查看日志:
    echo    docker-compose logs -f
    echo.
    pause
    exit /b 1
)

echo ✅ 服务启动成功！
echo.
echo ============================================
echo 📋 服务访问地址
echo ============================================
echo 🌐 API 服务:     http://localhost:8080
echo 📚 API 文档:     http://localhost:8080/docs
echo 🔍 可选页:       http://localhost:8080/redoc
echo ❤️  健康检查:    http://localhost:8080/health
echo.
echo ============================================
echo 📝 常用命令
echo ============================================
echo 查看日志:      docker-compose logs -f
echo 停止服务:      docker-compose stop
echo 重启服务:      docker-compose restart
echo 删除服务:      docker-compose down
echo.
echo ✅ 部署完成！
echo.
pause








