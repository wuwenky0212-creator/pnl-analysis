# 🔧 获取后端URL和配置前端

## 📍 当前位置
你在 `fx-attribution-backend` 服务的 Settings 页面

---

## 🎯 步骤1：获取后端URL

### 方法1：通过Networking设置

1. **在右侧导航栏**，点击 **"Networking"**（在Source下面）
2. **找到 "Domains" 部分**
3. **点击 "Generate Domain"** 按钮（如果还没有生成）
4. **复制生成的URL**

### 方法2：直接查看

1. **回到服务主页面**（点击左上角的服务名称）
2. **在服务卡片上**，应该能看到URL
3. **或者点击 "Deployments" 标签**，在最新的部署中应该能看到URL

---

## 🎨 步骤2：配置前端服务

### 步骤1：切换到前端服务

1. **点击左侧的 `fx-attribution-frontend` 服务卡片**（蓝色那个）
2. **点击 "Settings" 标签**

### 步骤2：配置Root Directory

1. **在 "Source" 部分**，找到 **"Root Directory"**
2. **点击输入框**（当前显示 "."）
3. **输入**：`frontend`
4. **保存**（Railway会自动保存）

### 步骤3：部署前端

1. **回到服务主页面**（点击左上角的服务名称）
2. **点击 "Deployments" 标签**
3. **点击 "Deploy" 按钮**（如果有）
4. **或者Railway会自动开始部署**

---

## 🔧 步骤3：配置前端API地址

前端部署开始后：

1. **修改** `frontend/index.html`
2. **在 `<head>` 标签中**，找到：
   ```html
   <!-- <meta name="backend-url" content="https://your-backend.railway.app"> -->
   ```
3. **取消注释并修改**为你的后端URL：
   ```html
   <meta name="backend-url" content="https://你的后端URL.railway.app">
   ```
4. **提交并推送**：
   - 在GitHub Desktop中，输入提交信息：`配置后端API地址`
   - 点击 "Commit to main"
   - 点击 "Push origin"
   - Railway会自动重新部署前端

---

## 📋 快速检查清单

- [ ] 已点击 "Networking" 获取后端URL
- [ ] 已复制后端URL
- [ ] 已切换到前端服务
- [ ] 已配置前端Root Directory为 `frontend`
- [ ] 前端正在部署
- [ ] 已修改 `frontend/index.html` 配置API地址
- [ ] 已提交并推送修改
- [ ] 前端部署完成
- [ ] 已获取前端URL
- [ ] 测试访问成功

---

**现在点击右侧的 "Networking" 来获取后端URL！** 🌐


