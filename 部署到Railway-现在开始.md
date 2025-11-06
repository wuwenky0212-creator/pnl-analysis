# 🚂 部署到Railway - 现在开始！

## ✅ 已完成
- GitHub仓库已创建 ✅
- 代码已推送到GitHub ✅

## 🚀 下一步：部署到Railway

### 步骤1：访问Railway并登录（2分钟）

1. **打开浏览器**，访问：https://railway.app
2. 点击 **"Start a New Project"** 或 **"Login"**
3. 选择 **"Login with GitHub"**
4. 授权Railway访问你的GitHub账号
5. 登录成功！

### 步骤2：部署后端（5分钟）

1. **在Railway控制台**，点击 **"New Project"** 按钮（右上角绿色按钮）
2. 选择 **"Deploy from GitHub repo"**
3. 在仓库列表中找到：`wuwenky0212-creator/pnl-analysis`
   - 如果看不到，点击 "Configure GitHub App" 授权更多权限
4. **点击仓库名称**

### 步骤3：等待部署（2-5分钟）

Railway会自动：
- ✅ 检测Dockerfile
- ✅ 开始构建Docker镜像（可以看到构建日志）
- ✅ 部署应用

**等待构建完成**（显示 "Deployed successfully"）

### 步骤4：配置环境变量（2分钟）

部署开始后，立即配置：

1. **在Railway服务页面**，点击服务名称（通常显示为 `web`）
2. 选择 **"Variables"** 标签
3. 点击 **"+ New Variable"**，逐个添加以下变量：

| 变量名 | 值 | 
|--------|-----|
| `PORT` | `8002` |
| `HOST` | `0.0.0.0` |
| `DEBUG` | `False` |
| `DATA_FORMAT` | `mock` |
| `DEFAULT_CURRENCY` | `CNY` |
| `DEFAULT_UNIT` | `万元` |

4. 每个变量添加后，Railway会自动重新部署

### 步骤5：获取后端URL（1分钟）

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

## 🎨 步骤6：部署前端（5分钟）

### 方法A：在Railway部署前端（推荐，简单）

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
   （替换为步骤5中复制的后端URL）
7. 点击 **"Deploy"**
8. 等待完成，获取前端URL

---

## 🔧 步骤7：配置前端API地址（如果使用Railway部署前端）

如果使用Railway部署前端，需要修改前端代码：

1. **修改** `frontend/index.html`，在 `<head>` 标签中找到：
   ```html
   <!-- <meta name="backend-url" content="https://your-backend.railway.app"> -->
   ```

2. **取消注释并修改**为你的后端URL：
   ```html
   <meta name="backend-url" content="https://你的后端URL.railway.app">
   ```

3. **提交并推送**：
   ```powershell
   git add frontend/index.html
   git commit -m "配置后端API地址"
   git push
   ```

Railway会自动重新部署！

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

## 📋 检查清单

- [ ] 已访问Railway并登录
- [ ] 已创建新项目并选择GitHub仓库
- [ ] 后端正在部署（等待完成）
- [ ] 已配置环境变量
- [ ] 已生成后端域名
- [ ] 已部署前端（Railway或Vercel）
- [ ] 已配置前端API地址
- [ ] 测试访问成功

---

**现在开始部署到Railway吧！访问 https://railway.app** 🚂

