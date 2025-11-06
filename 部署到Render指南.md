# 🎨 部署到Render - 完全免费方案

## 📋 Render简介

Render是一个全栈部署平台：
- ✅ 免费套餐可用（有限制）
- ✅ 自动HTTPS
- ✅ 支持Docker
- ✅ 自动部署（Git推送自动部署）

## 🚀 快速部署

### 步骤1：准备GitHub仓库

```bash
git init
git add .
git commit -m "准备部署到Render"
git remote add origin https://github.com/你的用户名/损益归因分析.git
git push -u origin main
```

### 步骤2：部署后端

1. 访问：https://render.com
2. 注册账号（使用GitHub）
3. 点击 "New +" > "Web Service"
4. 连接你的GitHub仓库
5. 配置：
   - **Name**: fx-attribution-backend
   - **Environment**: Docker
   - **Dockerfile Path**: `Dockerfile`
   - **Plan**: Free（或Starter）
6. 环境变量：
   ```
   PORT=8002
   HOST=0.0.0.0
   DEBUG=False
   DATA_FORMAT=mock
   ```
7. 点击 "Create Web Service"
8. 等待部署完成，获取后端URL

### 步骤3：部署前端

1. 在Render控制台点击 "New +" > "Static Site"
2. 连接GitHub仓库
3. 配置：
   - **Name**: fx-attribution-frontend
   - **Build Command**: （留空）
   - **Publish Directory**: `frontend`
   - **Plan**: Free
4. 环境变量：
   ```
   API_URL=https://你的后端URL.onrender.com/api
   ```
5. 点击 "Create Static Site"
6. 等待部署完成

## 📝 使用render.yaml（推荐）

我已经为你创建了 `render.yaml` 文件，可以直接使用：

1. 在Render控制台点击 "New +" > "Blueprint"
2. 连接GitHub仓库
3. Render会自动读取 `render.yaml` 并部署

## ⚠️ Render免费套餐限制

- **服务会在15分钟无活动后休眠**
- **唤醒需要几秒钟**
- **每月有使用时间限制**

## 🔧 解决休眠问题

### 方案1：升级到Starter计划（$7/月）
- 服务不会休眠

### 方案2：使用免费监控服务
- 定期ping你的服务，保持活跃

### 方案3：使用其他平台
- Railway（推荐，$5/月免费额度）
- Fly.io（免费额度）

---

## 🎯 推荐方案对比

| 平台 | 休眠 | 免费额度 | 推荐度 |
|------|------|----------|--------|
| Railway | ❌ | $5/月 | ⭐⭐⭐⭐⭐ |
| Render | ✅ | 有限 | ⭐⭐⭐ |
| Fly.io | ❌ | 充足 | ⭐⭐⭐⭐ |
| Vercel | ❌ | 充足 | ⭐⭐⭐⭐⭐ |

---

**建议使用Railway或Vercel+Railway组合！**

