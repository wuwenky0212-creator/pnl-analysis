"""
模拟数据提供器
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from api.models import Portfolio, Product


class MockDataProvider:
    """模拟数据提供器"""
    
    def __init__(self):
        """初始化数据"""
        self._portfolios = self._init_portfolios()
        self._products = self._init_products()
        self._positions_cache = {}
    
    def get_gold_price(self) -> Dict[str, Any]:
        """获取黄金价格"""
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "price": 450.50,
            "currency": "CNY"
        }
    
    def get_portfolios(self) -> List[Portfolio]:
        """获取投资组合列表"""
        return self._portfolios
    
    def get_products(self, portfolio_id: Optional[str] = None) -> List[Product]:
        """获取产品列表"""
        products = self._products
        if portfolio_id:
            products = [p for p in products if p.portfolio_id == portfolio_id]
        return products
    
    def get_positions(
        self,
        start_date: str,
        end_date: str,
        portfolio_ids: List[str],
        product_codes: List[str]
    ) -> List[Dict[str, Any]]:
        """
        获取持仓数据
        
        :param start_date: 起始日期
        :param end_date: 结束日期
        :param portfolio_ids: 投资组合ID列表
        :param product_codes: 产品代码列表
        :return: 持仓数据列表
        """
        # 生成模拟持仓数据
        positions = []
        
        # 默认产品列表
        default_products = product_codes if product_codes else [
            "BOND01", "SW01", "FWD01", "CCS01", "AUSW01", "5025242"
        ]
        
        for i, product_code in enumerate(default_products):
            position = self._generate_mock_position(product_code, start_date, end_date)
            positions.append(position)
        
        return positions
    
    def _init_portfolios(self) -> List[Portfolio]:
        """初始化投资组合数据（根据Excel表格）"""
        return [
            # 融资业务相关
            Portfolio(
                id="HFZBFBFCA001",
                name="农银理财01",
                type="investment",
                ledger_code="HFZBFBFCA001",
                account_name="农银理财01",
                bookkeeping_structure="银行账户",
                account_property="FVOCI",
                accounting_classification="FVOCI",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="HFZBFBFCA002",
                name="同业存单02",
                type="investment",
                ledger_code="HFZBFBFCA002",
                account_name="同业存单02",
                bookkeeping_structure="银行账户",
                account_property="FVOCI",
                accounting_classification="FVOCI",
                pnl_currency="CNY"
            ),
            # 投资相关
            Portfolio(
                id="HFZBTBOCBOT102",
                name="债券承销",
                type="investment",
                ledger_code="HFZBTBOCBOT102",
                account_name="债券承销",
                bookkeeping_structure="交易账户",
                account_property="FVTPTL",
                accounting_classification="FVTPTL",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="CNYFUTURE",
                name="国债期货",
                type="investment",
                ledger_code="CNYFUTURE",
                account_name="国债期货",
                bookkeeping_structure="交易账户",
                account_property="FVTPTL",
                accounting_classification="FVTPTL",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="HFZBICIIA005",
                name="ABS经营组合005",
                type="investment",
                ledger_code="HFZBICIIA005",
                account_name="ABS经营组合005",
                bookkeeping_structure="交易账户",
                account_property="FVOCI",
                accounting_classification="FVOCI",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="HFZBFIFDA001",
                name="MBS经营组合006",
                type="investment",
                ledger_code="HFZBFIFDA001",
                account_name="MBS经营组合006",
                bookkeeping_structure="交易账户",
                account_property="FVOCI",
                accounting_classification="FVOCI",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="HFZBFIFICH001",
                name="可出售基金01",
                type="investment",
                ledger_code="HFZBFIFICH001",
                account_name="可出售基金01",
                bookkeeping_structure="交易账户",
                account_property="FVOCI",
                accounting_classification="FVOCI",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="HFZBFIFICH002",
                name="可出售债券基金02",
                type="investment",
                ledger_code="HFZBFIFICH002",
                account_name="可出售债券基金02",
                bookkeeping_structure="交易账户",
                account_property="FVOCI",
                accounting_classification="FVOCI",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="HFZBFIFICH003",
                name="持有到期企业债01",
                type="investment",
                ledger_code="HFZBFIFICH003",
                account_name="持有到期企业债01",
                bookkeeping_structure="交易账户",
                account_property="AMC",
                accounting_classification="AMC",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="HFZBFIFICH004",
                name="美元可出售企业债",
                type="investment",
                ledger_code="HFZBFIFICH004",
                account_name="美元可出售企业债",
                bookkeeping_structure="交易账户",
                account_property="FVOCI",
                accounting_classification="FVOCI",
                pnl_currency="USD"
            ),
            Portfolio(
                id="HFZBTIRCIAN101",
                name="TRS.收益互换联贷03",
                type="investment",
                ledger_code="HFZBTIRCIAN101",
                account_name="TRS.收益互换联贷03",
                bookkeeping_structure="交易账户",
                account_property="FVTPTL",
                accounting_classification="FVTPTL",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="shymalCNY01",
                name="本币SH",
                type="investment",
                ledger_code="shymalCNY01",
                account_name="本币SH",
                bookkeeping_structure="交易账户",
                account_property="FVTPTL",
                accounting_classification="FVTPTL",
                pnl_currency="CNY"
            ),
            Portfolio(
                id="shymalUSD01",
                name="shymalUSD01",
                type="investment",
                ledger_code="shymalUSD01",
                account_name="shymalUSD01",
                bookkeeping_structure="交易账户",
                account_property="FVTPTL",
                accounting_classification="FVTPTL",
                pnl_currency="USD"
            ),
        ]
    
    def _init_products(self) -> List[Product]:
        """初始化产品数据"""
        return [
            Product(code="BOND01", name="债券交易", asset_class="固收", portfolio_id="FM001"),
            Product(code="BOND03", name="标债远期", asset_class="固收", portfolio_id="FM001"),
            Product(code="CB01", name="含权债", asset_class="固收", portfolio_id="FM001"),
            Product(code="SW01", name="利率互换", asset_class="利率", portfolio_id="FM002"),
            Product(code="SW02", name="利率互换", asset_class="利率", portfolio_id="FM002"),
            Product(code="CPFR01", name="利率期权", asset_class="利率", portfolio_id="FM002"),
            Product(code="FWD01", name="外汇远期", asset_class="汇率", portfolio_id="FM003"),
            Product(code="FXO01", name="外汇期权", asset_class="汇率", portfolio_id="FM003"),
            Product(code="FXO02", name="外汇期权", asset_class="汇率", portfolio_id="FM003"),
            Product(code="CCS01", name="汇率互换", asset_class="汇率", portfolio_id="FM003"),
            Product(code="AUSW01", name="黄金掉期", asset_class="商品", portfolio_id="FM004"),
            Product(code="5025242", name="货币市场拆借", asset_class="货币市场", portfolio_id=None),
            Product(code="LEND01", name="借贷", asset_class="货币市场", portfolio_id=None),
        ]
    
    def _generate_mock_position(
        self,
        product_code: str,
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """
        生成模拟持仓数据
        
        :param product_code: 产品代码
        :param start_date: 起始日期
        :param end_date: 结束日期
        :return: 持仓数据字典
        """
        import random
        
        # 解析日期
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        days = (end - start).days
        
        # 基础参数
        base_principal = 1000.0 + random.uniform(-200, 200)
        base_rate = 0.03 + random.uniform(-0.01, 0.01)
        
        # 根据产品类型设置不同的参数
        if product_code in ["BOND01", "BOND03", "CB01"]:
            # 债券类
            interest_rate = base_rate
            principal = base_principal
            current_price = 100.0 + random.uniform(-5, 5)
            cost_price = 100.0 + random.uniform(-2, 2)
            quantity = principal / 100.0
            
        elif product_code in ["SW01", "SW02", "CCS01"]:
            # 互换类
            interest_rate = base_rate + random.uniform(0, 0.005)
            principal = base_principal
            current_price = 0.0
            cost_price = 0.0
            quantity = 1.0
            
        elif product_code in ["FWD01", "FXO01", "FXO02"]:
            # 外汇类
            interest_rate = 0.0
            principal = base_principal * 6.5  # USD -> CNY
            current_price = 6.5 + random.uniform(-0.2, 0.2)
            cost_price = 6.5 + random.uniform(-0.1, 0.1)
            quantity = principal / current_price
            
        elif product_code in ["AUSW01"]:
            # 商品类
            interest_rate = base_rate
            principal = base_principal
            current_price = 450.0 + random.uniform(-20, 20)
            cost_price = 450.0 + random.uniform(-10, 10)
            quantity = principal / current_price
            
        else:
            # 货币市场类
            interest_rate = base_rate
            principal = base_principal
            current_price = 1.0
            cost_price = 1.0
            quantity = principal
        
        # 计算估值（简化）
        start_valuation = principal * (1 - 0.05)
        end_valuation = principal * (1 + random.uniform(-0.02, 0.02))
        
        # 计算其他参数
        financing_rate = 0.02 if product_code in ["BOND01", "LEND01"] else 0.0
        amortization_rate = 0.005 if product_code in ["BOND01", "CB01"] else 0.0
        fees = random.uniform(0, 10)
        
        # 生成交易历史（WAC计算用）
        trade_history = []
        for i in range(3):
            trade_history.append({
                "price": cost_price + random.uniform(-1, 1),
                "quantity": quantity / 3 + random.uniform(-0.1, 0.1)
            })
        
        position = {
            "product_code": product_code,
            "product_type": product_code,
            "product_name": self._get_product_name(product_code),
            "principal": principal,
            "quantity": quantity,
            "interest_rate": interest_rate,
            "current_price": current_price,
            "cost_price": cost_price,
            "start_valuation": start_valuation,
            "end_valuation": end_valuation,
            "financing_rate": financing_rate,
            "amortization_rate": amortization_rate,
            "book_value": principal,
            "fees": fees,
            "trade_history": trade_history,
            "portfolio_id": self._get_portfolio_id(product_code)
        }
        
        return position
    
    def _get_product_name(self, product_code: str) -> str:
        """根据产品代码获取产品名称"""
        product_map = {
            "BOND01": "债券交易",
            "BOND03": "标债远期",
            "CB01": "含权债",
            "SW01": "利率互换",
            "SW02": "利率互换",
            "CPFR01": "利率期权",
            "FWD01": "外汇远期",
            "FXO01": "外汇期权",
            "FXO02": "外汇期权",
            "CCS01": "汇率互换",
            "AUSW01": "黄金掉期",
            "5025242": "货币市场拆借",
            "LEND01": "借贷"
        }
        return product_map.get(product_code, product_code)
    
    def _get_portfolio_id(self, product_code: str) -> str:
        """根据产品代码获取投资组合ID"""
        portfolio_map = {
            "BOND01": "FM001",
            "BOND03": "FM001",
            "CB01": "FM001",
            "SW01": "FM002",
            "SW02": "FM002",
            "CPFR01": "FM002",
            "FWD01": "FM003",
            "FXO01": "FM003",
            "FXO02": "FM003",
            "CCS01": "FM003",
            "AUSW01": "FM004",
            "5025242": None,
            "LEND01": None
        }
        return portfolio_map.get(product_code, "FM001")






