#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Check Git installation and push code to GitHub
"""
import subprocess
import os
import sys

def run_command(cmd, shell=True):
    """Execute command and return result"""
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
    """Find Git installation location"""
    possible_paths = [
        r"C:\Program Files\Git\bin\git.exe",
        r"C:\Program Files (x86)\Git\bin\git.exe",
        r"C:\Program Files\Git\cmd\git.exe",
        r"C:\Program Files (x86)\Git\cmd\git.exe",
    ]
    
    success, stdout, _ = run_command("where git", shell=True)
    if success and stdout.strip():
        git_path = stdout.strip().split('\n')[0]
        if os.path.exists(git_path):
            return git_path
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def main():
    print("=" * 50)
    print("Check Git and Push Code to GitHub")
    print("=" * 50)
    print()
    
    print("[1/8] Checking Git installation...")
    git_path = find_git()
    
    if not git_path:
        print("Git not found")
        print()
        print("Please install Git first:")
        print("1. Visit: https://git-scm.com/download/win")
        print("2. Download and install Git for Windows")
        print("3. Select 'Add Git to PATH' during installation")
        print("4. Restart command line after installation")
        print()
        print("Or use GitHub Desktop:")
        print("1. Download: https://desktop.github.com/")
        print("2. Install and login with GitHub account")
        print("3. Add local repository and push")
        input("\nPress Enter to exit...")
        return
    
    print(f"Found Git: {git_path}")
    
    git_cmd = git_path if git_path.endswith('.exe') else 'git'
    
    success, stdout, _ = run_command(f'"{git_cmd}" --version')
    if success:
        print(f"Git version: {stdout.strip()}")
    print()
    
    if not os.path.exists('backend') or not os.path.exists('frontend'):
        print("Not in project root directory")
        print("Please switch to: D:\\workspace\\损益归因分析")
        input("\nPress Enter to exit...")
        return
    
    print("[2/8] Checking Git repository...")
    if os.path.exists('.git'):
        print("Git repository exists")
        success, stdout, _ = run_command(f'"{git_cmd}" remote -v')
        if success and stdout:
            print("Remote repository:")
            print(stdout)
    else:
        print("Initializing Git repository...")
        success, _, stderr = run_command(f'"{git_cmd}" init')
        if success:
            print("Git repository initialized")
        else:
            print(f"Initialization failed: {stderr}")
            input("\nPress Enter to exit...")
            return
    print()
    
    print("[3/8] Configuring Git user info...")
    run_command(f'"{git_cmd}" config --global user.name "wuwenky0212-creator"')
    email = input("Enter GitHub email (press Enter for default): ").strip()
    if not email:
        email = "wuwenky0212-creator@users.noreply.github.com"
    run_command(f'"{git_cmd}" config --global user.email "{email}"')
    print("Git configuration completed")
    print()
    
    print("[4/8] Checking .gitignore file...")
    if not os.path.exists('.gitignore'):
        print("Creating .gitignore file...")
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
        print(".gitignore created")
    else:
        print(".gitignore exists")
    print()
    
    print("[5/8] Adding all files to Git...")
    success, stdout, stderr = run_command(f'"{git_cmd}" add .')
    if success:
        print("Files added")
        success, stdout, _ = run_command(f'"{git_cmd}" status --short')
        if stdout.strip():
            print("Files to commit:")
            print(stdout)
    else:
        print(f"Warning: {stderr}")
    print()
    
    print("[6/8] Committing code...")
    success, stdout, stderr = run_command(f'"{git_cmd}" commit -m "Initial commit - PnL Analysis System"')
    if success:
        print("Code committed")
    else:
        if "nothing to commit" in stderr.lower():
            print("No new changes to commit")
        else:
            print(f"Warning: {stderr}")
    print()
    
    print("[7/8] Configuring remote repository...")
    run_command(f'"{git_cmd}" remote remove origin')
    success, _, stderr = run_command(f'"{git_cmd}" remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git')
    if success:
        print("Remote repository configured")
    else:
        print(f"Warning: {stderr}")
    
    run_command(f'"{git_cmd}" branch -M main')
    print()
    
    print("[8/8] Pushing to GitHub...")
    print()
    print("Push requires GitHub authentication")
    print()
    print("If prompted for login:")
    print("1. Username: wuwenky0212-creator")
    print("2. Password: Use GitHub Personal Access Token")
    print()
    print("Generate Token:")
    print("1. Visit: https://github.com/settings/tokens")
    print("2. Click 'Generate new token (classic)'")
    print("3. Check 'repo' permission")
    print("4. Generate and copy Token")
    print("5. Use Token as password when pushing")
    print()
    input("Press Enter to start pushing...")
    
    print()
    print("Pushing...")
    success, stdout, stderr = run_command(f'"{git_cmd}" push -u origin main')
    
    if success:
        print()
        print("=" * 50)
        print("Code successfully pushed to GitHub!")
        print("=" * 50)
        print()
        print("Verify: https://github.com/wuwenky0212-creator/pnl-analysis")
        print("Next: Go back to Railway, refresh, and select repository")
    else:
        print()
        print("=" * 50)
        print("Push failed")
        print("=" * 50)
        print()
        print("Error:")
        print(stderr)
        print()
        print("Possible reasons:")
        print("1. Need GitHub authentication (use Personal Access Token)")
        print("2. Repository not created or wrong name")
        print("3. Network connection issue")
        print()
        print("Solutions:")
        print("1. Check repository: https://github.com/wuwenky0212-creator/pnl-analysis")
        print("2. Generate Token: https://github.com/settings/tokens")
        print("3. Re-run this script")
        print()
        print("Or use GitHub Desktop:")
        print("https://desktop.github.com/")
    
    print()
    input("Press Enter to exit...")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")

