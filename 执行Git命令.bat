@echo off
chcp 65001 >nul
echo ==========================================
echo   执行Git命令 - 推送到GitHub
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/7] 检查Git...
where git >nul 2>&1
if errorlevel 1 (
    echo Git未找到，请确保Git已安装并添加到PATH
    pause
    exit /b 1
)
git --version
echo.

echo [2/7] 配置Git用户信息...
git config --global user.name "wuwenky0212-creator"
if not defined GIT_EMAIL (
    set /p GIT_EMAIL="请输入你的GitHub邮箱: "
    git config --global user.email "%GIT_EMAIL%"
)
echo.

echo [3/7] 初始化Git仓库...
if not exist .git (
    git init
    echo Git仓库已初始化
) else (
    echo Git仓库已存在
)
echo.

echo [4/7] 添加所有文件...
git add .
echo 文件已添加
echo.

echo [5/7] 提交代码...
git commit -m "初始提交 - 准备部署到Railway" 2>nul
if errorlevel 1 (
    echo 注意：可能是重复提交，继续执行...
)
echo.

echo [6/7] 配置远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git
git remote -v
echo.

echo [7/7] 推送到GitHub...
echo.
echo ⚠️  接下来需要登录GitHub
echo 用户名: wuwenky0212-creator
echo 密码: 使用Personal Access Token（不是账号密码）
echo.
echo 如果还没有Token，访问: https://github.com/settings/tokens
echo.
pause

git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo 推送可能需要手动输入用户名和Token
    echo 请按照提示操作
) else (
    echo.
    echo ==========================================
    echo   ✅ 代码已成功推送到GitHub！
    echo ==========================================
    echo.
    echo 下一步：访问 https://railway.app 部署应用
)

pause

