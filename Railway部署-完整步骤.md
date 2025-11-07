# 🚂 Railway部署完整步骤 - wuwenky0212-creator

## 📋 你的信息
- **GitHub账号**: wuwenky0212-creator
- **项目位置**: `d:\workspace\损益归因分析`

---

## ⚠️ 第一步：安装Git（如果还没安装）

### 检查是否已安装Git

打开 **PowerShell**，执行：
```powershell
git --version
```

### 如果显示"无法识别"，需要安装Git

1. **下载Git**：
   - 访问：https://git-scm.com/download/win
   - 下载并安装（全部默认选项即可）

2. **安装完成后**，重新打开PowerShell

3. **配置Git**（首次使用）：
   ```powershell
   git config --global user.name "wuwenky0212-creator"
   git config --global user.email "你的邮箱@example.com"
   ```

---

## 🚀 第二步：准备GitHub仓库

### 步骤1：在GitHub创建仓库

1. **打开浏览器**，访问：https://github.com/new
2. **填写信息**：
   - Repository name: `pnl-analysis` （建议用英文，避免路径问题）
   - Description: 金融市场业务管理系统 - 损益归因分析
   - 选择：**Public**（公开）
   - **不要勾选** "Initialize this repository with a README"
   - **不要勾选** "Add .gitignore"
   - **不要勾选** "Choose a license"
3. 点击 **"Create repository"**

### 步骤2：在本地执行命令

**重要**：在项目目录执行，打开 **PowerShell** 或 **CMD**

```powershell
# 1. 进入项目目录（如果路径有中文，使用这种方式）
cd "d:\workspace\损益归因分析"

# 或者使用相对路径（如果你已经在工作区）
# cd .

# 2. 初始化Git（如果还没初始化）
git init

# 3. 检查状态
git status

# 4. 添加所有文件
git add .

# 5. 提交代码
git commit -m "初始提交 - 准备部署到Railway"

# 6. 添加远程仓库
git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git

# 如果提示"remote origin already exists"，执行：
# git remote remove origin
# git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git

# 7. 推送到GitHub
git branch -M main
git push -u origin main
```

**如果git push需要登录**：
- 用户名：`wuwenky0212-creator`
- 密码：使用GitHub Personal Access Token（不是账号密码）

**如何生成Token**：
1. GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. 点击 "Generate new token"
3. 勾选 `repo` 权限
4. 生成后复制token（只显示一次，要保存好）
5. 使用token作为密码

---

## 🚂 第三步：部署到Railway

### 步骤1：注册Railway

1. **打开浏览器**，访问：https://railway.app
2. 点击 **"Start a New Project"** 或 **"Login"**
3. 选择 **"Login with GitHub"**
4. 授权Railway访问你的GitHub账号
5. 登录成功！

### 步骤2：部署后端

1. 在Railway控制台，点击 **"New Project"** 按钮（绿色按钮）
2. 选择 **"Deploy from GitHub repo"**
3. 在仓库列表中找到 `wuwenky0212-creator/pnl-analysis`
   - 如果看不到，点击 "Configure GitHub App" 授权权限
4. **点击仓库名称**

### 步骤3：等待部署

Railway会自动：
- ✅ 检测Dockerfile
- ✅ 开始构建（显示构建日志）
- ✅ 部署应用

**等待时间**：2-5分钟

### 步骤4：配置环境变量

部署开始后（或完成后），配置环境变量：

1. 在Railway服务页面，点击服务名称（通常显示为 `web` 或你的仓库名）
2. 选择 **"Variables"** 标签
3. 点击 **"+ New Variable"**，添加以下变量：

```
PORT = 8002
HOST = 0.0.0.0
DEBUG = False
DATA_FORMAT = mock
DEFAULT_CURRENCY = CNY
DEFAULT_UNIT = 万元
```

4. 每个变量添加后，Railway会自动重新部署

### 步骤5：获取后端URL

1. 在服务页面，点击 **"Settings"** 标签
2. 向下滚动到 **"Domains"** 部分
3. 点击 **"Generate Domain"** 按钮
4. Railway会生成一个URL，例如：
   ```
   https://pnl-analysis-production.up.railway.app
   ```
