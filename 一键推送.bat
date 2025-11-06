@echo off
chcp 65001 >nul
title 推送到GitHub
color 0A

echo.
echo ==========================================
echo   推送到GitHub - 自动执行
echo ==========================================
echo.
echo GitHub账号: wuwenky0212-creator
echo 仓库名: pnl-analysis
echo.
pause

cd /d "%~dp0"
echo 当前目录: %CD%
echo.

echo [1/6] 检查Git...
git --version
if errorlevel 1 (
    echo [错误] Git未安装或未添加到PATH
    echo 请先安装Git: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo [OK] Git已安装
echo.

echo [2/6] 配置Git用户信息...
git config --global user.name "wuwenky0212-creator"
echo 请输入你的GitHub邮箱（用于Git配置）:
set /p GIT_EMAIL="邮箱: "
git config --global user.email "%GIT_EMAIL%"
echo [OK] Git配置完成
echo.

echo [3/6] 初始化Git仓库...
if not exist .git (
    call git init
    echo [OK] Git仓库已初始化
) else (
    echo [OK] Git仓库已存在
)
echo.

echo [4/6] 添加所有文件...
call git add .
echo [OK] 文件已添加
echo.

echo [5/6] 提交代码...
call git commit -m "初始提交 - 准备部署到Railway"
if errorlevel 1 (
    echo [提示] 可能是重复提交或无变更，继续执行...
)
echo [OK] 代码已提交
echo.

echo [6/6] 配置远程仓库...
call git remote remove origin 2>nul
call git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git
call git remote -v
echo [OK] 远程仓库已配置
echo.

echo ==========================================
echo   开始推送到GitHub
echo ==========================================
echo.
echo ⚠️  需要登录GitHub
echo.
echo 用户名: wuwenky0212-creator
echo 密码: 使用Personal Access Token
echo.
echo 如果还没有Token:
echo 1. 访问: https://github.com/settings/tokens
echo 2. 点击 "Generate new token (classic)"
echo 3. 勾选 repo 权限
echo 4. 生成并复制token
echo.
echo 准备好后按任意键继续...
pause
echo.

call git branch -M main
call git push -u origin main

if errorlevel 1 (
    echo.
    echo ==========================================
    echo   [错误] 推送失败
    echo ==========================================
    echo.
    echo 可能的原因：
    echo 1. 需要输入用户名和Token
    echo 2. Token已过期
    echo 3. GitHub仓库还未创建
    echo.
    echo 请检查并重试
) else (
    echo.
    echo ==========================================
    echo   ✅ 代码已成功推送到GitHub！
    echo ==========================================
    echo.
    echo 下一步：部署到Railway
    echo 1. 访问: https://railway.app
    echo 2. 使用GitHub账号登录
    echo 3. 点击 "New Project"
    echo 4. 选择 "Deploy from GitHub repo"
    echo 5. 选择仓库: wuwenky0212-creator/pnl-analysis
    echo.
)

echo.
pause

