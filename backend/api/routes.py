"""
API 路由定义
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime

from api.models import (
    PnLCalculateRequest, PnLCalculateResponse,
    PnLTrendResponse, GoldPriceResponse,
    PortfolioListResponse, ProductListResponse,
    TransactionDetailRequest, TransactionDetailResponse, TransactionDetail
)
from services.calculation import CalculationService
from services.aggregation import AggregationService
from data.mock_data import MockDataProvider
from utils.validators import validate_date_range

router = APIRouter()

# ============ 数据提供商 ============
mock_data = MockDataProvider()

# ============ 基础数据接口 ============

@router.get("/gold-price", response_model=GoldPriceResponse)
async def get_gold_price():
    """
    获取黄金价格（模拟数据）
    """
    try:
        price_data = mock_data.get_gold_price()
        return GoldPriceResponse(**price_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/portfolios", response_model=PortfolioListResponse)
async def get_portfolios():
    """
    获取投资组合列表
    """
    try:
        portfolios = mock_data.get_portfolios()
        return PortfolioListResponse(portfolios=portfolios)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products", response_model=ProductListResponse)
async def get_products(portfolio_id: Optional[str] = None):
    """
    获取产品列表
    参数: portfolio_id - 可选的投资组合ID过滤
    """
    try:
        products = mock_data.get_products(portfolio_id)
        return ProductListResponse(products=products)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ 损益计算接口 ============

@router.post("/pnl/calculate", response_model=PnLCalculateResponse)
async def calculate_pnl(request: PnLCalculateRequest):
    """
    计算损益数据
    
    根据指定的参数计算投资组合的损益：
    - 分析方法：按市价或按会计分类
    - 时间区间：起始日期到结束日期
    - 过滤条件：投资组合和产品
    - 分组维度：按投资组合、资产大类或损益分项
    """
    try:
        # 验证日期范围
        validate_date_range(request.start_date, request.end_date)
        
        # 创建计算服务实例
        calc_service = CalculationService(mock_data)
        
        # 执行计算
        result = calc_service.calculate_pnl(
            analysis_type=request.analysis_type,
            start_date=request.start_date,
            end_date=request.end_date,
            portfolio_ids=request.portfolio_ids,
            product_codes=request.product_codes
        )
        
        # 创建聚合服务实例
        agg_service = AggregationService()
        
        # 按指定维度聚合
        aggregated_details = agg_service.aggregate_by_dimension(
            result["details"],
            request.group_by
        )
        
        # 计算百分比
        total_pnl = result["total_pnl"]
        for detail in aggregated_details:
            if total_pnl != 0:
                detail.percentage = (detail.total_pnl / total_pnl) * 100
            else:
                detail.percentage = 0.0
        
        return PnLCalculateResponse(
            total_pnl=total_pnl,
            currency="CNY",
            unit="万元",
            details=aggregated_details,
            warnings=result.get("warnings", [])
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pnl/trend", response_model=PnLTrendResponse)
async def get_pnl_trend(
    start_date: str,
    end_date: str,
    portfolio_ids: Optional[str] = None,
    product_codes: Optional[str] = None,
    group_by: str = "portfolio"
):
    """
    获取损益趋势数据（用于折线图）
    
    参数:
    - start_date: 起始日期 (YYYY-MM-DD)
    - end_date: 结束日期 (YYYY-MM-DD)
    - portfolio_ids: 投资组合ID，逗号分隔（可选）
    - product_codes: 产品代码，逗号分隔（可选）
    - group_by: 分组维度
    """
    try:
        validate_date_range(start_date, end_date)
        
        # 解析列表参数
        portfolio_list = portfolio_ids.split(",") if portfolio_ids else []
        product_list = product_codes.split(",") if product_codes else []
        
        calc_service = CalculationService(mock_data)
        trend_result = calc_service.calculate_trend(
            start_date=start_date,
            end_date=end_date,
            portfolio_ids=portfolio_list,
            product_codes=product_list
        )
        
        # 确保返回的数据符合模型要求
        validated_trend_data = []
        for item in trend_result:
            # 确保total_pnl存在，如果没有则使用pnl，如果都没有则默认为0
            if 'total_pnl' not in item or item.get('total_pnl') is None:
                if 'pnl' in item and item.get('pnl') is not None:
                    item['total_pnl'] = item['pnl']
                else:
                    item['total_pnl'] = 0.0
            # 确保所有必需字段都存在
            if 'pnl_interest' not in item:
                item['pnl_interest'] = 0.0
            if 'pnl_price_diff' not in item:
                item['pnl_price_diff'] = 0.0
            if 'pnl_valuation' not in item:
                item['pnl_valuation'] = 0.0
            if 'pnl_fee' not in item:
                item['pnl_fee'] = 0.0
            validated_trend_data.append(PnLTrendPoint(**item))
        
        return PnLTrendResponse(trend_data=validated_trend_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pnl/export")
async def export_pnl_excel(
    start_date: str,
    end_date: str,
    analysis_type: str = "mark_to_market",
    portfolio_ids: Optional[str] = None,
    product_codes: Optional[str] = None,
    group_by: str = "portfolio"
):
    """
    导出 Excel 报告
    
    参数与 /pnl/calculate 接口相同
    返回: Excel 文件
    """
    try:
        # TODO: 实现 Excel 导出功能
        # 这里需要安装 openpyxl 或 xlsxwriter
        
        # 临时返回提示信息
        return {"message": "Excel 导出功能待实现"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pnl/transaction-details", response_model=TransactionDetailResponse)
async def get_transaction_details(request: TransactionDetailRequest):
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
            'fwd01': '外汇远期',
            'fxspot': '外汇即期',
            'fx_spot': '外汇即期',
            'fxsw01': '外汇掉期',
            'fxsw02': '外汇掉期',
            'fxo01': '外汇期权',
            'fxo02': '外汇期权',
            'ccs01': 'CCS',
            'sw01': 'IRS',
            'sw02': 'IRS',
            'bond01': '债券',
            'bond03': '债券',
            'cb01': '可转债',
            'lend01': '贷款',
            'cpfr01': 'CPFR'
        }
        
        # 投组名称映射
        portfolio_names = {
            'all': '全机构',
            'fx_spot': '外汇即期投组',
            'derivative': '衍生品投组',
            'ir': '利率投组',
            'option': '期权投组'
        }
        
        # 根据维度类型和维度值生成交易
        portfolio_name = request.dimension_value if request.dimension_type == 'portfolio' else portfolio_names.get('all', '全机构')
        
        # 如果指定了投组，生成对应的产品代码
        product_codes_list = []
        if request.dimension_type == 'portfolio':
            if '外汇即期' in portfolio_name or 'fx_spot' in portfolio_name.lower():
                product_codes_list = ['fwd01', 'fxspot', 'fx_spot']
            elif '衍生品' in portfolio_name or 'derivative' in portfolio_name.lower():
                product_codes_list = ['ccs01', 'fxsw01', 'fxsw02']
            elif '利率' in portfolio_name or 'ir' in portfolio_name.lower():
                product_codes_list = ['bond01', 'bond03', 'sw01', 'sw02', 'cb01', 'lend01']
            elif '期权' in portfolio_name or 'option' in portfolio_name.lower():
                product_codes_list = ['fxo01', 'fxo02', 'cpfr01']
            else:
                product_codes_list = ['fwd01', 'fxspot', 'fxsw01', 'fxo01', 'sw01']
        elif request.dimension_type == 'product':
            product_codes_list = [request.dimension_value]
        else:
            product_codes_list = ['fwd01', 'fxspot', 'fxsw01', 'fxo01', 'sw01']
        
        for i in range(num_transactions):
            # 随机交易日期
            days_offset = random.randint(0, (end - start).days)
            trade_date = (start + timedelta(days=days_offset)).strftime("%Y-%m-%d")
            
            # 随机产品
            product_code = random.choice(product_codes_list)
            product_name = product_names.get(product_code.lower(), product_code)
            
            # 随机方向
            trade_direction = random.choice(['买入', '卖出'])
            
            # 随机金额和价格
            notional_amount = random.uniform(100, 10000)  # 万元
            price = random.uniform(6.5, 7.5) if 'fx' in product_code.lower() or 'ccs' in product_code.lower() else random.uniform(100, 1000)
            
            # 随机各分项损益
            pnl_interest = random.uniform(-50, 50)
            pnl_price_diff = random.uniform(-30, 30)
            pnl_valuation = random.uniform(-40, 40)
            pnl_financing = random.uniform(-20, 20)
            pnl_fee = random.uniform(-10, 10)
            total_pnl = pnl_interest + pnl_price_diff + pnl_valuation + pnl_financing + pnl_fee
            
            transactions.append(TransactionDetail(
                transaction_id=f"TXN{str(i+1).zfill(8)}",
                trade_date=trade_date,
                product_code=product_code,
                product_name=product_name,
                currency_pair=None,
                trade_direction=trade_direction,
                notional_amount=round(notional_amount, 2),
                price=round(price, 4) if price else None,
                pnl_interest=round(pnl_interest, 2),
                pnl_price_diff=round(pnl_price_diff, 2),
                pnl_valuation=round(pnl_valuation, 2),
                pnl_financing=round(pnl_financing, 2),
                pnl_fee=round(pnl_fee, 2),
                total_pnl=round(total_pnl, 2),
                portfolio_name=portfolio_name
            ))
        
        # 按交易日期排序
        transactions.sort(key=lambda x: x.trade_date)
        
        return TransactionDetailResponse(transactions=transactions)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






