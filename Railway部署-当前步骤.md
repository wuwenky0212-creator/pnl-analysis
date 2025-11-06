# 🚂 Railway部署 - 当前步骤

## ✅ 当前状态

你已经成功：
- ✅ 创建了Railway项目：`grateful-victory`
- ✅ Railway识别出了两个服务：
  - `fx-attribution-frontend`（前端）
  - `fx-attribution-backend`（后端）
- ✅ 已经配置了部分环境变量（HOST和PORT）

---

## 🚀 下一步操作

### 步骤1：部署后端服务

1. **点击紫色的 "Deploy" 按钮**（在左侧面板顶部）
   - 或者按快捷键 `Ctrl + Enter`
2. **等待部署开始**（会看到构建日志）

---

### 步骤2：配置完整的环境变量

部署开始后，立即配置：

1. **在右侧面板**，确保在 `fx-attribution-backend` 服务的 **"Variables"** 标签
2. **点击 "+ New Variable"**，逐个添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `DEBUG` | `False` |
| `DATA_FORMAT` | `mock` |
| `DEFAULT_CURRENCY` | `CNY` |
| `DEFAULT_UNIT` | `万元` |

**注意**：`HOST` 和 `PORT` 已经存在，检查一下：
- `HOST` 应该是 `0.0.0.0`
- `PORT` 应该是 `8002`

如果值不对，点击变量旁边的编辑按钮修改。

---

### 步骤3：等待部署完成

1. **查看部署日志**：
   - 点击 "Deployments" 标签
   - 可以看到构建和部署的实时日志
2. **等待显示 "Deployed successfully"**（通常2-5分钟）

---

### 步骤4：获取后端URL

部署完成后：

1. 点击 **"Settings"** 标签
2. 向下滚动到 **"Domains"** 部分
3. 点击 **"Generate Domain"** 按钮
4. Railway会生成一个URL，例如：
   ```
   https://fx-attribution-backend-production.up.railway.app
   ```
5. **复制这个URL**，保存好！

---

### 步骤5：部署前端服务

1. **点击左侧的 `fx-attribution-frontend` 服务卡片**
2. 在右侧面板，点击 **"Deployments"** 标签
3. 点击 **"Deploy"** 按钮（如果有）
4. 或者等待Railway自动部署

**配置前端环境变量**（如果需要）：
- 在 `fx-attribution-frontend` 服务的 **"Variables"** 标签
- 添加变量：
  ```
  API_URL=https://你的后端URL.railway.app/api
  ```
  （替换为步骤4中复制的后端URL）

---

### 步骤6：获取前端URL

1. 在 `fx-attribution-frontend` 服务页面
2. 点击 **"Settings"** 标签
3. 找到 **"Domains"**，点击 **"Generate Domain"**
4. 复制前端URL

---

## 🎉 完成！

### 访问地址

- **前端页面**: https://你的前端URL.railway.app
- **后端API**: https://你的后端URL.railway.app
- **API文档**: https://你的后端URL.railway.app/docs

### 测试

1. 打开前端URL
2. 按 **F12** 打开开发者工具
3. 查看 **Network** 标签，确认API请求成功
4. 如果页面正常显示数据，说明部署成功！

---

## 📋 检查清单

- [ ] 已点击"Deploy"按钮开始部署后端
- [ ] 已配置所有环境变量（DEBUG, DATA_FORMAT, DEFAULT_CURRENCY, DEFAULT_UNIT）
- [ ] 已检查HOST和PORT的值是否正确
- [ ] 后端部署完成
- [ ] 已生成后端域名
- [ ] 已部署前端服务
- [ ] 已配置前端API_URL环境变量
- [ ] 已生成前端域名
- [ ] 测试访问成功

---

**现在点击"Deploy"按钮开始部署！** 🚂

