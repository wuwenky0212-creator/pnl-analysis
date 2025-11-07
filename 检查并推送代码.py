#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
检查Git安装并推送代码到GitHub
"""
import subprocess
import os
import sys

def run_command(cmd, shell=True):
    """执行命令并返回结果"""
    try:
        result = subprocess.run(
            cmd,
            shell=shell,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def find_git():
    """查找Git安装位置"""
    # 常见的Git安装路径
    possible_paths = [
        r"C:\Program Files\Git\bin\git.exe",
        r"C:\Program Files (x86)\Git\bin\git.exe",
        r"C:\Program Files\Git\cmd\git.exe",
        r"C:\Program Files (x86)\Git\cmd\git.exe",
    ]
    
    # 检查PATH中的git
    success, stdout, _ = run_command("where git", shell=True)
    if success and stdout.strip():
        git_path = stdout.strip().split('\n')[0]
        if os.path.exists(git_path):
            return git_path
    
    # 检查常见路径
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def main():
    print("=" * 50)
    print("检查Git安装并推送代码到GitHub")
    print("=" * 50)
    print()
    
    # 查找Git
    print("[1/8] 检查Git安装...")
    git_path = find_git()
    
    if not git_path:
        print("❌ 未找到Git安装")
        print()
        print("请先安装Git:")
        print("1. 访问: https://git-scm.com/download/win")
        print("2. 下载并安装Git for Windows")
        print("3. 安装时选择 'Add Git to PATH'")
        print("4. 安装完成后，重启命令行窗口")
        print("5. 重新运行此脚本")
        print()
        print("或者使用GitHub Desktop:")
        print("1. 下载: https://desktop.github.com/")
        print("2. 安装并登录GitHub账号")
        print("3. 添加本地仓库并推送")
        input("\n按Enter键退出...")
        return
    
    print(f"✅ 找到Git: {git_path}")
    
    # 使用git命令
    git_cmd = git_path if git_path.endswith('.exe') else 'git'
    
    # 检查版本
    success, stdout, _ = run_command(f'"{git_cmd}" --version')
    if success:
        print(f"Git版本: {stdout.strip()}")
    print()
    
    # 检查是否在项目目录
    if not os.path.exists('backend') or not os.path.exists('frontend'):
        print("❌ 当前目录不是项目根目录")
        print("请切换到项目目录: D:\\workspace\\损益归因分析")
        input("\n按Enter键退出...")
        return
    
    # 检查.git目录
    print("[2/8] 检查Git仓库...")
    if os.path.exists('.git'):
        print("✅ Git仓库已存在")
        success, stdout, _ = run_command(f'"{git_cmd}" remote -v')
        if success and stdout:
            print("远程仓库配置:")
            print(stdout)
    else:
        print("初始化Git仓库...")
        success, _, stderr = run_command(f'"{git_cmd}" init')
        if success:
            print("✅ Git仓库初始化完成")
        else:
            print(f"❌ 初始化失败: {stderr}")
            input("\n按Enter键退出...")
            return
    print()
    
    # 配置用户信息
    print("[3/8] 配置Git用户信息...")
    success, _, _ = run_command(f'"{git_cmd}" config --global user.name "wuwenky0212-creator"')
    email = input("请输入GitHub邮箱（用于提交记录，直接回车使用默认）: ").strip()
    if not email:
        email = "wuwenky0212-creator@users.noreply.github.com"
    success, _, _ = run_command(f'"{git_cmd}" config --global user.email "{email}"')
    print("✅ Git配置完成")
    print()
    
    # 检查.gitignore
    print("[4/8] 检查.gitignore文件...")
    if not os.path.exists('.gitignore'):
        print("创建.gitignore文件...")
        gitignore_content = """__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.env
.DS_Store
"""
        with open('.gitignore', 'w', encoding='utf-8') as f:
            f.write(gitignore_content)
        print("✅ .gitignore已创建")
    else:
        print("✅ .gitignore已存在")
    print()
    
    # 添加文件
    print("[5/8] 添加所有文件到Git...")
    success, stdout, stderr = run_command(f'"{git_cmd}" add .')
    if success:
        print("✅ 文件已添加")
        # 显示状态
        success, stdout, _ = run_command(f'"{git_cmd}" status --short')
        if stdout.strip():
            print("将要提交的文件:")
            print(stdout)
    else:
        print(f"⚠️  添加文件时出现问题: {stderr}")
    print()
    
    # 提交
    print("[6/8] 提交代码...")
    success, stdout, stderr = run_command(f'"{git_cmd}" commit -m "初始提交 - 损益归因分析系统"')
    if success:
        print("✅ 代码已提交")
    else:
        if "nothing to commit" in stderr.lower() or "无文件要提交" in stderr.lower():
            print("ℹ️  没有新的更改需要提交（可能已有提交）")
        else:
            print(f"⚠️  提交时出现问题: {stderr}")
    print()
    
    # 配置远程仓库
    print("[7/8] 配置远程仓库...")
    # 先删除旧的remote（如果存在）
    run_command(f'"{git_cmd}" remote remove origin')
    success, _, stderr = run_command(f'"{git_cmd}" remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git')
    if success:
        print("✅ 远程仓库已配置")
    else:
        print(f"⚠️  配置远程仓库时出现问题: {stderr}")
    
    # 设置主分支
    run_command(f'"{git_cmd}" branch -M main')
    print()
    
    # 推送
    print("[8/8] 推送到GitHub...")
    print()
    print("⚠️  推送需要GitHub认证")
    print()
    print("如果提示需要登录：")
    print("1. 用户名: wuwenky0212-creator")
    print("2. 密码: 使用GitHub Personal Access Token")
    print()
    print("生成Token:")
    print("1. 访问: https://github.com/settings/tokens")
    print("2. 点击 'Generate new token (classic)'")
    print("3. 勾选 'repo' 权限")
    print("4. 生成后复制Token")
    print("5. 推送时，密码输入: 粘贴Token（不是账号密码）")
    print()
    input("准备好后，按Enter键开始推送...")
    
    print()
    print("正在推送...")
    success, stdout, stderr = run_command(f'"{git_cmd}" push -u origin main')
    
    if success:
        print()
        print("=" * 50)
        print("✅ 代码已成功推送到GitHub！")
        print("=" * 50)
        print()
        print("验证：访问 https://github.com/wuwenky0212-creator/pnl-analysis")
        print("应该能看到你的代码文件")
        print()
        print("下一步：回到Railway，刷新页面，再次选择仓库")
    else:
        print()
        print("=" * 50)
        print("❌ 推送失败")
        print("=" * 50)
        print()
        print("错误信息:")
        print(stderr)
        print()
        print("可能的原因：")
        print("1. 需要GitHub认证（使用Personal Access Token）")
        print("2. GitHub仓库还未创建或名称错误")
        print("3. 网络连接问题")
        print()
        print("解决方法：")
        print("1. 检查仓库是否存在: https://github.com/wuwenky0212-creator/pnl-analysis")
        print("2. 生成Token: https://github.com/settings/tokens")
        print("3. 重新运行此脚本")
        print()
        print("或者使用GitHub Desktop:")
        print("https://desktop.github.com/")
    
    print()
    input("按Enter键退出...")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n操作已取消")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        input("\n按Enter键退出...")


