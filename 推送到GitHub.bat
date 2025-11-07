@echo off
chcp 65001 >nul
echo ==========================================
echo   推送代码到GitHub - 自动执行脚本
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/6] 检查Git是否安装...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git未安装或未添加到PATH
    echo 请先安装Git: https://git-scm.com/download/win
    echo 安装后需要重启命令行窗口
    pause
    exit /b 1
)
echo ✅ Git已安装

echo.
echo [2/6] 配置Git用户信息（首次使用）...
git config --global user.name "wuwenky0212-creator"
echo 请输入你的GitHub邮箱:
set /p GIT_EMAIL="邮箱: "
git config --global user.email "%GIT_EMAIL%"
echo ✅ Git配置完成

echo.
echo [3/6] 初始化Git仓库...
if exist .git (
    echo Git仓库已存在，跳过初始化
) else (
    git init
    echo ✅ Git仓库初始化完成
)

echo.
echo [4/6] 添加所有文件...
git add .
echo ✅ 文件已添加

echo.
echo [5/6] 提交代码...
git commit -m "初始提交 - 准备部署到Railway"
echo ✅ 代码已提交

echo.
echo [6/6] 添加远程仓库并推送...
git remote remove origin 2>nul
git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git
echo.
echo ⚠️  现在开始推送到GitHub...
echo 如果提示需要登录：
echo - 用户名: wuwenky0212-creator
echo - 密码: 使用GitHub Personal Access Token（不是账号密码）
echo.
echo 生成Token地址: https://github.com/settings/tokens
echo.
pause
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能的原因：
    echo 1. 需要登录GitHub
    echo 2. 需要生成Personal Access Token
    echo 3. GitHub仓库还未创建
    echo.
    echo 请按照提示操作，然后重新运行此脚本
) else (
    echo.
    echo ==========================================
    echo   ✅ 代码已成功推送到GitHub！
    echo ==========================================
    echo.
    echo 下一步：部署到Railway
    echo 1. 访问: https://railway.app
    echo 2. 使用GitHub账号登录
    echo 3. 点击 "New Project" ^> "Deploy from GitHub repo"
    echo 4. 选择仓库: wuwenky0212-creator/pnl-analysis
)

echo.
pause


