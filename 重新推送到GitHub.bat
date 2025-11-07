@echo off
chcp 65001 >nul
echo ==========================================
echo   重新推送代码到GitHub
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/7] 检查Git是否安装...
where git >nul 2>&1
if errorlevel 1 (
    echo ❌ Git未安装或未添加到PATH
    echo.
    echo 请执行以下操作：
    echo 1. 打开Git Bash（如果已安装Git）
    echo 2. 或者安装Git: https://git-scm.com/download/win
    echo 3. 安装后重启命令行窗口
    echo.
    pause
    exit /b 1
)
echo ✅ Git已安装
git --version

echo.
echo [2/7] 检查是否已有Git仓库...
if exist .git (
    echo ✅ Git仓库已存在
    echo 检查远程仓库配置...
    git remote -v
) else (
    echo 初始化Git仓库...
    git init
    echo ✅ Git仓库初始化完成
)

echo.
echo [3/7] 配置Git用户信息...
git config --global user.name "wuwenky0212-creator"
echo.
echo 请输入你的GitHub邮箱（用于提交记录）:
set /p GIT_EMAIL="邮箱: "
if "%GIT_EMAIL%"=="" (
    echo ⚠️  未输入邮箱，使用默认值
    set GIT_EMAIL=wuwenky0212-creator@users.noreply.github.com
)
git config --global user.email "%GIT_EMAIL%"
echo ✅ Git配置完成

echo.
echo [4/7] 检查.gitignore文件...
if not exist .gitignore (
    echo ⚠️  未找到.gitignore，创建默认文件...
    (
        echo __pycache__/
        echo *.pyc
        echo *.pyo
        echo *.pyd
        echo .Python
        echo env/
        echo venv/
        echo .env
        echo .DS_Store
    ) > .gitignore
    echo ✅ .gitignore已创建
) else (
    echo ✅ .gitignore已存在
)

echo.
echo [5/7] 添加所有文件到Git...
git add .
echo ✅ 文件已添加
echo.
echo 查看将要提交的文件:
git status --short

echo.
echo [6/7] 提交代码...
git commit -m "初始提交 - 损益归因分析系统" 2>nul
if errorlevel 1 (
    echo ⚠️  没有新的更改需要提交，或已有提交
) else (
    echo ✅ 代码已提交
)

echo.
echo [7/7] 配置远程仓库并推送...
git remote remove origin 2>nul
git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git
echo ✅ 远程仓库已配置
echo.
echo 当前分支:
git branch

echo.
echo ==========================================
echo   ⚠️  准备推送到GitHub
echo ==========================================
echo.
echo 推送过程中需要认证：
echo.
echo 方法1: 使用GitHub Personal Access Token（推荐）
echo   1. 访问: https://github.com/settings/tokens
echo   2. 点击 "Generate new token (classic)"
echo   3. 勾选 "repo" 权限
echo   4. 生成后复制Token
echo   5. 推送时，用户名输入: wuwenky0212-creator
echo   6. 密码输入: 粘贴Token（不是账号密码）
echo.
echo 方法2: 使用GitHub Desktop（更简单）
echo   1. 下载: https://desktop.github.com/
echo   2. 使用GitHub Desktop推送
echo.
echo ==========================================
echo.
pause

echo.
echo 设置主分支为main...
git branch -M main 2>nul || echo 分支已存在

echo.
echo 开始推送到GitHub...
echo 如果需要登录，请按照上面的提示操作
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ==========================================
    echo   ❌ 推送失败！
    echo ==========================================
    echo.
    echo 可能的原因：
    echo 1. 需要登录GitHub（使用Personal Access Token）
    echo 2. GitHub仓库还未创建或名称错误
    echo 3. 网络连接问题
    echo.
    echo 解决方法：
    echo 1. 检查仓库是否存在: https://github.com/wuwenky0212-creator/pnl-analysis
    echo 2. 生成Token: https://github.com/settings/tokens
    echo 3. 重新运行此脚本
    echo.
    echo 或者使用GitHub Desktop：
    echo https://desktop.github.com/
    echo.
) else (
    echo.
    echo ==========================================
    echo   ✅ 代码已成功推送到GitHub！
    echo ==========================================
    echo.
    echo 验证：访问 https://github.com/wuwenky0212-creator/pnl-analysis
    echo 应该能看到你的代码文件
    echo.
    echo 下一步：回到Railway，刷新页面，再次选择仓库
    echo.
)

echo.
pause


