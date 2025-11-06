"""
API 数据模型
"""

from typing import List, Optional
from pydantic import BaseModel, Field

# ============ 请求模型 ============

class PnLCalculateRequest(BaseModel):
    """损益计算请求"""
    analysis_type: str = Field(..., description="分析方法: mark_to_market 或 accounting_class")
    start_date: str = Field(..., description="起始日期: YYYY-MM-DD")
    end_date: str = Field(..., description="结束日期: YYYY-MM-DD")
    portfolio_ids: List[str] = Field(default_factory=list, description="投资组合ID列表")
    product_codes: List[str] = Field(default_factory=list, description="产品代码列表")
    group_by: str = Field(default="portfolio", description="分组维度: portfolio, asset_class, pnl_component")

# ============ 响应模型 ============

class Portfolio(BaseModel):
    """投资组合"""
    id: str  # 账簿编码
    name: str  # 账户名称
    type: str = "investment"  # team, department, investment, etc.
    parent_id: Optional[str] = None
    ledger_code: Optional[str] = None  # 账簿编码（与id相同，保留用于兼容）
    account_name: Optional[str] = None  # 账户名称（与name相同，保留用于兼容）
    bookkeeping_structure: Optional[str] = None  # 簿记架构
    account_property: Optional[str] = None  # 账户属性
    accounting_classification: Optional[str] = None  # 会计分类
    pnl_currency: Optional[str] = "CNY"  # 损益货币

class Product(BaseModel):
    """产品"""
    code: str
    name: str
    asset_class: str
    portfolio_id: Optional[str] = None

class PnLComponent(BaseModel):
    """损益分项"""
    interest: float = 0.0      # 利息损益
    price_diff: float = 0.0    # 价差损益
    valuation: float = 0.0     # 估值损益
    amortization: float = 0.0  # 摊销损益
    financing: float = 0.0     # 融资成本损益
    fee: float = 0.0           # 手续费损益
    
    @property
    def total(self) -> float:
        """总损益"""
        return sum([
            self.interest,
            self.price_diff,
            self.valuation,
            # self.amortization,  # 摊销损益已移除
            self.financing,
            self.fee
        ])

class PnLDetail(BaseModel):
    """损益明细"""
    dimension_value: str  # 维度值（如组合名称、产品代码、分项名称）
    pnl_interest: float = 0.0
    pnl_price_diff: float = 0.0
    pnl_valuation: float = 0.0
    pnl_amortization: float = 0.0
    pnl_financing: float = 0.0
    pnl_fee: float = 0.0
    total_pnl: float = 0.0
    percentage: float = 0.0

class DataWarning(BaseModel):
    """数据警告"""
    type: str  # market_data, position_data
    date: str
    product: Optional[str] = None
    suggested_action: str

class PnLCalculateResponse(BaseModel):
    """损益计算响应"""
    total_pnl: float
    currency: str = "CNY"
    unit: str = "万元"
    details: List[PnLDetail]
    warnings: List[DataWarning] = Field(default_factory=list)

class PnLTrendPoint(BaseModel):
    """损益趋势数据点"""
    date: str
    total_pnl: float = 0.0  # 累计损益总额（必需字段）
    pnl_interest: float = 0.0  # 利息损益
    pnl_price_diff: float = 0.0  # 价差损益
    pnl_valuation: float = 0.0  # 估值损益
    pnl_fee: float = 0.0  # 手续费损益
    # 保留pnl字段用于兼容
    pnl: Optional[float] = None
    
    class Config:
        # 允许使用字段别名
        populate_by_name = True

class PnLTrendResponse(BaseModel):
    """损益趋势响应"""
    trend_data: List[PnLTrendPoint]

class GoldPriceResponse(BaseModel):
    """黄金价格响应"""
    date: str
    price: float
    currency: str = "CNY"

class PortfolioListResponse(BaseModel):
    """投资组合列表响应"""
    portfolios: List[Portfolio]

class ProductListResponse(BaseModel):
    """产品列表响应"""
    products: List[Product]

# ============ 交易明细模型 ============

class TransactionDetail(BaseModel):
    """交易明细"""
    transaction_id: str = Field(..., description="交易ID")
    trade_date: str = Field(..., description="交易日期")
    product_code: str = Field(..., description="产品代码")
    product_name: str = Field(..., description="产品名称")
    currency_pair: Optional[str] = Field(None, description="货币对")
    trade_direction: str = Field(..., description="交易方向: 买入/卖出")
    notional_amount: float = Field(..., description="名义本金（万元）")
    price: Optional[float] = Field(None, description="价格/汇率")
    pnl_interest: float = Field(0.0, description="利息损益")
    pnl_price_diff: float = Field(0.0, description="价差损益")
    pnl_valuation: float = Field(0.0, description="估值损益")
    pnl_financing: float = Field(0.0, description="融资成本损益")
    pnl_fee: float = Field(0.0, description="手续费损益")
    total_pnl: float = Field(0.0, description="总损益")
    portfolio_name: str = Field(..., description="投组名称")

class TransactionDetailRequest(BaseModel):
    """交易明细请求"""
    start_date: str = Field(..., description="起始日期")
    end_date: str = Field(..., description="结束日期")
    dimension_type: str = Field(..., description="维度类型: portfolio, product")
    dimension_value: str = Field(..., description="维度值（投组名称或产品代码）")
    portfolio_ids: Optional[str] = Field(None, description="投资组合ID列表（逗号分隔）")
    product_codes: Optional[str] = Field(None, description="产品代码列表（逗号分隔）")

class TransactionDetailResponse(BaseModel):
    """交易明细响应"""
    transactions: List[TransactionDetail]






