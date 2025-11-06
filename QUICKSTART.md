# 🚀 快速开始指南

## 当前损益分析系统

### 方式一：Docker 部署（推荐）

#### 前提条件

- Docker Desktop 20.10+
- Docker Compose 2.0+

#### 一键部署

**Windows:**
```bash
deploy.bat
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**手动部署:**
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose stop
```

#### 访问服务

启动成功后，访问以下地址：

- **API 服务**: http://localhost:8080
- **API 文档**: http://localhost:8080/docs
- **可选页**: http://localhost:8080/redoc
- **健康检查**: http://localhost:8080/health

---

### 方式二：本地开发部署

#### 前提条件

- Python 3.9+
- pip

#### 安装依赖

```bash
pip install -r requirements.txt
```

#### 启动后端

```bash
cd backend
python main.py
```

#### 启动前端（另开终端）

```bash
python -m http.server 8080 --directory frontend
```

#### 访问服务

- **前端页面**: http://localhost:8080
- **后端API**: http://localhost:8001
- **API 文档**: http://localhost:8001/docs

---

### 方式三：批处理文件部署（Windows）

```bash
# 后端
start_backend.bat

# 前端（另开窗口）
start_frontend.bat
```

---

## 验证部署

### 1. 检查服务状态

**Docker:**
```bash
docker-compose ps
curl http://localhost:8080/health
```

**本地:**
```bash
# 后端
curl http://localhost:8001/health

# 前端
curl http://localhost:8080/
```

### 2. 测试 API

**获取投资组合列表:**
```bash
curl http://localhost:8080/api/portfolios
```

**计算损益:**
```bash
curl -X POST http://localhost:8080/api/pnl/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_type": "mark_to_market",
    "start_date": "2023-01-01",
    "end_date": "2024-01-15",
    "portfolio_ids": [],
    "product_codes": [],
    "group_by": "portfolio"
  }'
```

### 3. 访问 API 文档

打开浏览器访问：
```
http://localhost:8080/docs
```

点击 "Try it out" 测试各个接口。

---

## 常见问题

### Q: Docker 启动失败？

**A:** 检查以下几点：
1. 确认 Docker Desktop 已启动
2. 确认端口 8080 未被占用
3. 查看日志：`docker-compose logs web`

### Q: 本地部署端口冲突？

**A:** 修改配置文件：
- 后端端口：编辑 `backend/config.py`，修改 `PORT`
- 前端端口：修改 `frontend/js/api.js` 中的 `API_BASE_URL`

### Q: 无法连接后端？

**A:** 检查：
1. 后端服务是否正常运行
2. 防火墙是否阻止端口
3. CORS 配置是否正确

### Q: 图表不显示？

**A:** 检查：
1. 网络连接是否正常（需要加载 Chart.js CDN）
2. 浏览器控制台是否有错误
3. 数据是否正确返回

---

## 下一步

1. ✅ 查看 [API 文档](http://localhost:8080/docs) 了解所有接口
2. ✅ 阅读 [系统设计文档](./系统设计文档.md) 了解架构
3. ✅ 查看 [部署说明](./Docker部署说明.md) 优化配置
4. ✅ 阅读 [用户手册](./README.md) 了解功能

---

## 需要帮助？

- 📚 查看完整文档：[README.md](./README.md)
- 🐛 报告问题：[提交 Issue]
- 💬 技术支持：[联系开发者]

---

**祝你使用愉快！** 🎉








