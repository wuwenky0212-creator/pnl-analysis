# 🚂 Railway部署 - 选择GitHub仓库

## ✅ 你看到了这些选项

1. **GitHub Repository** ⭐ **选择这个！**
2. Database
3. Template
4. Docker Image
5. Function
6. Empty Project

---

## 🎯 下一步操作

### 步骤1：选择 "GitHub Repository"

1. **点击第一个选项：GitHub Repository**（带GitHub猫图标那个）
2. Railway会要求授权GitHub（如果还没授权）

### 步骤2：授权GitHub（如果需要）

1. 如果弹出授权窗口，点击 **"Authorize"** 或 **"授权"**
2. 选择授权范围：**"All repositories"** 或选择特定仓库
3. 完成授权

### 步骤3：选择仓库

1. 在仓库列表中，找到：`wuwenky0212-creator/pnl-analysis`
2. **点击仓库名称**
3. Railway会自动开始部署！

---

## 📋 接下来会发生什么

Railway会自动：
1. ✅ 检测到你的 `Dockerfile`
2. ✅ 开始构建Docker镜像（可以看到构建日志）
3. ✅ 部署应用（需要2-5分钟）

---

## ⚙️ 部署时的配置

部署开始后，立即配置环境变量：

1. **在服务页面**，点击服务名称
2. 选择 **"Variables"** 标签
3. 点击 **"+ New Variable"**，添加：

```
PORT=8002
HOST=0.0.0.0
DEBUG=False
DATA_FORMAT=mock
DEFAULT_CURRENCY=CNY
DEFAULT_UNIT=万元
```

---

## 🎉 完成！

部署完成后，Railway会生成一个URL，你的应用就可以在公网访问了！

---

**现在点击 "GitHub Repository" 开始吧！** 🚂

