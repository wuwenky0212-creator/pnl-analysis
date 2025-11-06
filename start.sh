#!/bin/bash
# 启动脚本 - 支持Railway等平台的环境变量PORT

PORT=${PORT:-8002}
python -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4

