# 🚂 部署到Railway - 让所有人都能访问

## 📋 Railway简介

Railway是一个现代化的部署平台，可以：
- ✅ 一键部署全栈应用
- ✅ 自动配置HTTPS
- ✅ 提供公网访问链接
- ✅ 免费额度：$5/月（通常足够使用）
- ✅ 支持自定义域名

## 🚀 快速部署步骤

### 步骤1：准备GitHub仓库

```bash
# 1. 初始化Git仓库（如果还没有）
git init
git add .
git commit -m "准备部署到Railway"

# 2. 在GitHub创建新仓库
# 访问 https://github.com/new
# 创建名为 "损益归因分析" 的仓库

# 3. 推送代码到GitHub
git remote add origin https://github.com/你的用户名/损益归因分析.git
git branch -M main
git push -u origin main
```

### 步骤2：注册Railway账号

1. 访问：https://railway.app
2. 点击 "Start a New Project"
3. 选择 "Login with GitHub"
4. 授权Railway访问你的GitHub账号

### 步骤3：部署后端

1. 在Railway控制台点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择你的仓库："损益归因分析"
4. Railway会自动检测到Dockerfile并开始构建

5. **配置环境变量**（在服务设置中）：
   - 点击服务名称进入设置
   - 选择 "Variables" 标签
   - 添加以下变量：
     ```
     PORT=8002
     HOST=0.0.0.0
     DEBUG=False
     DATA_FORMAT=mock
     DEFAULT_CURRENCY=CNY
     DEFAULT_UNIT=万元
     ```

6. **等待部署完成**
   - Railway会自动构建Docker镜像
   - 部署完成后会显示 "Deployed successfully"

7. **获取后端URL**：
   - 在服务页面，点击 "Settings"
   - 找到 "Domains" 部分
   - 点击 "Generate Domain" 生成公网域名
   - 例如：`https://your-app-backend.railway.app`
   - **复制这个URL，后面会用到**

### 步骤4：部署前端（选项A - 使用Railway静态站点）

1. 在Railway项目中点击 "New"
2. 选择 "Empty Service"
3. 在服务设置中：
   - 选择 "Settings" > "Source"
   - 将 "Root Directory" 设置为 `frontend`
   - 将 "Start Command" 留空（静态文件）
4. 或者使用Nginx配置（见下方）

### 步骤4：部署前端（选项B - 使用Vercel，推荐）

1. 访问：https://vercel.com
2. 使用GitHub账号登录
3. 点击 "Add New Project"
4. 导入你的GitHub仓库
5. 配置：
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: （留空）
   - **Output Directory**: `.`
6. 在 "Environment Variables" 中添加：
   ```
   API_URL=https://your-app-backend.railway.app/api
   ```
7. 点击 "Deploy"
8. Vercel会提供公网URL，例如：`https://your-app.vercel.app`

### 步骤5：配置前端使用后端API

#### 方法1：修改前端代码（如果使用Vercel）

在 `frontend/index.html` 的 `<head>` 中添加：

```html
<meta name="backend-url" content="https://your-app-backend.railway.app">
```

#### 方法2：修改API配置文件

编辑 `frontend/js/api.js`，在文件开头添加：

```javascript
// 如果部署到Railway，使用后端URL
const BACKEND_URL = 'https://your-app-backend.railway.app';
const API_BASE_URL = BACKEND_URL + '/api';
```

## 🎯 完整部署脚本

我为你创建了一个自动化脚本，可以一键部署：

```bash
# 使用Railway CLI（可选）
npm install -g @railway/cli
railway login
railway init
railway up
```

## 📝 配置说明

### Railway自动配置

Railway会自动：
- ✅ 检测Dockerfile并构建镜像
- ✅ 分配公网域名
- ✅ 配置HTTPS（自动SSL证书）
- ✅ 设置环境变量
- ✅ 健康检查

### 环境变量

Railway会自动提供：
- `PORT` - Railway分配的端口（使用 `$PORT` 环境变量）
- `RAILWAY_ENVIRONMENT` - 环境名称

你需要手动设置：
- `HOST=0.0.0.0`
- `DEBUG=False`
- `DATA_FORMAT=mock`

## 🔧 修改Dockerfile以适配Railway

Railway使用动态端口，需要修改启动命令：

```dockerfile
# 在Dockerfile最后，使用环境变量PORT
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8002} --workers 4
```

或者使用 `railway.json` 配置文件（已创建）。

## 🌐 访问你的应用

部署完成后：
- **后端API**: https://your-app-backend.railway.app
- **API文档**: https://your-app-backend.railway.app/docs
- **前端页面**: https://your-app.vercel.app（如果使用Vercel）

## 💰 费用说明

### Railway免费额度
- **$5/月免费额度**
- 通常足够个人项目使用
- 超出后按使用量付费

### 升级建议
- 如果访问量不大，免费额度足够
- 如果需要更多资源，可以升级到付费计划

## 🔒 自定义域名

### 在Railway中配置
1. 在服务设置中选择 "Domains"
2. 点击 "Custom Domain"
3. 输入你的域名
4. 按照提示配置DNS记录
5. Railway会自动配置SSL证书

### DNS配置
添加CNAME记录：
```
类型: CNAME
名称: @ 或 www
值: your-app.railway.app
```

## 📊 监控和日志

### 查看日志
1. 在Railway控制台选择服务
2. 点击 "Deployments"
3. 选择最近的部署
4. 查看实时日志

### 监控指标
- CPU使用率
- 内存使用率
- 网络流量
- 请求数量

## 🚀 更新部署

```bash
# 1. 修改代码
# 2. 提交到GitHub
git add .
git commit -m "更新功能"
git push

# 3. Railway会自动检测并重新部署
# 或者手动触发：
# 在Railway控制台点击 "Redeploy"
```

## 🔄 回滚

如果部署出现问题：
1. 在Railway控制台选择服务
2. 点击 "Deployments"
3. 选择之前的部署
4. 点击 "Redeploy"

## ❓ 常见问题

### Q: 如何查看后端日志？
A: 在Railway控制台 > 服务 > Deployments > 选择部署 > 查看日志

### Q: 如何重启服务？
A: 在服务设置中点击 "Restart"

### Q: 如何修改环境变量？
A: 在服务设置 > Variables 中修改

### Q: 免费额度用完了怎么办？
A: 可以升级到付费计划，或者使用其他免费平台（Render、Fly.io）

## 📚 相关资源

- Railway官方文档：https://docs.railway.app
- Railway定价：https://railway.app/pricing
- Railway社区：https://discord.gg/railway

---

**部署完成后，你的应用就可以被全世界访问了！** 🌍


