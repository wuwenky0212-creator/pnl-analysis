"""
数据聚合服务
"""

from typing import List
from collections import defaultdict

from api.models import PnLDetail


class AggregationService:
    """数据聚合服务"""
    
    def aggregate_by_dimension(
        self,
        details: List[PnLDetail],
        group_by: str
    ) -> List[PnLDetail]:
        """
        按指定维度聚合损益数据
        
        :param details: 原始损益明细列表
        :param group_by: 聚合维度 (portfolio, asset_class, pnl_component)
        :return: 聚合后的损益明细列表
        """
        if group_by == "portfolio":
            return self._aggregate_by_portfolio(details)
        elif group_by == "asset_class":
            return self._aggregate_by_asset_class(details)
        elif group_by == "pnl_component":
            return self._aggregate_by_pnl_component(details)
        else:
            # 默认不聚合
            return details
    
    def _aggregate_by_portfolio(self, details: List[PnLDetail]) -> List[PnLDetail]:
        """按投资组合聚合（简化示例）"""
        # TODO: 从产品代码映射到投资组合
        # 这里简化为按产品代码分组
        return self._aggregate_by_key(details, "产品")
    
    def _aggregate_by_asset_class(self, details: List[PnLDetail]) -> List[PnLDetail]:
        """按资产大类聚合"""
        # 资产大类映射
        asset_class_map = {
            "BOND01": "固收",
            "BOND03": "固收",
            "STDFW01": "固收",
            "SW01": "利率",
            "SW02": "利率",
            "CPFR01": "利率",
            "FXO01": "利率",
            "FWD01": "汇率",
            "FXO02": "汇率",
            "CCS01": "汇率",
            "AUSW01": "商品",
            "5025242": "货币市场",
            "LEND01": "货币市场"
        }
        
        aggregated = defaultdict(lambda: PnLDetail(
            dimension_value="",
            pnl_interest=0.0,
            pnl_price_diff=0.0,
            pnl_valuation=0.0,
            pnl_amortization=0.0,  # 保留字段但不再使用
            pnl_financing=0.0,
            pnl_fee=0.0,
            total_pnl=0.0,
            percentage=0.0
        ))
        
        for detail in details:
            # 获取资产大类
            asset_class = asset_class_map.get(detail.dimension_value, "其他")
            
            agg_detail = aggregated[asset_class]
            agg_detail.dimension_value = asset_class
            agg_detail.pnl_interest += detail.pnl_interest
            agg_detail.pnl_price_diff += detail.pnl_price_diff
            agg_detail.pnl_valuation += detail.pnl_valuation
            # 摊销损益已移除，不再累加
            agg_detail.pnl_financing += detail.pnl_financing
            agg_detail.pnl_fee += detail.pnl_fee
            agg_detail.total_pnl += detail.total_pnl
        
        return list(aggregated.values())
    
    def _aggregate_by_pnl_component(self, details: List[PnLDetail]) -> List[PnLDetail]:
        """按损益分项聚合"""
        aggregated = []
        
        component_names = [
            ("interest", "利息损益"),
            ("price_diff", "价差损益"),
            ("valuation", "估值损益"),
            ("financing", "融资成本损益"),
            ("fee", "手续费损益")
        ]
        
        for component_key, component_name in component_names:
            total = 0.0
            for detail in details:
                if component_key == "interest":
                    total += detail.pnl_interest
                elif component_key == "price_diff":
                    total += detail.pnl_price_diff
                elif component_key == "valuation":
                    total += detail.pnl_valuation
                elif component_key == "financing":
                    total += detail.pnl_financing
                elif component_key == "fee":
                    total += detail.pnl_fee
            
            # 创建聚合项，只设置对应分项的值
            aggregated.append(PnLDetail(
                dimension_value=component_name,
                pnl_interest=total if component_key == "interest" else 0.0,
                pnl_price_diff=total if component_key == "price_diff" else 0.0,
                pnl_valuation=total if component_key == "valuation" else 0.0,
                pnl_amortization=0.0,  # 摊销损益已移除
                pnl_financing=total if component_key == "financing" else 0.0,
                pnl_fee=total if component_key == "fee" else 0.0,
                total_pnl=total,
                percentage=0.0
            ))
        
        return aggregated
    
    def _aggregate_by_key(self, details: List[PnLDetail], key_prefix: str) -> List[PnLDetail]:
        """按通用键值聚合"""
        # 简化实现，返回原列表
        return details






