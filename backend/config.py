"""
配置文件
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal

class Settings(BaseSettings):
    """应用配置"""
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8002
    DEBUG: bool = True
    
    # 数据配置
    DATA_FORMAT: Literal["mock", "database"] = "mock"
    
    # 默认设置
    DEFAULT_CURRENCY: str = "CNY"
    DEFAULT_UNIT: str = "万元"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

