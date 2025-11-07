# 🚀 快速部署到公网

## 一键部署步骤

### 1. 准备云服务器

- 购买云服务器（推荐：2核4GB，Ubuntu 22.04）
- 配置安全组：开放端口 22, 80, 443
- 获取公网IP地址

### 2. 上传项目到服务器

**方法一：使用Git（推荐）**
```bash
ssh root@你的公网IP
cd /opt
git clone <你的仓库地址> 损益归因分析
cd 损益归因分析
```

**方法二：使用SCP上传**
```bash
# Windows PowerShell
scp -r . root@你的公网IP:/opt/损益归因分析

# 或使用WinSCP/FileZilla图形工具
```

### 3. 运行部署脚本

```bash
cd /opt/损益归因分析
chmod +x deploy.sh
./deploy.sh
```

脚本会自动：
- ✅ 检查并安装Docker
- ✅ 检查并安装Docker Compose
- ✅ 创建必要目录
- ✅ 配置防火墙
- ✅ 启动所有服务

### 4. 访问系统

部署完成后，访问：
- **前端页面**: http://你的公网IP
- **API文档**: http://你的公网IP/docs

## 📋 手动部署（如果脚本失败）

### 1. 安装Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 安装Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 启动服务

```bash
cd /opt/损益归因分析
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. 检查状态

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 配置域名和HTTPS（可选但推荐）

### 1. 配置Nginx使用HTTP（临时）

如果没有SSL证书，可以先使用HTTP：

```bash
# 备份HTTPS配置
mv nginx/conf.d/default.conf nginx/conf.d/default-https.conf.backup

# 使用HTTP配置
cp nginx/conf.d/default-http.conf nginx/conf.d/default.conf

# 重启Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### 2. 申请SSL证书（Let's Encrypt）

```bash
# 安装Certbot
sudo apt install certbot -y

# 停止Nginx容器
docker-compose -f docker-compose.prod.yml stop nginx

# 申请证书（替换为你的域名）
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 修改nginx配置使用证书
# 编辑 nginx/conf.d/default.conf，取消SSL相关注释
# 并挂载证书目录到容器
```

### 3. 配置自动续期

```bash
sudo crontab -e

# 添加以下行
0 2 1 * * certbot renew --quiet && docker-compose -f /opt/损益归因分析/docker-compose.prod.yml restart nginx
```

## 📊 常用管理命令

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml stop

# 更新部署
git pull  # 如果有Git仓库
docker-compose -f docker-compose.prod.yml up -d --build

# 清理
docker system prune -a
```

## 🔒 安全建议

1. **修改SSH端口**（可选）
2. **使用SSH密钥登录**（推荐）
3. **配置防火墙**（必须）
4. **定期更新系统**
5. **使用HTTPS**（推荐）
6. **限制API访问**（生产环境）

## ❓ 故障排查

### 无法访问？

1. 检查容器是否运行：`docker ps`
2. 检查端口是否开放：`sudo ufw status`
3. 检查云服务商安全组
4. 查看日志：`docker-compose -f docker-compose.prod.yml logs`

### 服务无法启动？

1. 查看详细日志：`docker-compose -f docker-compose.prod.yml logs backend`
2. 检查配置文件：`docker-compose -f docker-compose.prod.yml config`
3. 检查端口占用：`netstat -tulpn | grep 80`

## 📖 详细文档

查看完整部署指南：`公网部署指南.md`

---

**部署完成后，你的系统就可以通过公网访问了！** 🎉


