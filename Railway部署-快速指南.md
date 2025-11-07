# 🚂 Railway部署 - 快速指南

## ✅ 当前状态
- GitHub仓库已创建 ✅
- 代码已推送 ✅

## 🚀 现在做什么：部署到Railway

### 第一步：登录Railway（1分钟）

1. 访问：https://railway.app
2. 点击 "Login with GitHub"
3. 授权登录

### 第二步：部署后端（5分钟）

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择仓库：`wuwenky0212-creator/pnl-analysis`
4. 等待部署（2-5分钟）

### 第三步：配置环境变量（2分钟）

在服务页面 > Variables，添加：
```
PORT=8002
HOST=0.0.0.0
DEBUG=False
DATA_FORMAT=mock
DEFAULT_CURRENCY=CNY
DEFAULT_UNIT=万元
```

### 第四步：获取后端URL（1分钟）

Settings > Domains > Generate Domain
复制生成的URL

### 第五步：部署前端（5分钟）

在Railway项目中：
- 点击 "New" > "Empty Service"
- Source: 选择同一个仓库
- Root Directory: `frontend`
- Deploy

### 第六步：配置前端API

修改 `frontend/index.html`，取消注释并修改：
```html
<meta name="backend-url" content="https://你的后端URL.railway.app">
```

提交并推送：
```powershell
git add frontend/index.html
git commit -m "配置后端API"
git push
```

---

## 🎉 完成！

访问前端URL，任何人都可以访问了！

---

**详细步骤见：`部署到Railway-现在开始.md`**


