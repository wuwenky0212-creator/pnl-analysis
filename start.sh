#!/bin/bash
# 启动脚本 - 支持Railway等平台的环境变量PORT

# 获取PORT环境变量，如果不存在则使用8002
PORT="${PORT:-8002}"

# 确保PORT是数字
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "Warning: PORT is not a number, using default 8002"
    PORT=8002
fi

echo "Starting server on port $PORT"

# 启动应用
exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT" --workers 1

