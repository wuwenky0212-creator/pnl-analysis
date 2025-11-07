"""
外汇类损益归因分析 API 路由定义
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from data.mock_data import MockDataProvider
from utils.validators import validate_date_range

router = APIRouter(prefix="/fx-attribution", tags=["外汇类损益归因"])

# ============ 数据提供商 ============
mock_data = MockDataProvider()

# ============ 数据模型 ============

class FXProduct(BaseModel):
    """外汇产品"""
    code: str
    name: str
    category: str

class FXProductListResponse(BaseModel):
    """外汇产品列表响应"""
    products: List[FXProduct]

class FXFactorDetail(BaseModel):
    """外汇风险因子明细"""
    factor_name: str
    factor_code: str
    start_value: float = 0.0
    end_value: float = 0.0
    delta: float = 0.0
    pnl_contribution: float = 0.0

class FXAttributionDetail(BaseModel):
    """外汇损益归因明细"""
    dimension_value: str
    valuation_pnl: float = 0.0
    factors: List[FXFactorDetail] = []
    unexplained: float = 0.0
    start_date_factors: Optional[dict] = None
    end_date_factors: Optional[dict] = None

class FXAttributionRequest(BaseModel):
    """外汇类损益归因分析请求"""
    start_date: str
    end_date: str
    portfolio_ids: List[str] = []
    product_codes: List[str] = []
    currency_pairs: List[str] = []
    group_by: str = "portfolio"

class FXAttributionResponse(BaseModel):
    """外汇类损益归因分析响应"""
    total_valuation_pnl: float
    currency: str = "CNY"
    unit: str = "万元"
    details: List[FXAttributionDetail] = []
    trend_data: List[dict] = []
    warnings: List[dict] = []

class FXDrilldownRequest(BaseModel):
    """下钻查询请求"""
    start_date: str
    end_date: str
    dimension_type: str
    dimension_value: str
    drill_type: str = "both"

class FXDrilldownResponse(BaseModel):
    """下钻查询响应"""
    start_date_factors: dict = {}
    end_date_factors: dict = {}

class FXTransactionDetail(BaseModel):
    """交易明细"""
    transaction_id: str
    trade_date: str
    product_code: str
    product_name: str
    currency_pair: str
    trade_direction: str  # 买入/卖出
    notional_amount: float
    price: float
    valuation_pnl: float
    portfolio_name: str
    # 敏感性指标 - 更新为新的8个因子
    delta: float = 0.0
    gamma: float = 0.0
    vega: float = 0.0
    theta: float = 0.0
    rho: float = 0.0
    phi: float = 0.0
    volga: float = 0.0
    vanna: float = 0.0

class FXTransactionDetailRequest(BaseModel):
    """交易明细查询请求"""
    start_date: str
    end_date: str
    dimension_type: str
    dimension_value: str

class FXTransactionDetailResponse(BaseModel):
    """交易明细响应"""
    transactions: List[FXTransactionDetail]

class PnLTrendPoint(BaseModel):
    """损益趋势点"""
    date: str
    valuation_pnl: float
    dimension_value: str = "总计"

class FXTrendResponse(BaseModel):
    """趋势数据响应"""
    trend_data: List[PnLTrendPoint]

class FXFactorTrendRequest(BaseModel):
    """因子趋势数据请求"""
    start_date: str
    end_date: str
    dimension_type: str
    dimension_value: str

class FXFactorTrendPoint(BaseModel):
    """因子趋势点"""
    date: str
    factors: dict = {}  # {factor_code: pnl_contribution}

class FXFactorTrendResponse(BaseModel):
    """因子趋势数据响应"""
    trend_data: List[FXFactorTrendPoint]

# ============ 基础数据接口 ============

@router.get("/products", response_model=FXProductListResponse)
async def get_fx_products():
    """
    获取外汇产品列表
    """
    try:
        # 模拟外汇产品数据
        fx_products = [
            FXProduct(code="FWD01", name="外汇远期", category="forward"),
            FXProduct(code="FWD02", name="外汇远期", category="forward"),
            FXProduct(code="FXSW01", name="外汇掉期", category="swap"),
            FXProduct(code="FXSW02", name="外汇掉期", category="swap"),
            FXProduct(code="FXSPOT", name="外汇即期", category="spot"),
            FXProduct(code="FXOPT", name="外汇期权", category="option"),
            FXProduct(code="CCS", name="货币掉期", category="swap")
        ]
        return FXProductListResponse(products=fx_products)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ 归因分析接口 ============

@router.post("/calculate", response_model=FXAttributionResponse)
async def calculate_fx_attribution(request: FXAttributionRequest):
    """
    计算外汇类损益归因分析
    """
    try:
        # 验证日期范围
        validate_date_range(request.start_date, request.end_date)
        
        # 生成模拟数据
        import random
        import math
        
        details = []
        total_pnl = 0.0
        
        # 根据分组维度生成数据
        if request.group_by == "portfolio":
            # 按账户分组，使用账户名称
            # 定义标准账户列表
            standard_accounts = [
                "外汇即期自营户",
                "外汇即期内部报价户",
                "外汇远期自营户",
                "外汇远期内部报价户",
                "外汇掉期自营户"
            ]
            
            for folder_name in standard_accounts:
                valuation_pnl = random.uniform(-100, 100)
                total_pnl += valuation_pnl
                
                # 生成8个因子
                factors = []
                factor_names = [
                    ("delta", "Delta"),
                    ("gamma", "Gamma"),
                    ("vega", "Vega"),
                    ("theta", "Theta"),
                    ("rho", "Rho"),
                    ("phi", "Phi"),
                    ("volga", "Volga"),
                    ("vanna", "Vanna")
                ]
                
                factor_total = 0.0
                for code, name in factor_names:
                    pnl = random.uniform(-20, 20)
                    factor_total += pnl
                    factors.append(FXFactorDetail(
                        factor_name=name,
                        factor_code=code,
                        start_value=random.uniform(0, 1),
                        end_value=random.uniform(0, 1),
                        delta=random.uniform(-0.5, 0.5),
                        pnl_contribution=pnl
                    ))
                
                unexplained = valuation_pnl - factor_total
                
                # 生成因子数据
                start_factors = {code: random.uniform(0, 1) for code, _ in factor_names}
                end_factors = {code: random.uniform(0, 1) for code, _ in factor_names}
                
                details.append(FXAttributionDetail(
                    dimension_value=folder_name,
                    valuation_pnl=valuation_pnl,
                    factors=factors,
                    unexplained=unexplained,
                    start_date_factors=start_factors,
                    end_date_factors=end_factors
                ))
        
        elif request.group_by == "product":
            # 按产品分组
            product_codes = request.product_codes or ["FWD01", "FXSW01", "FXSPOT"]
            for code in product_codes:
                valuation_pnl = random.uniform(-50, 50)
                total_pnl += valuation_pnl
                
                factors = []
                factor_names = [
                    ("delta", "Delta"), ("gamma", "Gamma"), ("vega", "Vega"),
                    ("theta", "Theta"), ("rho", "Rho"), ("phi", "Phi"),
                    ("volga", "Volga"), ("vanna", "Vanna")
                ]
                
                factor_total = 0.0
                for code_f, name in factor_names:
                    pnl = random.uniform(-10, 10)
                    factor_total += pnl
                    factors.append(FXFactorDetail(
                        factor_name=name,
                        factor_code=code_f,
                        start_value=random.uniform(0, 1),
                        end_value=random.uniform(0, 1),
                        delta=random.uniform(-0.5, 0.5),
                        pnl_contribution=pnl
                    ))
                
                unexplained = valuation_pnl - factor_total
                start_factors = {code_f: random.uniform(0, 1) for code_f, _ in factor_names}
                end_factors = {code_f: random.uniform(0, 1) for code_f, _ in factor_names}
                
                details.append(FXAttributionDetail(
                    dimension_value=code,
                    valuation_pnl=valuation_pnl,
                    factors=factors,
                    unexplained=unexplained,
                    start_date_factors=start_factors,
                    end_date_factors=end_factors
                ))
        
        else:  # currency_pair
            # 按货币对分组
            # 如果请求中指定了货币对，使用指定的；否则使用默认的
            currency_pairs = request.currency_pairs if request.currency_pairs else ["USDCNY", "EURCNY", "GBPCNY", "JPYCNY"]
            for pair in currency_pairs:
                valuation_pnl = random.uniform(-30, 30)
                total_pnl += valuation_pnl
                
                factors = []
                factor_names = [
                    ("delta", "Delta"), ("gamma", "Gamma"), ("vega", "Vega"),
                    ("theta", "Theta"), ("rho", "Rho"), ("phi", "Phi"),
                    ("volga", "Volga"), ("vanna", "Vanna")
                ]
                
                factor_total = 0.0
                for code, name in factor_names:
                    pnl = random.uniform(-5, 5)
                    factor_total += pnl
                    factors.append(FXFactorDetail(
                        factor_name=name,
                        factor_code=code,
                        start_value=random.uniform(0, 1),
                        end_value=random.uniform(0, 1),
                        delta=random.uniform(-0.5, 0.5),
                        pnl_contribution=pnl
                    ))
                
                unexplained = valuation_pnl - factor_total
                start_factors = {code: random.uniform(0, 1) for code, _ in factor_names}
                end_factors = {code: random.uniform(0, 1) for code, _ in factor_names}
                
                details.append(FXAttributionDetail(
                    dimension_value=pair,
                    valuation_pnl=valuation_pnl,
                    factors=factors,
                    unexplained=unexplained,
                    start_date_factors=start_factors,
                    end_date_factors=end_factors
                ))
        
        # 生成趋势数据
        trend_data = []
        from datetime import datetime, timedelta
        start = datetime.strptime(request.start_date, "%Y-%m-%d")
        end = datetime.strptime(request.end_date, "%Y-%m-%d")
        current = start
        while current <= end:
            trend_data.append({
                "date": current.strftime("%Y-%m-%d"),
                "valuation_pnl": random.uniform(-100, 100),
                "dimension_value": "总计"
            })
            current += timedelta(days=7)  # 每周一个数据点
        
        return FXAttributionResponse(
            total_valuation_pnl=total_pnl,
            currency="CNY",
            unit="万元",
            details=details,
            trend_data=trend_data,
            warnings=[]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trend", response_model=FXTrendResponse)
async def get_fx_trend(
    start_date: str,
    end_date: str,
    portfolio_ids: Optional[str] = None,
    product_codes: Optional[str] = None,
    currency_pairs: Optional[str] = None,
    group_by: str = "portfolio"
):
    """
    获取外汇归因趋势数据
    """
    try:
        validate_date_range(start_date, end_date)
        
        import random
        from datetime import datetime, timedelta
        
        trend_data = []
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        current = start
        
        while current <= end:
            trend_data.append(PnLTrendPoint(
                date=current.strftime("%Y-%m-%d"),
                valuation_pnl=random.uniform(-100, 100),
                dimension_value="总计"
            ))
            current += timedelta(days=7)
        
        return FXTrendResponse(trend_data=trend_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/drilldown", response_model=FXDrilldownResponse)
async def get_fx_drilldown(request: FXDrilldownRequest):
    """
    下钻查询因子数据
    """
    try:
        import random
        
        factor_names = [
            "delta", "gamma", "vega", "theta", "rho", "phi", "volga", "vanna"
        ]
        
        start_factors = {code: random.uniform(0, 1) for code in factor_names}
        end_factors = {code: random.uniform(0, 1) for code in factor_names}
        
        return FXDrilldownResponse(
            start_date_factors=start_factors,
            end_date_factors=end_factors
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transaction-details", response_model=FXTransactionDetailResponse)
async def get_fx_transaction_details(request: FXTransactionDetailRequest):
    """
    获取交易明细
    """
    try:
        validate_date_range(request.start_date, request.end_date)
        
        import random
        from datetime import datetime, timedelta
        
        # 生成模拟交易明细数据
        transactions = []
        start = datetime.strptime(request.start_date, "%Y-%m-%d")
        end = datetime.strptime(request.end_date, "%Y-%m-%d")
        
        # 生成20-50条随机交易记录
        num_transactions = random.randint(20, 50)
        
        # 产品名称映射
        product_names = {
            'FX_SPOT': '外汇即期',
            'FX_FORWARD': '外汇远期',
            'FX_SWAP': '外汇掉期',
            'FX_OPTION': '外汇期权',
            'CCS': 'CCS',
            'IRS': 'IRS'
        }
        
        # 货币对列表
        currency_pairs = ['USDCNY', 'EURCNY', 'GBPCNY', 'JPYCNY', 'HKDCNY', 'AUDCNY']
        
        for i in range(num_transactions):
            # 随机交易日期
            days_offset = random.randint(0, (end - start).days)
            trade_date = (start + timedelta(days=days_offset)).strftime("%Y-%m-%d")
            
            # 随机产品
            product_code = random.choice(['FX_SPOT', 'FX_FORWARD', 'FX_SWAP', 'FX_OPTION', 'CCS', 'IRS'])
            product_name = product_names.get(product_code, product_code)
            
            # 随机货币对
            currency_pair = random.choice(currency_pairs)
            
            # 随机方向
            trade_direction = random.choice(['买入', '卖出'])
            
            # 随机金额和价格
            notional_amount = random.uniform(100, 10000)  # 万元
            price = random.uniform(6.5, 7.5)  # 汇率价格
            valuation_pnl = random.uniform(-100, 100)  # 估值损益
            
            # 账户名称 - 从标准账户列表中随机选择
            account_names = [
                '外汇即期自营户',
                '外汇即期内部报价户',
                '外汇远期自营户',
                '外汇远期内部报价户',
                '外汇掉期自营户'
            ]
            portfolio_name = random.choice(account_names)
            
            # 生成敏感性指标（模拟数据）- 更新为新的8个因子
            delta = random.uniform(-1000, 1000)
            gamma = random.uniform(-200, 200)
            vega = random.uniform(-500, 500)
            theta = random.uniform(-100, 100)
            rho = random.uniform(-300, 300)
            phi = random.uniform(-150, 150)
            volga = random.uniform(-80, 80)
            vanna = random.uniform(-50, 50)
            
            transactions.append(FXTransactionDetail(
                transaction_id=f"TXN{str(i+1).zfill(8)}",
                trade_date=trade_date,
                product_code=product_code,
                product_name=product_name,
                currency_pair=currency_pair,
                trade_direction=trade_direction,
                notional_amount=round(notional_amount, 2),
                price=round(price, 4),
                valuation_pnl=round(valuation_pnl, 2),
                portfolio_name=portfolio_name,
                delta=round(delta, 2),
                gamma=round(gamma, 2),
                vega=round(vega, 2),
                theta=round(theta, 2),
                rho=round(rho, 2),
                phi=round(phi, 2),
                volga=round(volga, 2),
                vanna=round(vanna, 2)
            ))
        
        # 按交易日期排序
        transactions.sort(key=lambda x: x.trade_date)
        
        return FXTransactionDetailResponse(transactions=transactions)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/factor-trend", response_model=FXFactorTrendResponse)
async def get_fx_factor_trend(request: FXFactorTrendRequest):
    """
    获取归因分项趋势数据（每个因子每天的贡献）
    """
    try:
        validate_date_range(request.start_date, request.end_date)
        
        import random
        from datetime import datetime, timedelta
        
        # 因子代码列表
        factor_codes = ['delta', 'gamma', 'vega', 'theta', 'rho', 'phi', 'volga', 'vanna']
        
        trend_data = []
        start = datetime.strptime(request.start_date, "%Y-%m-%d")
        end = datetime.strptime(request.end_date, "%Y-%m-%d")
        current = start
        
        while current <= end:
            # 为每个因子生成每日贡献值
            factors = {}
            for code in factor_codes:
                factors[code] = random.uniform(-20, 20)
            
            # 添加无法解释部分
            factors['unexplained'] = random.uniform(-10, 10)
            
            trend_data.append(FXFactorTrendPoint(
                date=current.strftime("%Y-%m-%d"),
                factors=factors
            ))
            current += timedelta(days=1)  # 每天一个数据点
        
        return FXFactorTrendResponse(trend_data=trend_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export")
async def export_fx_excel(
    start_date: str,
    end_date: str,
    portfolio_ids: Optional[str] = None,
    product_codes: Optional[str] = None,
    group_by: str = "portfolio"
):
    """
    导出外汇归因分析 Excel
    """
    try:
        # TODO: 实现 Excel 导出功能
        return {"message": "Excel 导出功能待实现"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

