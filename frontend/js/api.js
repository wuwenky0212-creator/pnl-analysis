/**
 * API 调用模块
 */

// API基础URL - 自动检测环境
// 优先级：环境变量 > 自动检测
const API_BASE_URL = (() => {
    // 1. 优先使用环境变量（如果设置了）
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }
    
    // 2. 检查是否有后端URL配置（Railway等平台）
    const backendUrl = document.querySelector('meta[name="backend-url"]')?.content;
    if (backendUrl) {
        return backendUrl + '/api';
    }
    
    // 3. 如果当前是localhost或127.0.0.1，使用本地开发地址
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8002/api';
    }
    
    // 4. 公网部署：使用相对路径（通过Nginx/反向代理）
    // 或者使用当前域名（如果前后端同域）
    return '/api';
})();

class APIClient {
    /**
     * 发送 GET 请求
     */
    async get(url, params = {}) {
        try {
            let fullUrl = `${API_BASE_URL}${url}`;
            const queryString = new URLSearchParams(params).toString();
            if (queryString) {
                fullUrl += `?${queryString}`;
            }
            
            const response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }

    /**
     * 发送 POST 请求
     */
    async post(url, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    /**
     * 获取投资组合列表
     */
    async getPortfolios() {
        return await this.get('/portfolios');
    }

    /**
     * 获取产品列表
     */
    async getProducts(portfolioId = null) {
        const params = portfolioId ? { portfolio_id: portfolioId } : {};
        return await this.get('/products', params);
    }

    /**
     * 获取黄金价格
     */
    async getGoldPrice() {
        return await this.get('/gold-price');
    }

    /**
     * 计算损益
     */
    async calculatePnL(requestData) {
        return await this.post('/pnl/calculate', requestData);
    }

    /**
     * 获取损益趋势
     */
    async getPnLTrend(params) {
        return await this.get('/pnl/trend', params);
    }

    /**
     * 获取交易明细
     */
    async getTransactionDetails(requestData) {
        return await this.post('/pnl/transaction-details', requestData);
    }

    /**
     * 导出 Excel
     */
    async exportExcel(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_BASE_URL}/pnl/export?${queryString}`;
            
            // 下载文件
            window.location.href = url;
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }

    // ============ 外汇类损益归因分析接口 ============

    /**
     * 获取外汇产品列表
     */
    async getFXProducts() {
        return await this.get('/fx-attribution/products');
    }

    /**
     * 计算外汇归因分析
     */
    async calculateFXAttribution(requestData) {
        return await this.post('/fx-attribution/calculate', requestData);
    }

    /**
     * 获取外汇归因趋势数据
     */
    async getFXTrend(params) {
        return await this.get('/fx-attribution/trend', params);
    }

    /**
     * 下钻查询因子数据
     */
    async getFXDrilldown(requestData) {
        return await this.post('/fx-attribution/drilldown', requestData);
    }

    /**
     * 获取归因分项趋势数据（每个因子每天的贡献）
     */
    async getFXFactorTrend(requestData) {
        return await this.post('/fx-attribution/factor-trend', requestData);
    }

    /**
     * 获取交易明细
     */
    async getFXTransactionDetails(requestData) {
        return await this.post('/fx-attribution/transaction-details', requestData);
    }

    /**
     * 导出外汇归因分析 Excel
     */
    async exportFXExcel(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_BASE_URL}/fx-attribution/export?${queryString}`;
            
            // 下载文件
            window.location.href = url;
        } catch (error) {
            console.error('FX Export failed:', error);
            throw error;
        }
    }
}

// 创建全局 API 客户端实例
const api = new APIClient();

// 暴露到全局作用域
if (typeof window !== 'undefined') {
    window.api = api;
}

