/**
 * 外汇类损益归因分析图表渲染模块
 */

const fxCharts = {
    trendChartInstance: null,
    barChartInstance: null,
    pieChartInstance: null,

    /**
     * 初始化所有图表
     */
    initCharts() {
        this.initTrendChart();
        // 柱状图和饼图已移除
    },

    /**
     * 初始化趋势图
     */
    initTrendChart() {
        const ctx = document.getElementById('fxTrendChart');
        if (!ctx) return;

        this.trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#333'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4a90e2',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#666'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#666',
                            callback: function(value) {
                                return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '万元';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    },

    /**
     * 初始化柱状图
     */
    initBarChart() {
        const ctx = document.getElementById('fxBarChart');
        if (!ctx) return;

        this.barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#d0d0d0'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4a90e2',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + 
                                       context.parsed.y.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '万元';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#808080'
                        },
                        grid: {
                            color: 'rgba(128, 128, 128, 0.2)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#808080',
                            callback: function(value) {
                                return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '万元';
                            }
                        },
                        grid: {
                            color: 'rgba(128, 128, 128, 0.2)'
                        }
                    }
                }
            }
        });
    },

    /**
     * 初始化饼图
     */
    initPieChart() {
        const ctx = document.getElementById('fxPieChart');
        if (!ctx) return;

        this.pieChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#4a90e2',
                        '#50c878',
                        '#ff6b6b',
                        '#ffd93d',
                        '#6c5ce7',
                        '#00d9ff',
                        '#1e9fff',
                        '#5a67d8',
                        '#ff8787',
                        '#a8e6cf',
                        '#ffd89b',
                        '#f093fb'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#d0d0d0',
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4a90e2',
                        borderWidth: 1,
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
     * 更新趋势图
     */
    updateTrendChart(trendData) {
        if (!this.trendChartInstance || !trendData || trendData.length === 0) return;

        // 提取日期标签（X轴）- 格式化为 MM/DD
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        // 提取累计估值损益数据（Y轴）
        const data = trendData.map(item => item.valuation_pnl || 0);

        // 创建单一数据集（累计估值损益）
        this.trendChartInstance.data.labels = labels;
        this.trendChartInstance.data.datasets = [{
            label: '累计估值损益',
            data: data,
            borderColor: '#4a90e2',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
        }];
        
        this.trendChartInstance.update();
    },

    /**
     * 更新图表（柱状图和饼图已移除）
     */
    updateCharts(data) {
        // 柱状图和饼图已移除，只保留趋势图
    },

    /**
     * 更新柱状图
     */
    updateBarChart(details) {
        if (!this.barChartInstance) return;

        // 因子代码和名称映射
        const factorMap = {
            'delta': 'Delta损益',
            'vega': 'Vega损益',
            'gamma': 'Gamma损益',
            'theta': 'Theta损益',
            'rho': 'Rho损益',
            'vanna': 'Vanna损益',
            'charm': 'Charm损益',
            'veta': 'Veta损益',
            'vomma': 'Vomma损益',
            'speed': 'Speed损益',
            'theta_decay': 'ThetaDecay损益',
            'unexplained': '无法解释部分'
        };

        const factorCodes = Object.keys(factorMap);
        const labels = details.map(d => d.dimension_value || '总计');
        
        // 计算每个因子的总和
        const factorTotals = {};
        factorCodes.forEach(code => {
            factorTotals[code] = 0;
        });

        details.forEach(detail => {
            const factorsMap = {};
            (detail.factors || []).forEach(factor => {
                factorsMap[factor.factor_code] = factor;
            });

            factorCodes.forEach(code => {
                const factor = factorsMap[code];
                const value = factor ? factor.pnl_contribution : (code === 'unexplained' ? detail.unexplained || 0 : 0);
                factorTotals[code] += value;
            });
        });

        // 创建数据集（只显示有值的因子）
        const datasets = [];
        const colors = ['#4a90e2', '#50c878', '#ff6b6b', '#ffd93d', '#6c5ce7', 
                       '#00d9ff', '#1e9fff', '#5a67d8', '#ff8787', '#a8e6cf', 
                       '#ffd89b', '#f093fb', '#95a5a6'];

        let colorIndex = 0;
        factorCodes.forEach(code => {
            if (Math.abs(factorTotals[code]) > 0.01) { // 只显示有值的因子
                const data = details.map(detail => {
                    const factorsMap = {};
                    (detail.factors || []).forEach(factor => {
                        factorsMap[factor.factor_code] = factor;
                    });
                    const factor = factorsMap[code];
                    return factor ? factor.pnl_contribution : (code === 'unexplained' ? detail.unexplained || 0 : 0);
                });

                datasets.push({
                    label: factorMap[code],
                    data: data,
                    backgroundColor: colors[colorIndex % colors.length],
                    borderColor: colors[colorIndex % colors.length],
                    borderWidth: 1
                });
                colorIndex++;
            }
        });

        this.barChartInstance.data.labels = labels;
        this.barChartInstance.data.datasets = datasets;
        this.barChartInstance.update();
    },

    /**
     * 更新饼图
     */
    updatePieChart(details) {
        if (!this.pieChartInstance) return;

        // 因子代码和名称映射
        const factorMap = {
            'delta': 'Delta损益',
            'vega': 'Vega损益',
            'gamma': 'Gamma损益',
            'theta': 'Theta损益',
            'rho': 'Rho损益',
            'vanna': 'Vanna损益',
            'charm': 'Charm损益',
            'veta': 'Veta损益',
            'vomma': 'Vomma损益',
            'speed': 'Speed损益',
            'theta_decay': 'ThetaDecay损益',
            'unexplained': '无法解释部分'
        };

        const factorCodes = Object.keys(factorMap);
        const factorTotals = {};
        
        factorCodes.forEach(code => {
            factorTotals[code] = 0;
        });

        // 汇总所有明细的因子贡献
        details.forEach(detail => {
            const factorsMap = {};
            (detail.factors || []).forEach(factor => {
                factorsMap[factor.factor_code] = factor;
            });

            factorCodes.forEach(code => {
                const factor = factorsMap[code];
                const value = factor ? factor.pnl_contribution : (code === 'unexplained' ? detail.unexplained || 0 : 0);
                factorTotals[code] += value;
            });
        });

        // 过滤掉值为0的因子
        const labels = [];
        const data = [];
        const colors = ['#4a90e2', '#50c878', '#ff6b6b', '#ffd93d', '#6c5ce7', 
                       '#00d9ff', '#1e9fff', '#5a67d8', '#ff8787', '#a8e6cf', 
                       '#ffd89b', '#f093fb', '#95a5a6'];

        let colorIndex = 0;
        factorCodes.forEach(code => {
            const value = factorTotals[code];
            if (Math.abs(value) > 0.01) { // 只显示有值的因子
                labels.push(factorMap[code]);
                data.push(value);
                colorIndex++;
            }
        });

        this.pieChartInstance.data.labels = labels;
        this.pieChartInstance.data.datasets[0].data = data;
        this.pieChartInstance.data.datasets[0].backgroundColor = colors.slice(0, labels.length);
        this.pieChartInstance.update();
    },

    /**
     * 清空图表
     */
    clearCharts() {
        if (this.trendChartInstance) {
            this.trendChartInstance.data.labels = [];
            this.trendChartInstance.data.datasets = [];
            this.trendChartInstance.update();
        }

        // 柱状图和饼图已移除
    }
};

// 将fxCharts暴露到全局
window.fxCharts = fxCharts;

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        fxCharts.initCharts();
    }, 500);
});

