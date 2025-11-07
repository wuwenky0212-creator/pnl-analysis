# 当前损益分析系统 - Docker 部署说明

## 快速部署

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 一键启动

```bash
# 克隆项目（如果还未克隆）
git clone <repository-url>
cd 损益归因分析

# 构建并启动服务
docker-compose up -d
```

### 查看日志

```bash
# 查看实时日志
docker-compose logs -f web

# 查看最近100行日志
docker-compose logs --tail=100 web
```

### 停止服务

```bash
# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、卷、镜像
docker-compose down -v --rmi all
```

## 访问服务

启动成功后，服务将在以下地址提供：

- **API 服务**: http://localhost:8080
- **API 文档**: http://localhost:8080/docs
- **可选页**: http://localhost:8080/redoc
- **健康检查**: http://localhost:8080/health

## 配置说明

### 环境变量

可以在 `docker-compose.yml` 中修改以下环境变量：

```yaml
environment:
  - HOST=0.0.0.0              # 监听地址
  - PORT=8080                  # 端口号
  - DEBUG=False                # 调试模式
  - DATA_FORMAT=mock           # 数据格式（mock/database）
  - DEFAULT_CURRENCY=CNY       # 默认货币
  - DEFAULT_UNIT=万元          # 默认单位
```

### 端口映射

默认端口映射：`8080:8080`

如需修改端口，编辑 `docker-compose.yml`：

```yaml
ports:
  - "8080:8080"  # 将左边的主机端口改为你想要的端口
```

例如改为 9000 端口：
```yaml
ports:
  - "9000:8080"
```

## 生产环境部署

### 使用环境变量文件

1. 创建 `.env` 文件：

```env
HOST=0.0.0.0
PORT=8080
DEBUG=False
DATA_FORMAT=mock
DEFAULT_CURRENCY=CNY
DEFAULT_UNIT=万元
```

2. 在 `docker-compose.yml` 中引用：

```yaml
services:
  web:
    env_file:
      - .env
```

### 使用 Gunicorn（推荐）

修改 `Dockerfile` 中的启动命令：

```dockerfile
CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8080", "--workers", "4", \
     "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-"]
```

并安装 gunicorn：

```dockerfile
RUN pip install gunicorn
```

### 添加反向代理（Nginx）

创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://web:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

在 `docker-compose.yml` 中添加 Nginx 服务：

```yaml
services:
  web:
    # ... existing configuration
    
  nginx:
    image: nginx:alpine
    container_name: pnl-analysis-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - web
    networks:
      - pnl-network
```

### SSL/HTTPS 配置

使用 Let's Encrypt：

```yaml
  nginx:
    # ... existing configuration
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"
```

## 监控和维护

### 健康检查

服务包含内置健康检查：

```bash
# 检查容器状态
docker-compose ps

# 手动检查健康状态
curl http://localhost:8080/health
```

### 日志管理

```bash
# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web

# 导出日志到文件
docker-compose logs > logs.txt
```

### 备份

```bash
# 备份容器（如果使用卷存储数据）
docker run --rm -v pnl-analysis-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启服务（零停机）
docker-compose up -d --no-deps --build web
```

## 故障排查

### 容器无法启动

1. 检查日志：
```bash
docker-compose logs web
```

2. 检查端口占用：
```bash
netstat -tulpn | grep 8080
```

3. 检查配置：
```bash
docker-compose config
```

### 应用无响应

1. 检查容器状态：
```bash
docker-compose ps
docker inspect pnl-analysis-web
```

2. 进入容器调试：
```bash
docker-compose exec web bash
python -c "from main import app; print(app)"
```

3. 检查健康状态：
```bash
curl -v http://localhost:8080/health
```

### 性能问题

1. 增加工作进程数：
```bash
# 在 Dockerfile 中修改
CMD ["python", "-m", "uvicorn", "main:app", "--workers", "8"]
```

2. 使用资源限制：
```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## 安全建议

### 1. 网络安全

```yaml
services:
  web:
    # 仅暴露必要端口
    expose:
      - "8080"
```

### 2. 环境变量安全

- 使用 `.env` 文件管理敏感信息
- 不要将 `.env` 文件提交到版本控制
- 使用 Docker secrets（生产环境）

### 3. 镜像安全

```bash
# 扫描镜像漏洞
docker scan pnl-analysis

# 使用官方基础镜像
FROM python:3.11-slim

# 定期更新依赖
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
```

### 4. 日志安全

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 扩展部署

### 多实例负载均衡

```yaml
version: '3.8'

services:
  web:
    deploy:
      replicas: 3
    
  nginx:
    image: nginx:alpine
    depends_on:
      - web
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

### 添加 Redis 缓存

```yaml
  redis:
    image: redis:7-alpine
    container_name: pnl-analysis-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - pnl-network

volumes:
  redis-data:
```

### 添加数据库

```yaml
  postgres:
    image: postgres:15-alpine
    container_name: pnl-analysis-db
    environment:
      POSTGRES_DB: pnl_analysis
      POSTGRES_USER: pnl_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - pnl-network

volumes:
  postgres-data:
```

## 开发模式

### 挂载代码目录

```yaml
services:
  web:
    volumes:
      - ./backend:/app
    environment:
      - DEBUG=True
```

### 热重载

```yaml
command: ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]
```

## 常用命令速查

```bash
# 启动
docker-compose up -d

# 停止
docker-compose stop

# 重启
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 进入容器
docker-compose exec web bash

# 重建镜像
docker-compose build --no-cache

# 删除所有
docker-compose down -v

# 清理未使用的镜像
docker system prune -a
```

## 参考链接

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [FastAPI 部署文档](https://fastapi.tiangolo.com/deployment/)
- [Uvicorn 文档](https://www.uvicorn.org/)

---

**版本**: 1.0  
**最后更新**: 2024年11月









