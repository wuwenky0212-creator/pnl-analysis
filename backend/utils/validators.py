"""
数据验证工具
"""

from datetime import datetime
from typing import Tuple


def validate_date_range(start_date: str, end_date: str) -> Tuple[datetime, datetime]:
    """
    验证日期范围
    
    :param start_date: 起始日期 (YYYY-MM-DD)
    :param end_date: 结束日期 (YYYY-MM-DD)
    :return: (起始日期对象, 结束日期对象)
    :raises ValueError: 如果日期格式错误或范围无效
    """
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        if end < start:
            raise ValueError("结束日期必须大于或等于起始日期")
        
        # 检查结束日期不超过今天
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        if end > today:
            raise ValueError("结束日期不能超过当前日期")
        
        return start, end
        
    except ValueError as e:
        raise ValueError(f"日期格式错误或范围无效: {str(e)}")









