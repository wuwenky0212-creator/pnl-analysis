# 当前损益分析系统

当前损益分析（Current P&L Analysis）系统，用于金融市场部投资组合的历史回顾性损益计算和分析。

## 项目概述

该系统基于 FastAPI 后端和 HTML/CSS/JavaScript 前端，提供投资组合损益的多维度分析和可视化功能。

### 主要功能

- ✅ 累计损益计算（多维度细分）
- ✅ 损益趋势可视化（折线图）
- ✅ 损益分项贡献（柱状图、饼图）
- ✅ 投资组合过滤
- ✅ 产品过滤
- ✅ 数据导出（Excel 待实现）
- ✅ 异常警告提示

### 技术栈

**后端**
- FastAPI 0.104.1
- Python 3.9+
- Pandas, NumPy

**前端**
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js

## 项目结构

```
.
├── backend/                    # 后端代码
│   ├── main.py                # FastAPI 主应用
│   ├── config.py              # 配置管理
│   ├── api/                   # API 模块
│   │   ├── routes.py         # 路由定义
│   │   └── models.py         # 数据模型
│   ├── services/              # 业务逻辑层
│   │   ├── calculation.py    # 损益计算服务
│   │   ├── aggregation.py    # 数据聚合服务
│   │   └── valuation.py      # 估值模型服务
│   ├── data/                  # 数据层
│   │   └── mock_data.py      # 模拟数据提供器
│   └── utils/                 # 工具模块
│       ├── validators.py     # 数据验证
│       └── exceptions.py     # 异常定义
│
├── frontend/                   # 前端代码
│   ├── index.html            # 主页面
│   ├── css/
│   │   └── styles.css        # 样式文件
│   └── js/
│       ├── app.js            # 主应用逻辑
│       ├── api.js            # API 调用
│       ├── charts.js         # 图表渲染
│       └── export.js         # 导出功能
│
├── 当前损益分析需求文档.md     # 需求文档
├── 系统设计文档.md            # 系统设计文档
├── requirements.txt           # Python 依赖
└── README.md                  # 本文件

```

## 快速开始

### 1. 环境准备

确保已安装：
- Python 3.9+
- pip

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 启动后端服务

```bash
cd backend
python main.py
```

后端服务将在 `http://localhost:8000` 启动。

### 4. 启动前端服务

在项目根目录下，使用 Python HTTP 服务器：

```bash
# Python 3
python -m http.server 8080 --directory frontend

# 或使用其他静态文件服务器
```

前端页面将在 `http://localhost:8080` 可访问。

### 5. 访问应用

打开浏览器访问 `http://localhost:8080`。

## API 文档

启动后端服务后，访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 主要接口

#### 1. 获取黄金价格
```
GET /api/gold-price
```

#### 2. 获取投资组合列表
```
GET /api/portfolios
```

#### 3. 获取产品列表
```
GET /api/products?portfolio_id={portfolio_id}
```

#### 4. 计算损益
```
POST /api/pnl/calculate
Content-Type: application/json

{
  "analysis_type": "mark_to_market",
  "start_date": "2023-01-01",
  "end_date": "2024-01-15",
  "portfolio_ids": ["FM001"],
  "product_codes": ["BOND01", "SW01"],
  "group_by": "portfolio"
}
```

#### 5. 获取损益趋势
```
GET /api/pnl/trend?start_date=2023-01-01&end_date=2024-01-15&group_by=portfolio
```

## 损益分项说明

### 计算公式
```
P&L = Capital Gain + Present Value Effect + Revenue + Amortization P&L + Financing + Fees
```

### 分项类型
1. **利息损益** (Interest P&L)
   - 适用：固收、利率互换、汇率互换、商品、货币市场
   - 计算：利率 × 本金 × 天数 / 365

2. **价差损益** (Price Difference P&L)
   - 适用：固收、利率期权、汇率远期、商品、货币市场
   - 计算：卖出价 - 买入价（WAC）

3. **估值损益** (Valuation P&L)
   - 适用：所有品种
   - 计算：期末估值 - 期初估值

4. **摊销损益** (Amortization P&L)
   - 适用：固收（含权债）
   - 计算：实际利率法

5. **融资成本损益** (Financing Cost P&L)
   - 适用：债券交易、借贷
   - 计算：融资利率 × 金额 × 时间

6. **手续费损益** (Fee P&L)
   - 适用：所有品种
   - 计算：累计费用

## 开发说明

### 数据来源

当前使用模拟数据（`mock_data.py`），生产环境需替换为真实数据源。

### 扩展估值模型

在 `services/valuation.py` 中添加新的估值模型：
- DCF（折现现金流）
- IRS（利率互换）
- Black-Scholes（期权）

### 前端自定义

- 样式：修改 `frontend/css/styles.css`
- 图表：使用 Chart.js 配置自定义选项

## 部署建议

### 生产环境

1. **后端**
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:8000
   ```

2. **前端**
   - 使用 Nginx 提供静态文件服务
   - 配置反向代理到后端 API

3. **数据库**
   - 建议使用 PostgreSQL 或 MySQL
   - 集成 Redis 缓存

4. **安全**
   - 启用 HTTPS
   - 配置 CORS 白名单
   - 添加认证授权

## 故障排查

### 后端无法启动
- 检查 Python 版本（3.9+）
- 确认依赖已安装：`pip install -r requirements.txt`

### 前端无法连接后端
- 确认后端服务运行在 `http://localhost:8000`
- 检查前端 `js/api.js` 中的 `API_BASE_URL`

### 图表不显示
- 检查浏览器控制台是否有错误
- 确认 Chart.js CDN 可访问

## 待实现功能

- [ ] Excel 导出（需安装 openpyxl）
- [ ] 真实数据库集成
- [ ] 用户认证和授权
- [ ] 高级下钻功能
- [ ] 数据缓存优化

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

本项目仅供内部使用。

## 联系

如有问题，请联系项目维护者。








