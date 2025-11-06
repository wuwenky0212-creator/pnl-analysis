# 当前损益分析系统 - Dockerfile
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# 复制应用代码
COPY backend/ /app/

# 设置工作目录
WORKDIR /app

# 暴露端口
EXPOSE 8002

# 健康检查（使用环境变量PORT，如果未设置则使用8002）
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request, os; port = os.getenv('PORT', '8002'); urllib.request.urlopen(f'http://localhost:{port}/api/portfolios').read()" || exit 1

# 复制启动脚本
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 启动应用
# Railway等平台会自动设置PORT环境变量
CMD ["/app/start.sh"]

