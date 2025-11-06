# Docker Compose 使用说明

## 文件说明

本项目包含以下 Docker Compose 配置文件：

1. **docker-compose.yml** - 外汇类损益归因分析服务（主要配置）
2. **docker-compose.fx.yml** - 外汇类损益归因分析服务（备用配置，与 docker-compose.yml 内容相同）

## 快速启动

### 方式一：使用默认配置文件

```bash
# 构建并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f web

# 停止服务
docker-compose down
```

### 方式二：使用指定配置文件

```bash
# 使用 docker-compose.fx.yml
docker-compose -f docker-compose.fx.yml up -d

# 查看日志
docker-compose -f docker-compose.fx.yml logs -f web

# 停止服务
docker-compose -f docker-compose.fx.yml down
```

## 服务配置

### Web 服务（FastAPI）

- **容器名称**: `fx-attribution-web`
- **端口映射**: `8002:8002`
- **访问地址**: 
  - API: http://localhost:8002
  - API文档: http://localhost:8002/docs
  - 健康检查: http://localhost:8002/health

### 环境变量

- `HOST=0.0.0.0` - 监听所有网络接口
- `PORT=8002` - 服务端口
- `DEBUG=False` - 生产模式
- `DATA_FORMAT=mock` - 使用模拟数据
- `DEFAULT_CURRENCY=CNY` - 默认货币
- `DEFAULT_UNIT=万元` - 默认单位

## 常用命令

### 构建镜像

```bash
docker-compose build
```

### 重新构建并启动

```bash
docker-compose up -d --build
```

### 查看服务日志

```bash
# 实时日志
docker-compose logs -f web

# 最近100行日志
docker-compose logs --tail=100 web
```

### 进入容器

```bash
docker-compose exec web bash
```

### 重启服务

```bash
docker-compose restart web
```

### 停止并删除容器

```bash
docker-compose down
```

### 停止并删除容器、镜像和卷

```bash
docker-compose down -v --rmi all
```

## 健康检查

服务包含健康检查配置，默认每30秒检查一次。可以通过以下命令查看健康状态：

```bash
docker-compose ps
```

## 日志管理

- 日志文件大小限制：10MB
- 日志文件数量：3个
- 日志目录：`./logs`（可选挂载）

## 网络配置

服务使用独立的 Docker 网络：`fx-attribution-network`

## 故障排查

### 检查服务状态

```bash
docker-compose ps
```

### 查看错误日志

```bash
docker-compose logs web
```

### 检查端口占用

```bash
# Windows
netstat -ano | findstr :8002

# Linux/Mac
lsof -i :8002
```

### 重新创建服务

```bash
docker-compose up -d --force-recreate
```

## 开发模式

如果需要开发模式（自动重载），可以修改 docker-compose.yml 中的 command：

```yaml
command: ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]
```

## 生产环境建议

1. 设置 `DEBUG=False`
2. 使用环境变量文件（`.env`）管理敏感配置
3. 配置适当的日志轮转策略
4. 使用反向代理（如 Nginx）处理静态文件和 HTTPS
5. 配置防火墙规则限制端口访问
6. 定期备份数据

