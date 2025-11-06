/**
 * 外汇类损益归因分析下钻交互模块 - 交易明细
 */

const fxDrilldown = {
    currentDimensionValue: null,
    currentDimensionType: null,

    /**
     * 显示交易明细弹窗
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
            tbody.innerHTML = '<tr><td colspan="21" class="empty-state">加载中...</td></tr>';
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
                tbody.innerHTML = '<tr><td colspan="21" class="empty-state">加载失败：' + (error.message || '未知错误') + '</td></tr>';
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
            row.innerHTML = '<td colspan="21" class="empty-state">暂无交易数据</td>';
            tbody.appendChild(row);
            return;
        }
        
        // 渲染交易明细行
        transactions.forEach(txn => {
            const row = document.createElement('tr');
            
            // 根据估值损益的值设置颜色
            const pnlClass = txn.valuation_pnl > 0 ? 'positive' : txn.valuation_pnl < 0 ? 'negative' : '';
            
            // 敏感性指标列表
            const sensitivityFields = [
                { key: 'delta', value: txn.delta || 0 },
                { key: 'vega', value: txn.vega || 0 },
                { key: 'gamma', value: txn.gamma || 0 },
                { key: 'theta', value: txn.theta || 0 },
                { key: 'rho', value: txn.rho || 0 },
                { key: 'vanna', value: txn.vanna || 0 },
                { key: 'charm', value: txn.charm || 0 },
                { key: 'veta', value: txn.veta || 0 },
                { key: 'vomma', value: txn.vomma || 0 },
                { key: 'speed', value: txn.speed || 0 },
                { key: 'theta_decay', value: txn.theta_decay || 0 }
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
