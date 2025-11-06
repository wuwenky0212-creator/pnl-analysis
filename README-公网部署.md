# 🌍 公网公开部署 - 让所有人都能访问

## 🎯 推荐方案：Railway（最简单）

### 为什么选择Railway？
- ✅ **一键部署**：连接GitHub，自动部署
- ✅ **免费额度**：$5/月（通常足够使用）
- ✅ **自动HTTPS**：免费SSL证书
- ✅ **全球访问**：任何人都能通过公网访问
- ✅ **自动更新**：Git推送自动重新部署

---

## ⚡ 快速开始（5分钟）

### 1. 上传代码到GitHub

```bash
git init
git add .
git commit -m "准备部署"
git remote add origin https://github.com/你的用户名/损益归因分析.git
git push -u origin main
```

### 2. 部署到Railway

1. 访问：https://railway.app
2. 登录（使用GitHub账号）
3. 点击 "New Project" > "Deploy from GitHub repo"
4. 选择你的仓库
5. 等待部署完成（2-5分钟）
6. 获取公网URL ✅

### 3. 配置前端API地址

在 `frontend/index.html` 的 `<head>` 中添加：

```html
<meta name="backend-url" content="https://你的后端URL.railway.app">
```

重新推送代码，完成！

---

## 📖 详细文档

- **最简单方案**: `最简单部署方案.md`
- **Railway详细指南**: `部署到Railway指南.md`
- **Vercel+Railway**: `部署到Vercel+Railway指南.md`
- **其他平台**: `公网公开部署方案.md`

---

## 🎉 完成！

部署完成后，任何人都可以通过公网URL访问你的应用！

**推荐使用Railway，3步完成部署！** 🚀

