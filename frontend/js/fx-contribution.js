/**
 * 外汇类损益归因分析贡献度查看模块
 */

const fxContribution = {
    /**
     * 显示贡献度弹窗
     */
    showContribution(dimensionValue, dimensionType = 'portfolio') {
        // 显示模态框
        const modal = document.getElementById('fxContributionModal');
        if (!modal) {
            console.error('Contribution modal not found');
            return;
        }
        
        modal.style.display = 'block';
        
        // 显示加载状态
        const content = document.getElementById('fxContributionContent');
        if (content) {
            content.innerHTML = '<p style="padding: 20px; color: var(--text-secondary);">加载中...</p>';
        }
        
        // 从数据中获取贡献度信息
        if (dimensionType === 'currency_pair') {
            this.loadCurrencyPairContributionData(dimensionValue);
        } else {
            this.loadContributionData(dimensionValue);
        }
        
        // 绑定模态框事件
        this.bindModalEvents();
    },

    /**
     * 加载货币对贡献度数据
     */
    loadCurrencyPairContributionData(currencyPair) {
        try {
            // 从全局状态中获取currencyPair数据
            const currencyPairData = window.fxState?.fxData?.currencyPair;
            if (!currencyPairData || !currencyPairData.details) {
                throw new Error('暂无数据');
            }
            
            // 查找该货币对的数据（可能需要汇总）
            let currencyPairDetail = null;
            const matchingDetails = [];
            
            currencyPairData.details.forEach(detail => {
                if (detail.dimension_value === currencyPair) {
                    matchingDetails.push(detail);
                }
            });
            
            if (matchingDetails.length === 0) {
                throw new Error('未找到该货币对的数据');
            }
            
            // 如果有多条数据，需要汇总
            if (matchingDetails.length === 1) {
                currencyPairDetail = matchingDetails[0];
            } else {
                // 汇总多条数据
                currencyPairDetail = {
                    dimension_value: currencyPair,
                    valuation_pnl: 0,
                    factors: {},
                    unexplained: 0
                };
                
                matchingDetails.forEach(detail => {
                    currencyPairDetail.valuation_pnl += detail.valuation_pnl || 0;
                    currencyPairDetail.unexplained += detail.unexplained || 0;
                    
                    (detail.factors || []).forEach(factor => {
                        if (!currencyPairDetail.factors[factor.factor_code]) {
                            currencyPairDetail.factors[factor.factor_code] = {
                                factor_code: factor.factor_code,
                                factor_name: factor.factor_name,
                                pnl_contribution: 0
                            };
                        }
                        currencyPairDetail.factors[factor.factor_code].pnl_contribution += factor.pnl_contribution || 0;
                    });
                });
            }
            
            // 更新贡献度显示
            this.updateContributionDisplay(currencyPairDetail, currencyPair, '货币对');
            
        } catch (error) {
            console.error('Failed to load currency pair contribution data:', error);
            const content = document.getElementById('fxContributionContent');
            if (content) {
                content.innerHTML = `<p style="padding: 20px; color: var(--danger);">加载失败：${error.message || '未知错误'}</p>`;
            }
        }
    },

    /**
     * 加载贡献度数据（投组/账户）
     */
    loadContributionData(dimensionValue) {
        try {
            // 从全局状态中获取portfolio数据
            const portfolioData = window.fxState?.fxData?.portfolio;
            if (!portfolioData || !portfolioData.details) {
                throw new Error('暂无数据');
            }
            
            // 查找该维度值的数据（可能需要汇总）
            let portfolioDetail = null;
            const matchingDetails = [];
            
            portfolioData.details.forEach(detail => {
                // 尝试投组名称映射
                const mappedPortfolioName = window.mapFXPortfolioName ? window.mapFXPortfolioName(detail.dimension_value) : detail.dimension_value;
                // 尝试账户名称映射
                const mappedAccountName = window.mapFXAccountName ? window.mapFXAccountName(detail.dimension_value) : detail.dimension_value;
                
                if (mappedPortfolioName === dimensionValue || mappedAccountName === dimensionValue || detail.dimension_value === dimensionValue) {
                    matchingDetails.push(detail);
                }
            });
            
            if (matchingDetails.length === 0) {
                throw new Error('未找到该维度的数据');
            }
            
            // 如果有多条数据，需要汇总
            if (matchingDetails.length === 1) {
                portfolioDetail = matchingDetails[0];
            } else {
                // 汇总多条数据
                portfolioDetail = {
                    dimension_value: dimensionValue,
                    valuation_pnl: 0,
                    factors: {},
                    unexplained: 0
                };
                
                matchingDetails.forEach(detail => {
                    portfolioDetail.valuation_pnl += detail.valuation_pnl || 0;
                    portfolioDetail.unexplained += detail.unexplained || 0;
                    
                    (detail.factors || []).forEach(factor => {
                        if (!portfolioDetail.factors[factor.factor_code]) {
                            portfolioDetail.factors[factor.factor_code] = {
                                factor_code: factor.factor_code,
                                factor_name: factor.factor_name,
                                pnl_contribution: 0
                            };
                        }
                        portfolioDetail.factors[factor.factor_code].pnl_contribution += factor.pnl_contribution || 0;
                    });
                });
            }
            
            // 更新贡献度显示
            this.updateContributionDisplay(portfolioDetail, dimensionValue, '维度');
            
        } catch (error) {
            console.error('Failed to load contribution data:', error);
            const content = document.getElementById('fxContributionContent');
            if (content) {
                content.innerHTML = `<p style="padding: 20px; color: var(--danger);">加载失败：${error.message || '未知错误'}</p>`;
            }
        }
    },

    /**
     * 更新贡献度显示（饼图+表格）
     */
    updateContributionDisplay(detail, dimensionValue, dimensionType = '投组') {
        const content = document.getElementById('fxContributionContent');
        if (!content) return;
        
        // 获取因子数据
        const factors = [];
        if (Array.isArray(detail.factors)) {
            detail.factors.forEach(factor => {
                factors.push({
                    code: factor.factor_code,
                    name: factor.factor_name || this.getFactorDisplayName(factor.factor_code),
                    value: Math.abs(factor.pnl_contribution || 0)
                });
            });
        } else if (detail.factors && typeof detail.factors === 'object') {
            Object.values(detail.factors).forEach(factor => {
                if (factor && factor.factor_code) {
                    factors.push({
                        code: factor.factor_code,
                        name: factor.factor_name || this.getFactorDisplayName(factor.factor_code),
                        value: Math.abs(factor.pnl_contribution || 0)
                    });
                }
            });
        }
        
        // 添加无法解释部分
        const unexplained = Math.abs(detail.unexplained || 0);
        if (unexplained > 0) {
            factors.push({
                code: 'unexplained',
                name: '无法解释部分',
                value: unexplained
            });
        }
        
        // 计算总贡献度
        const totalContribution = factors.reduce((sum, f) => sum + f.value, 0);
        
        // 计算百分比并排序，同时获取实际PNL值
        const contributionData = factors.map(f => {
            // 获取实际PNL值（可能为负）
            let actualPnl = 0;
            if (f.code === 'unexplained') {
                actualPnl = detail.unexplained || 0;
            } else {
                if (Array.isArray(detail.factors)) {
                    const factor = detail.factors.find(fac => fac.factor_code === f.code);
                    actualPnl = factor ? (factor.pnl_contribution || 0) : 0;
                } else if (detail.factors && typeof detail.factors === 'object' && detail.factors[f.code]) {
                    actualPnl = detail.factors[f.code].pnl_contribution || 0;
                }
            }
            
            return {
                ...f,
                actualPnl: actualPnl,
                percentage: totalContribution > 0 ? (f.value / totalContribution * 100) : 0
            };
        }).sort((a, b) => b.value - a.value);
        
        // 生成HTML
        let html = `
            <div style="padding: 20px;">
                <h4 style="margin-bottom: 20px;">${dimensionType}: ${dimensionValue}</h4>
                
                <div style="display: flex; gap: 30px; align-items: flex-start;">
                    <!-- 左侧：饼图 -->
                    <div style="flex: 1; min-width: 300px;">
                        <canvas id="fxContributionPieChart" style="max-width: 100%;"></canvas>
                    </div>
                    
                    <!-- 右侧：表格 -->
                    <div style="flex: 1; min-width: 300px;">
                        <div class="table-container">
                            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                                <thead>
                                    <tr style="background-color: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                                        <th style="padding: 8px 10px; text-align: left; font-weight: 600; color: var(--text-primary); font-size: 12px;">归因因子</th>
                                        <th style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary); font-size: 12px;">贡献度（万元）</th>
                                        <th style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary); font-size: 12px;">占比</th>
                                    </tr>
                                </thead>
                                <tbody>
        `;
        
        contributionData.forEach(item => {
            const actualValue = item.actualPnl !== undefined ? item.actualPnl : 0;
            const valueClass = this.getNumberClass(actualValue);
            
            html += `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 6px 10px; font-size: 12px;">${item.name}</td>
                    <td style="padding: 6px 10px; text-align: right; font-size: 12px; ${valueClass}">${this.formatNumber(actualValue)}</td>
                    <td style="padding: 6px 10px; text-align: right; font-size: 12px;">${item.percentage.toFixed(2)}%</td>
                </tr>
            `;
        });
        
        html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        
        // 初始化饼图
        this.initContributionPieChart(contributionData);
    },

    /**
     * 初始化贡献度饼图
     */
    initContributionPieChart(data) {
        const ctx = document.getElementById('fxContributionPieChart');
        if (!ctx) return;
        
        // 如果已有图表实例，先销毁
        if (window.fxContributionPieChartInstance) {
            window.fxContributionPieChartInstance.destroy();
        }
        
        // 准备图表数据
        const labels = data.map(item => item.name);
        const values = data.map(item => item.value);
        
        // 生成颜色
        const colors = this.generateColors(data.length);
        
        window.fxContributionPieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total !== 0 ? ((value / total) * 100).toFixed(2) : 0;
                                return label + ': ' + 
                                       value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 
                                       '万元 (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * 生成颜色数组
     */
    generateColors(count) {
        const baseColors = [
            '#4A90E2', '#50C878', '#FF6B6B', '#FFD93D', '#6BCF7F',
            '#9B59B6', '#E67E22', '#3498DB', '#1ABC9C', '#F39C12',
            '#E74C3C', '#95A5A6'
        ];
        
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    },

    /**
     * 获取因子显示名称
     */
    getFactorDisplayName(factorCode) {
        const nameMap = {
            'delta': 'Delta',
            'pv01': 'PV01',
            'gamma': 'Gamma',
            'vega': 'Vega',
            'theta': 'Theta',
            'rho': 'Rho',
            'phi': 'Phi',
            'volga': 'Volga',
            'vanna': 'Vanna'
        };
        return nameMap[factorCode] || factorCode;
    },

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        const modal = document.getElementById('fxContributionModal');
        if (!modal) return;
        
        // 关闭按钮
        const closeBtn = document.getElementById('fxContributionClose');
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

// 将fxContribution暴露到全局
window.fxContribution = fxContribution;

