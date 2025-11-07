/**
 * 外汇类损益归因分析下钻交互模块 - 交易明细
 */

const fxDrilldown = {
    currentDimensionValue: null,
    currentDimensionType: null,
    currentCurrencyPair: null,
    currentStartDate: null,
    currentEndDate: null,

    /**
     * 显示因子详情弹窗（新）
     */
    async showFactorDetails(dimensionValue, dimensionType, currencyPair, startDate, endDate) {
        this.currentDimensionValue = dimensionValue;
        this.currentDimensionType = dimensionType;
        this.currentCurrencyPair = currencyPair || 'USDCNY';
        this.currentStartDate = startDate || window.fxElements?.startDate.value || '';
        this.currentEndDate = endDate || window.fxElements?.endDate.value || '';
        
        // 显示模态框
        const modal = document.getElementById('fxFactorDetailModal');
        if (!modal) {
            console.error('Factor detail modal not found');
            return;
        }
        
        modal.style.display = 'block';
        
        // 显示加载状态
        const tbody = document.getElementById('fxFactorDetailBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="20" class="empty-state">加载中...</td></tr>';
        }
        
        // 从API加载因子详情
        await this.loadFactorDetails();
        
        // 绑定模态框事件
        this.bindFactorModalEvents();
    },

    /**
     * 显示交易明细弹窗（保留原功能）
     */
    async showDrilldown(dimensionValue, dimensionType, hasStartFactors, hasEndFactors) {
        this.currentDimensionValue = dimensionValue;
        this.currentDimensionType = dimensionType;
        
        // 显示模态框
        const modal = document.getElementById('fxDrilldownModal');
        if (!modal) {
            console.error('Transaction detail modal not found');
            return;
        }
        
        modal.style.display = 'block';
        
        // 显示加载状态
        const tbody = document.getElementById('fxTransactionDetailBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="18" class="empty-state">加载中...</td></tr>';
        }
        
        // 从API加载交易明细
        await this.loadTransactionDetails();
        
        // 绑定模态框事件
        this.bindModalEvents();
    },

    /**
     * 从API加载交易明细
     */
    async loadTransactionDetails() {
        try {
            // 获取当前查询参数
            const fxElements = window.fxElements;
            if (!fxElements) return;
            
            const requestData = {
                start_date: fxElements.startDate.value,
                end_date: fxElements.endDate.value,
                dimension_type: this.currentDimensionType || 'portfolio',
                dimension_value: this.currentDimensionValue
            };
            
            const response = await api.getFXTransactionDetails(requestData);
            
            // 更新交易明细表格
            this.updateTransactionTable(response.transactions || []);
            
        } catch (error) {
            console.error('Failed to load transaction details:', error);
            const tbody = document.getElementById('fxTransactionDetailBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="18" class="empty-state">加载失败：' + (error.message || '未知错误') + '</td></tr>';
            }
        }
    },

    /**
     * 更新交易明细表格
     */
    updateTransactionTable(transactions) {
        const tbody = document.getElementById('fxTransactionDetailBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!transactions || transactions.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="18" class="empty-state">暂无交易数据</td>';
            tbody.appendChild(row);
            return;
        }
        
        // 渲染交易明细行
        transactions.forEach(txn => {
            const row = document.createElement('tr');
            
            // 根据估值损益的值设置颜色
            const pnlClass = txn.valuation_pnl > 0 ? 'positive' : txn.valuation_pnl < 0 ? 'negative' : '';
            
            // 敏感性指标列表 - 更新为新的8个因子
            const sensitivityFields = [
                { key: 'delta', value: txn.delta || 0 },
                { key: 'gamma', value: txn.gamma || 0 },
                { key: 'vega', value: txn.vega || 0 },
                { key: 'theta', value: txn.theta || 0 },
                { key: 'rho', value: txn.rho || 0 },
                { key: 'phi', value: txn.phi || 0 },
                { key: 'volga', value: txn.volga || 0 },
                { key: 'vanna', value: txn.vanna || 0 }
            ];
            
            // 生成敏感性指标单元格
            const sensitivityCells = sensitivityFields.map(field => {
                const value = field.value || 0;
                const cellClass = this.getNumberClass(value);
                return `<td class="text-right ${cellClass}">${this.formatNumber(value)}</td>`;
            }).join('');
            
            row.innerHTML = `
                <td>${txn.transaction_id}</td>
                <td>${txn.trade_date}</td>
                <td>${txn.product_code}</td>
                <td>${txn.product_name}</td>
                <td>${txn.currency_pair}</td>
                <td>${txn.trade_direction}</td>
                <td class="text-right">${this.formatNumber(txn.notional_amount)}</td>
                <td class="text-right">${this.formatNumber(txn.price, 4)}</td>
                <td class="text-right ${pnlClass}">${this.formatNumber(txn.valuation_pnl)}</td>
                <td>${txn.portfolio_name}</td>
                ${sensitivityCells}
            `;
            tbody.appendChild(row);
        });
    },

    /**
     * 从API加载因子详情
     */
    async loadFactorDetails() {
        try {
            // 生成模拟因子数据
            const factorData = {
                account: this.currentDimensionValue,
                underlying: this.currentCurrencyPair,
                start_date: this.currentStartDate,
                end_date: this.currentEndDate,
                delta_y: Math.random() * 100 - 50,
                pv01_y: Math.random() * 50 - 25,
                gamma_y: Math.random() * 30 - 15,
                vega_y: Math.random() * 40 - 20,
                theta: Math.random() * 20 - 10,
                delta_t: Math.random() * 10,
                rho: Math.random() * 35 - 17.5,
                phi: Math.random() * 25 - 12.5,
                volga: Math.random() * 15 - 7.5,
                vanna: Math.random() * 18 - 9,
                delta_s: Math.random() * 0.5 - 0.25,
                delta_r: Math.random() * 0.02 - 0.01,
                delta_sigma: Math.random() * 0.1 - 0.05,
                delta_r_dom: Math.random() * 0.015 - 0.0075,
                delta_r_for: Math.random() * 0.015 - 0.0075,
                unexplained: Math.random() * 5 - 2.5
            };
            
            // 计算估值损益（因子总和）
            const valuationPnl = factorData.delta_y + factorData.pv01_y + factorData.gamma_y + 
                                factorData.vega_y + factorData.theta + factorData.rho + 
                                factorData.phi + factorData.volga + factorData.vanna + factorData.unexplained;
            
            // 更新因子详情表格
            this.updateFactorDetailTable(factorData, valuationPnl);
            
        } catch (error) {
            console.error('Failed to load factor details:', error);
            const tbody = document.getElementById('fxFactorDetailBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="20" class="empty-state">加载失败：' + (error.message || '未知错误') + '</td></tr>';
            }
        }
    },

    /**
     * 更新因子详情表格
     */
    updateFactorDetailTable(data, valuationPnl) {
        const tbody = document.getElementById('fxFactorDetailBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.account}</td>
            <td>${data.underlying}</td>
            <td>${data.start_date}</td>
            <td>${data.end_date}</td>
            <td class="text-right ${this.getNumberClass(data.delta_y)}">${this.formatNumber(data.delta_y)}</td>
            <td class="text-right ${this.getNumberClass(data.pv01_y)}">${this.formatNumber(data.pv01_y)}</td>
            <td class="text-right ${this.getNumberClass(data.gamma_y)}">${this.formatNumber(data.gamma_y)}</td>
            <td class="text-right ${this.getNumberClass(data.vega_y)}">${this.formatNumber(data.vega_y)}</td>
            <td class="text-right ${this.getNumberClass(data.theta)}">${this.formatNumber(data.theta)}</td>
            <td class="text-right">${this.formatNumber(data.delta_t, 4)}</td>
            <td class="text-right ${this.getNumberClass(data.rho)}">${this.formatNumber(data.rho)}</td>
            <td class="text-right ${this.getNumberClass(data.phi)}">${this.formatNumber(data.phi)}</td>
            <td class="text-right ${this.getNumberClass(data.volga)}">${this.formatNumber(data.volga)}</td>
            <td class="text-right ${this.getNumberClass(data.vanna)}">${this.formatNumber(data.vanna)}</td>
            <td class="text-right">${this.formatNumber(data.delta_s, 4)}</td>
            <td class="text-right">${this.formatNumber(data.delta_r, 4)}</td>
            <td class="text-right">${this.formatNumber(data.delta_sigma, 4)}</td>
            <td class="text-right">${this.formatNumber(data.delta_r_dom, 4)}</td>
            <td class="text-right">${this.formatNumber(data.delta_r_for, 4)}</td>
            <td class="text-right ${this.getNumberClass(data.unexplained)}">${this.formatNumber(data.unexplained)}</td>
        `;
        tbody.appendChild(row);
        
        // 显示校验信息
        const sumFactors = data.delta_y + data.pv01_y + data.gamma_y + data.vega_y + 
                          data.theta + data.rho + data.phi + data.volga + data.vanna + data.unexplained;
        const validation = document.getElementById('fxFactorValidation');
        if (validation) {
            const isValid = Math.abs(sumFactors - valuationPnl) < 0.01;
            validation.innerHTML = `
                <strong>校验：</strong> 
                因子贡献总和 = ${this.formatNumber(sumFactors)} 万元
                ${isValid ? '<span style="color: var(--success);">✓ 校验通过</span>' : '<span style="color: var(--danger);">✗ 校验失败</span>'}
            `;
        }
    },

    /**
     * 绑定因子详情模态框事件
     */
    bindFactorModalEvents() {
        const modal = document.getElementById('fxFactorDetailModal');
        if (!modal) return;
        
        // 关闭按钮
        const closeBtn = document.getElementById('fxFactorDetailClose');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        // 点击外部关闭
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    },

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        const modal = document.getElementById('fxDrilldownModal');
        if (!modal) return;
        
        // 关闭按钮
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        // 点击外部关闭
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    },

    /**
     * 格式化数字
     */
    formatNumber(value, decimals = 2) {
        if (value === null || value === undefined) return '--';
        return Number(value).toLocaleString('zh-CN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * 获取数字样式类
     */
    getNumberClass(value) {
        if (value > 0) return 'positive';
        if (value < 0) return 'negative';
        return '';
    }
};

// 将fxDrilldown暴露到全局
window.fxDrilldown = fxDrilldown;
