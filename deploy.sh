#!/bin/bash

# 损益归因分析系统 - 公网部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "=========================================="
echo "  损益归因分析系统 - 公网部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}提示: 建议使用root用户运行此脚本${NC}"
    read -p "是否继续? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 1. 检查并安装 Docker
echo -e "${GREEN}[1/7] 检查 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl start docker
    sudo systemctl enable docker
    rm get-docker.sh
    echo "Docker 安装完成"
else
    echo "Docker 已安装: $(docker --version)"
fi

# 2. 检查并安装 Docker Compose
echo -e "${GREEN}[2/7] 检查 Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    DOCKER_COMPOSE_VERSION="v2.20.0"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose 安装完成"
else
    echo "Docker Compose 已安装: $(docker-compose --version)"
fi

# 3. 检查项目文件
echo -e "${GREEN}[3/7] 检查项目文件...${NC}"
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}错误: 未找到 docker-compose.prod.yml 文件${NC}"
    exit 1
fi

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}错误: 未找到 backend 或 frontend 目录${NC}"
    exit 1
fi

echo "项目文件检查通过"

# 4. 创建必要的目录
echo -e "${GREEN}[4/7] 创建必要的目录...${NC}"
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p logs
echo "目录创建完成"

# 5. 检查并配置 Nginx
echo -e "${GREEN}[5/7] 检查 Nginx 配置...${NC}"
if [ ! -f "nginx/conf.d/default.conf" ]; then
    echo -e "${YELLOW}警告: 未找到 Nginx 配置文件，请确保已创建${NC}"
fi

# 询问是否配置域名
read -p "是否已配置域名? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "请输入域名: " DOMAIN
    if [ ! -z "$DOMAIN" ]; then
        # 替换配置文件中的域名
        if [ -f "nginx/conf.d/default.conf" ]; then
            sed -i "s/server_name _;/server_name $DOMAIN;/g" nginx/conf.d/default.conf
            echo "域名已配置: $DOMAIN"
        fi
    fi
fi

# 6. 配置防火墙
echo -e "${GREEN}[6/7] 配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    echo "配置 UFW 防火墙..."
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo "防火墙规则已添加"
elif command -v firewall-cmd &> /dev/null; then
    echo "配置 Firewalld 防火墙..."
    sudo firewall-cmd --permanent --add-port=22/tcp
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --reload
    echo "防火墙规则已添加"
else
    echo -e "${YELLOW}警告: 未检测到防火墙，请手动配置安全组${NC}"
fi

# 7. 启动服务
echo -e "${GREEN}[7/7] 启动服务...${NC}"
echo "构建并启动 Docker 容器..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "=========================================="
echo "  服务状态检查"
echo "=========================================="
docker-compose -f docker-compose.prod.yml ps

# 获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "无法获取")

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo -e "${GREEN}访问地址:${NC}"
echo "  前端页面: http://${PUBLIC_IP}"
echo "  API文档:  http://${PUBLIC_IP}/docs"
echo "  后端API:  http://${PUBLIC_IP}/api/portfolios"
echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "  重启服务: docker-compose -f docker-compose.prod.yml restart"
echo "  停止服务: docker-compose -f docker-compose.prod.yml down"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo "  1. 配置域名解析（如果使用域名）"
echo "  2. 配置SSL证书（推荐使用Let's Encrypt）"
echo "  3. 查看详细文档: cat 公网部署指南.md"
echo ""
