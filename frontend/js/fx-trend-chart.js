/**
 * 外汇类损益归因分析 - 归因分项趋势图模块
 */

const fxTrendChart = {
    chartInstance: null,
    currentDimensionValue: null,
    currentDimensionType: null,

    /**
     * 显示趋势图弹窗
     */
    async showTrendChart(dimensionValue, dimensionType) {
        this.currentDimensionValue = dimensionValue;
        this.currentDimensionType = dimensionType;
        
        // 显示模态框
        const modal = document.getElementById('fxTrendChartModal');
        if (!modal) {
            console.error('Trend chart modal not found');
            return;
        }
        
        modal.style.display = 'block';
        
        // 初始化图表（如果还未初始化）
        if (!this.chartInstance) {
            this.initChart();
        }
        
        // 加载并显示趋势数据
        await this.loadTrendData();
        
        // 绑定关闭事件
        this.bindModalEvents();
    },

    /**
     * 初始化趋势图
     */
    initChart() {
        const ctx = document.getElementById('fxFactorTrendChart');
        if (!ctx) {
            console.error('Chart canvas element not found');
            return;
        }
        
        // 检查Chart.js是否已加载
        if (typeof Chart === 'undefined') {
            console.error('Chart.js library not loaded');
            alert('图表库未加载，请刷新页面重试');
            return;
        }
        
        // 如果图表实例已存在，先销毁
        if (this.chartInstance) {
            try {
                this.chartInstance.destroy();
            } catch (e) {
                console.warn('Error destroying chart instance:', e);
            }
            this.chartInstance = null;
        }
        
        this.chartInstance = new Chart(ctx, {
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
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#333',
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4a90e2',
                        borderWidth: 1,
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '日期',
                            color: '#666'
                        },
                        ticks: {
                            color: '#666',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '金额（万元）',
                            color: '#666'
                        },
                        ticks: {
                            color: '#666',
                            callback: function(value) {
                                return value.toLocaleString('zh-CN', { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                }) + '万元';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    },

    /**
     * 加载趋势数据
     */
    async loadTrendData() {
        try {
            const fxElements = window.fxElements;
            if (!fxElements) {
                console.error('fxElements not found');
                return;
            }
            
            const startDate = fxElements.startDate.value;
            const endDate = fxElements.endDate.value;
            
            if (!startDate || !endDate) {
                alert('请先选择日期范围');
                return;
            }
            
            // 获取api对象
            const api = window.api;
            if (!api) {
                console.error('API object not found');
                alert('API对象未初始化，请刷新页面重试');
                return;
            }
            
            // 调用API获取每个因子的趋势数据
            const requestData = {
                start_date: startDate,
                end_date: endDate,
                dimension_type: this.currentDimensionType,
                dimension_value: this.currentDimensionValue
            };
            
            console.log('Loading trend data with request:', requestData);
            
            const response = await api.getFXFactorTrend(requestData);
            
            console.log('Trend data response:', response);
            
            // 转换数据格式
            const trendData = this.processTrendData(response.trend_data || []);
            
            if (!trendData || trendData.datasets.length === 0) {
                alert('暂无趋势数据');
                return;
            }
            
            this.updateChart(trendData);
            
        } catch (error) {
            console.error('Failed to load trend data:', error);
            alert('加载趋势数据失败：' + (error.message || '未知错误'));
        }
    },

    /**
     * 处理趋势数据，转换为图表格式
     */
    processTrendData(trendData) {
        if (!trendData || trendData.length === 0) {
            return { labels: [], datasets: [] };
        }
        
        // 提取日期标签
        const labels = trendData.map(item => {
            const date = new Date(item.date);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}/${day}`;
        });
        
        // 因子代码和名称映射
        const factorCodes = ['delta', 'vega', 'gamma', 'theta', 'rho', 'vanna', 
                            'charm', 'veta', 'vomma', 'speed', 'theta_decay', 'unexplained'];
        const factorNames = ['Delta', 'Vega', 'Gamma', 'Theta', 'Rho', 'Vanna', 
                            'Charm', 'Veta', 'Vomma', 'Speed', 'ThetaDecay', '无法解释部分'];
        
        const colors = [
            '#4a90e2', '#50c878', '#ff6b6b', '#ffd93d', '#6c5ce7', '#00d9ff',
            '#1e9fff', '#5a67d8', '#ff8787', '#a8e6cf', '#ffd89b', '#f093fb'
        ];
        
        // 为每个因子创建数据集
        const datasets = [];
        factorCodes.forEach((code, index) => {
            const data = trendData.map(item => {
                const factors = item.factors || {};
                return factors[code] || 0;
            });
            
            datasets.push({
                label: factorNames[index],
                data: data,
                borderColor: colors[index],
                backgroundColor: colors[index] + '33',
                tension: 0.4,
                fill: false,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2
            });
        });
        
        return { labels, datasets };
    },

    /**
     * 更新图表
     */
    updateChart(trendData) {
        if (!this.chartInstance) {
            console.error('Chart instance not found, initializing...');
            this.initChart();
        }
        
        if (!trendData || !trendData.labels || !trendData.datasets) {
            console.error('Invalid trend data:', trendData);
            return;
        }
        
        if (!this.chartInstance) {
            console.error('Chart instance still not found after initialization');
            return;
        }
        
        try {
            this.chartInstance.data.labels = trendData.labels;
            this.chartInstance.data.datasets = trendData.datasets;
            this.chartInstance.update();
            console.log('Chart updated successfully');
        } catch (error) {
            console.error('Error updating chart:', error);
            alert('更新图表失败：' + (error.message || '未知错误'));
        }
    },

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        const modal = document.getElementById('fxTrendChartModal');
        if (!modal) return;
        
        // 关闭按钮
        const closeBtn = document.getElementById('fxTrendChartModalClose');
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
    }
};

// 将fxTrendChart暴露到全局
window.fxTrendChart = fxTrendChart;