5. **复制这个URL**，保存好！

✅ **后端部署完成！**

---

## 🎨 第四步：部署前端

### 方法A：在Railway部署前端（推荐）

1. 在Railway项目中，点击 **"New"** 按钮（右上角）
2. 选择 **"Empty Service"**
3. 配置：
   - **Source**: 选择同一个GitHub仓库 `pnl-analysis`
   - **Root Directory**: 输入 `frontend`
   - **Start Command**: （留空）
4. 点击 **"Deploy"**
5. 等待部署完成
6. 在服务设置中，生成前端域名

### 方法B：使用Vercel部署前端（更快，推荐）

1. **访问Vercel**：https://vercel.com
2. 使用GitHub账号登录
3. 点击 **"Add New Project"**
4. 导入仓库 `wuwenky0212-creator/pnl-analysis`
5. 配置：
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: （留空）
   - **Output Directory**: `.`
6. 在 "Environment Variables" 中添加：
   ```
   API_URL=https://你的后端URL.railway.app/api
   ```
   （替换为步骤3.5中复制的后端URL）
7. 点击 **"Deploy"**
8. 等待完成，获取前端URL

---

## 🔧 第五步：配置前端API地址

### 如果使用Railway部署前端

1. 修改 `frontend/index.html`，在 `<head>` 标签中找到：
   ```html
   <!-- <meta name="backend-url" content="https://your-backend.railway.app"> -->
   ```

2. 取消注释并修改为你的后端URL：
   ```html
   <meta name="backend-url" content="https://你的后端URL.railway.app">
   ```

3. 保存文件

### 如果使用Vercel部署前端

不需要修改代码，Vercel会自动使用环境变量。

---

## 📝 第六步：提交更新

如果修改了 `frontend/index.html`：

```powershell
# 在项目目录执行
cd "d:\workspace\损益归因分析"

# 添加文件
git add frontend/index.html

# 提交
git commit -m "配置后端API地址"

# 推送
git push
```

Railway和Vercel会自动检测并重新部署！

---

## 🎉 完成！

### 访问地址

- **前端页面**: 
  - Railway: https://你的前端URL.railway.app
  - 或 Vercel: https://your-app.vercel.app
- **后端API**: https://你的后端URL.railway.app
- **API文档**: https://你的后端URL.railway.app/docs

### 测试

1. 打开前端URL
2. 按 **F12** 打开开发者工具
3. 查看 **Network** 标签，确认API请求成功
4. 如果页面正常显示数据，说明部署成功！

---

## 📋 完整命令清单（复制执行）

```powershell
# ========== 在项目目录执行 ==========
cd "d:\workspace\损益归因分析"

# 初始化Git（如果还没）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到Railway"

# 添加远程仓库（如果已存在会报错，先删除：git remote remove origin）
git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

---

## ❓ 常见问题

### Q1: git push 提示需要认证？

**解决方案**：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成token并复制
5. git push时，用户名输入 `wuwenky0212-creator`，密码输入token

### Q2: 路径包含中文，cd命令失败？

**解决方案**：
```powershell
# 使用引号
cd "d:\workspace\损益归因分析"

# 或者使用短路径
cd d:\workspace
cd 损益归因分析
```

### Q3: Railway找不到仓库？

**解决方案**：
1. 在Railway控制台，点击 "Configure GitHub App"
2. 授权Railway访问所有仓库或指定仓库
3. 重新选择仓库

### Q4: 部署失败？

**查看日志**：
1. 在Railway控制台选择服务
2. 点击 "Deployments"
3. 选择失败的部署
4. 查看日志找出问题

---

## 🎯 执行顺序

1. ✅ 先安装Git（如果还没安装）
2. ✅ 在GitHub创建仓库
3. ✅ 在本地执行git命令推送代码
4. ✅ 在Railway部署后端
5. ✅ 在Railway或Vercel部署前端
6. ✅ 配置前端API地址
7. ✅ 测试访问

---

**按照以上步骤，你的应用就可以被全世界访问了！** 🌍✨


