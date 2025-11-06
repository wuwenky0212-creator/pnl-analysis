# 🚂 Railway部署详细步骤 - 针对你的账号

## 📋 你的信息
- **GitHub账号**: wuwenky0212-creator
- **项目目录**: `d:\workspace\损益归因分析`

---

## 🚀 第一步：准备GitHub仓库

### 步骤1.1：在GitHub创建仓库

1. **打开浏览器**，访问：https://github.com/new
2. **填写仓库信息**：
   - Repository name: `损益归因分析` （或 `pnl-analysis`）
   - Description: 金融市场业务管理系统 - 损益归因分析
   - 选择：**Public**（公开，这样所有人都能访问）
   - 不要勾选 "Initialize this repository with a README"（因为本地已有代码）
3. 点击 **"Create repository"**

### 步骤1.2：在本地项目目录执行命令

**重要**：在项目目录 `d:\workspace\损益归因分析` 执行以下命令

打开 **PowerShell** 或 **CMD**，执行：

```powershell
# 1. 进入项目目录（如果还没在）
cd d:\workspace\损益归因分析

# 2. 检查Git状态（如果还没初始化）
git status

# 3. 如果显示"fatal: not a git repository"，执行：
git init

# 4. 添加所有文件
git add .

# 5. 提交代码
git commit -m "初始提交 - 准备部署到Railway"

# 6. 添加远程仓库（替换为你的GitHub用户名）
git remote add origin https://github.com/wuwenky0212-creator/损益归因分析.git

# 7. 如果远程仓库已存在，先删除再添加
git remote remove origin
git remote add origin https://github.com/wuwenky0212-creator/损益归因分析.git

# 8. 推送到GitHub
git branch -M main
git push -u origin main
```

**注意**：如果仓库名包含中文，GitHub可能会自动转换，使用英文名称更保险：
```powershell
git remote add origin https://github.com/wuwenky0212-creator/pnl-analysis.git
```

---

## 🚂 第二步：部署到Railway

### 步骤2.1：注册Railway账号

1. **打开浏览器**，访问：https://railway.app
2. 点击 **"Start a New Project"** 或 **"Login"**
3. 选择 **"Login with GitHub"**
4. 授权Railway访问你的GitHub账号
5. 登录成功！

### 步骤2.2：创建新项目

1. 在Railway控制台，点击 **"New Project"** 按钮
2. 选择 **"Deploy from GitHub repo"**
3. 在列表中找到你的仓库：
   - 如果仓库名是 `损益归因分析`，会显示在列表中
   - 如果找不到，点击 "Configure GitHub App" 授权更多权限
4. **点击你的仓库名称**

### 步骤2.3：等待部署

Railway会自动：
- ✅ 检测到Dockerfile
- ✅ 开始构建Docker镜像
- ✅ 部署应用

**等待时间**：大约2-5分钟

### 步骤2.4：配置环境变量

部署开始后，立即配置环境变量：

1. 在Railway服务页面，点击服务名称（例如：`web`）
2. 选择 **"Variables"** 标签
3. 点击 **"New Variable"**，逐个添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PORT` | `8002` | 端口号 |
| `HOST` | `0.0.0.0` | 监听地址 |
| `DEBUG` | `False` | 关闭调试模式 |
| `DATA_FORMAT` | `mock` | 使用模拟数据 |
| `DEFAULT_CURRENCY` | `CNY` | 默认货币 |
| `DEFAULT_UNIT` | `万元` | 默认单位 |

4. 每个变量添加后点击 **"Add"**
5. 添加完成后，Railway会自动重新部署

### 步骤2.5：获取后端URL

1. 在服务设置页面，点击 **"Settings"** 标签
2. 向下滚动找到 **"Domains"** 部分
3. 点击 **"Generate Domain"** 按钮
4. Railway会生成一个域名，例如：
   - `https://fx-attribution-production.up.railway.app`
   - 或 `https://your-app-name.railway.app`
5. **复制这个URL**，后面会用到！

✅ **后端部署完成！**

---

## 🎨 第三步：部署前端

### 方法A：在Railway部署前端（推荐，简单）

1. 在Railway项目中，点击 **"New"** 按钮
2. 选择 **"Empty Service"**
3. 配置：
   - **Source**: 选择同一个GitHub仓库
   - **Root Directory**: 输入 `frontend`
   - **Start Command**: （留空）
4. 点击 **"Deploy"**
5. 等待部署完成
6. 在服务设置中生成前端域名

### 方法B：使用Vercel部署前端（推荐，更快）

1. **访问Vercel**：https://vercel.com
2. 使用GitHub账号登录
3. 点击 **"Add New Project"**
4. 导入你的GitHub仓库
5. 配置：
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: （留空）
   - **Output Directory**: `.`
6. 在 **"Environment Variables"** 中添加：
   ```
   API_URL=https://你的后端URL.railway.app/api
   ```
   （替换为步骤2.5中复制的后端URL）
7. 点击 **"Deploy"**
8. 等待部署完成，获取前端URL

---

## 🔧 第四步：配置前端API地址

### 如果使用Railway部署前端

修改 `frontend/index.html`，在 `<head>` 标签中：

```html
<meta name="backend-url" content="https://你的后端URL.railway.app">
```

例如：
```html
<meta name="backend-url" content="https://fx-attribution-production.up.railway.app">
```

### 如果使用Vercel部署前端

不需要修改代码，Vercel会自动使用环境变量。

---

## 📝 第五步：提交更新

如果修改了 `frontend/index.html`：

```powershell
# 在项目目录执行
cd d:\workspace\损益归因分析

git add frontend/index.html
git commit -m "配置后端API地址"
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
2. 按F12打开开发者工具
3. 查看Network标签，确认API请求成功
4. 如果能正常加载数据，说明部署成功！

---

## 📋 快速命令参考

### 在项目目录执行（PowerShell）

```powershell
# 进入项目目录
cd d:\workspace\损益归因分析

# 查看Git状态
git status

# 添加文件
git add .

# 提交
git commit -m "更新内容"

# 推送到GitHub
git push

# Railway会自动重新部署
```

---

## ❓ 常见问题

### Q: 仓库名包含中文，GitHub报错？
A: 使用英文仓库名，例如：`pnl-analysis`

### Q: git push 失败，提示需要认证？
A: 使用GitHub Personal Access Token：
1. GitHub Settings > Developer settings > Personal access tokens
2. 生成新token（勾选repo权限）
3. 使用token作为密码

### Q: Railway部署失败？
A: 查看Railway日志：
1. 在Railway控制台选择服务
2. 点击 "Deployments"
3. 查看日志找出问题

### Q: 前端无法连接后端？
A: 检查：
1. 后端URL是否正确
2. `frontend/index.html` 中的meta标签是否正确
3. 浏览器控制台是否有CORS错误

---

## 🎯 下一步

1. ✅ 部署完成后，分享前端URL给任何人
2. ✅ 可以绑定自定义域名（在Railway设置中）
3. ✅ 更新代码后，git push会自动重新部署

---

**按照以上步骤，你的应用就可以被全世界访问了！** 🌍✨

