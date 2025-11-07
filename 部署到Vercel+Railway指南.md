# 🚀 部署到Vercel + Railway（推荐方案）

## 📋 方案说明

- **前端**：部署到Vercel（全球CDN，速度快）
- **后端**：部署到Railway（简单易用）
- **费用**：完全免费（个人项目）

## 🎯 部署步骤

### 第一部分：部署后端到Railway

1. **准备GitHub仓库**（如果还没有）
   ```bash
   git init
   git add .
   git commit -m "准备部署"
   git remote add origin https://github.com/你的用户名/损益归因分析.git
   git push -u origin main
   ```

2. **部署到Railway**
   - 访问 https://railway.app
   - 登录（使用GitHub账号）
   - 点击 "New Project" > "Deploy from GitHub repo"
   - 选择你的仓库
   - Railway会自动检测并部署

3. **获取后端URL**
   - 在服务设置中生成域名
   - 例如：`https://fx-attribution-backend.railway.app`
   - **复制这个URL**

### 第二部分：部署前端到Vercel

1. **访问Vercel**
   - 访问 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的GitHub仓库
   - 点击 "Import"

3. **配置项目**
   ```
   Framework Preset: Other
   Root Directory: frontend
   Build Command: （留空）
   Output Directory: .
   ```

4. **设置环境变量**
   - 在项目设置中添加：
   ```
   VITE_API_URL=https://你的后端URL.railway.app/api
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成
   - 获取前端URL，例如：`https://your-app.vercel.app`

### 第三部分：更新前端代码

修改 `frontend/index.html`，在 `<head>` 中添加：

```html
<meta name="backend-url" content="https://你的后端URL.railway.app">
```

或者直接修改 `frontend/js/api.js`：

```javascript
// 生产环境API地址
const PROD_API_URL = 'https://你的后端URL.railway.app/api';
const API_BASE_URL = window.location.hostname.includes('vercel.app') 
    ? PROD_API_URL 
    : 'http://localhost:8002/api';
```

## 🎉 完成！

部署完成后：
- **前端**: https://your-app.vercel.app
- **后端**: https://your-backend.railway.app
- **API文档**: https://your-backend.railway.app/docs

**现在任何人都可以通过前端URL访问你的应用了！**

## 📝 更新部署

```bash
# 1. 修改代码
# 2. 提交到GitHub
git add .
git commit -m "更新内容"
git push

# 3. Vercel和Railway会自动重新部署
```

## 🔧 自定义域名

### Vercel域名
1. 在Vercel项目设置中
2. 选择 "Domains"
3. 添加你的域名
4. 配置DNS记录

### Railway域名
1. 在Railway服务设置中
2. 选择 "Domains"
3. 添加自定义域名
4. 配置DNS记录

---

**就是这么简单！你的应用现在可以被全世界访问了！** 🌍


