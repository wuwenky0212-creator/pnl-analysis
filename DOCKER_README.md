# 🐳 Docker 部署说明

## 一键部署

当前损益分析系统已配置完整的 Docker 部署方案。

### Windows 用户

```bash
deploy.bat
```

### Linux/macOS 用户

```bash
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

```bash
docker-compose up -d
```

## 快速访问

部署成功后，服务将在 **http://localhost:8080** 提供：

- **API 服务**: http://localhost:8080
- **API 文档**: http://localhost:8080/docs
- **健康检查**: http://localhost:8080/health

## 核心配置

| 配置项 | 值 |
|--------|---|
| 服务端口 | 8080 |
| 工作进程 | 4 workers |
| 健康检查 | ✅ 启用 |
| 自动重启 | ✅ 配置 |
| 日志管理 | 10MB × 3文件 |

## 文件清单

- ✅ `Dockerfile` - Docker 镜像构建
- ✅ `docker-compose.yml` - Docker Compose 配置
- ✅ `.dockerignore` - 构建忽略文件
- ✅ `deploy.sh` - Linux/macOS 部署脚本
- ✅ `deploy.bat` - Windows 部署脚本

## 详细文档

- 📘 [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南
- 📗 [Docker部署说明.md](./Docker部署说明.md) - 详细部署文档
- 📙 [部署完成说明.md](./部署完成说明.md) - 配置说明

## 常用命令

```bash
# 启动
docker-compose up -d

# 停止
docker-compose stop

# 重启
docker-compose restart

# 查看日志
docker-compose logs -f

# 删除
docker-compose down
```

---

**🎉 配置完成，可以随时部署！**








