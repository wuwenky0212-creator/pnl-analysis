/**
 * 图表渲染模块
 */

let barChartInstance = null;
let pieChartInstance = null;
let trendChartInstance = null;
let productPieChartInstance = null;
let componentBarChartInstance = null;

// 初始化图表
function initCharts() {
    // 损益变动趋势图
    initTrendChart();
    // 柱状图和饼图已移除，不再初始化
}

// 初始化趋势图
function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.warn('Trend chart canvas not found');
        return;
    }
    
    // 如果已经初始化，先销毁
    if (trendChartInstance) {
        try {
            trendChartInstance.destroy();
        } catch (e) {
            console.warn('Error destroying existing chart instance:', e);
        }
        trendChartInstance = null;
    }
    
    // 检查Chart.js是否已加载
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded');
        return;
    }
    
    console.log('Initializing trend chart');
    trendChartInstance = new Chart(ctx, {
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
                        color: '#262626',
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#262626',
                    bodyColor: '#595959',
                    borderColor: '#e8e8e8',
                    borderWidth: 1,
                    padding: 12,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + 
                                   context.parsed.y.toLocaleString('zh-CN', { 
                                       minimumFractionDigits: 2, 
                                       maximumFractionDigits: 2 
                                   }) + '万元';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '日期',
                        color: '#595959',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        color: '#8c8c8c',
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 20,  // 最多显示20个标签
                        callback: function(value, index) {
                            // 显示日期标签
                            if (trendChartInstance && trendChartInstance.data.labels && trendChartInstance.data.labels[index]) {
                                return trendChartInstance.data.labels[index];
                            }
                            return value;
                        }
                    },
                    grid: {
                        color: '#f0f0f0',
                        drawBorder: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '金额（万元）',
                        color: '#595959',
                        font: {
                            size: 12
                        }
                    },
                    beginAtZero: false,
                    ticks: {
                        color: '#8c8c8c',
                        callback: function(value) {
                            return value.toLocaleString('zh-CN', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                            });
                        }
                    },
                    grid: {
                        color: '#f0f0f0',
                        drawBorder: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // 保存到全局，方便调试
    window.trendChartInstance = trendChartInstance;
    console.log('Trend chart initialized successfully');
}

// 初始化柱状图
function initBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '损益金额',
                data: [],
                backgroundColor: [
                    '#4a90e2',
                    '#6c5ce7',
                    '#a29bfe',
                    '#74b9ff',
                    '#00b894',
                    '#00cec9',
                    '#fdcb6e',
                    '#e17055'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(45, 45, 45, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e0e0e0',
                    borderColor: '#404040',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `金额: ${context.parsed.y.toFixed(2)}万元`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        color: '#404040'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b0b0b0',
                        callback: function(value) {
                            return value.toFixed(2) + '万';
                        }
                    },
                    grid: {
                        color: '#404040'
                    }
                }
            }
        }
    });
}

// 初始化饼图
function initPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4a90e2',
                    '#6c5ce7',
                    '#a29bfe',
                    '#74b9ff',
                    '#00b894',
                    '#00cec9',
                    '#fdcb6e',
                    '#e17055'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b0b0b0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(45, 45, 45, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e0e0e0',
                    borderColor: '#404040',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${label}: ${value.toFixed(2)}万元 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}


// 更新柱状图
function updateBarChart(pnlData) {
    if (!barChartInstance || !pnlData) return;
    
    const details = pnlData.details || [];
    const labels = details.map(item => item.dimension_value);
    const data = details.map(item => item.total_pnl);
    
    barChartInstance.data.labels = labels;
    barChartInstance.data.datasets[0].data = data;
    barChartInstance.update();
}

// 更新饼图
function updatePieChart(pnlData) {
    if (!pieChartInstance || !pnlData) return;
    
    const details = pnlData.details || [];
    const labels = details.map(item => item.dimension_value);
    const data = details.map(item => item.total_pnl);
    
    // 过滤掉值为0的项目
    const filteredLabels = [];
    const filteredData = [];
    labels.forEach((label, index) => {
        if (data[index] !== 0) {
            filteredLabels.push(label);
            filteredData.push(data[index]);
        }
    });
    
    pieChartInstance.data.labels = filteredLabels;
    pieChartInstance.data.datasets[0].data = filteredData;
    pieChartInstance.update();
}

// 更新趋势图
function updateTrendChart(trendData) {
    console.log('updateTrendChart called with data:', trendData);
    
    // 如果图表未初始化，尝试初始化
    if (!trendChartInstance) {
        console.warn('Trend chart instance not initialized, trying to initialize...');
        const ctx = document.getElementById('trendChart');
        if (ctx) {
            console.log('Trend chart canvas found, initializing...');
            initTrendChart();
        } else {
            console.error('Trend chart canvas element not found');
            // 延迟重试
            setTimeout(() => {
                const retryCtx = document.getElementById('trendChart');
                if (retryCtx) {
                    console.log('Retrying trend chart initialization...');
                    initTrendChart();
                    if (trendChartInstance && trendData) {
                        updateTrendChart(trendData);
                    }
                }
            }, 500);
            return;
        }
    }
    
    if (!trendChartInstance) {
        console.error('Failed to initialize trend chart');
        return;
    }
    
    console.log('Updating trend chart with data:', trendData);
    console.log('Trend data type:', typeof trendData);
    console.log('Trend data is array:', Array.isArray(trendData));
    console.log('Trend data length:', trendData ? trendData.length : 'null/undefined');
    
    if (!trendData || trendData.length === 0) {
        console.warn('Trend data is empty or null');
        if (trendChartInstance) {
            trendChartInstance.data.labels = [];
            trendChartInstance.data.datasets = [];
            trendChartInstance.update();
        }
        return;
    }
    
    // 提取日期标签
    const labels = [];
    
    trendData.forEach(item => {
        if (item.date) {
            const date = new Date(item.date);
            if (!isNaN(date.getTime())) {
                // 格式化日期显示：YYYY-MM-DD（按天维度显示完整日期）
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                labels.push(`${year}-${month}-${day}`);
            }
        }
    });
    
    console.log('Trend chart labels:', labels);
    console.log('Trend chart data count:', trendData.length);
    
    if (labels.length === 0 || trendData.length === 0) {
        console.warn('No valid trend data to display');
        trendChartInstance.data.labels = [];
        trendChartInstance.data.datasets = [];
        trendChartInstance.update();
        return;
    }
    
    // 提取各分项数据
    const totalPnlData = [];
    const interestData = [];
    const priceDiffData = [];
    const valuationData = [];
    const feeData = [];
    
    trendData.forEach(item => {
        if (item.date) {
            const date = new Date(item.date);
            if (!isNaN(date.getTime())) {
                // 优先使用 total_pnl，如果没有则使用 pnl，确保有值
                const totalPnl = (item.total_pnl !== undefined && item.total_pnl !== null) 
                    ? item.total_pnl 
                    : ((item.pnl !== undefined && item.pnl !== null) ? item.pnl : 0);
                totalPnlData.push(Number(totalPnl) || 0);
                
                // 各分项数据，如果没有则默认为0，确保转换为数字
                interestData.push(Number(item.pnl_interest) || 0);
                priceDiffData.push(Number(item.pnl_price_diff) || 0);
                valuationData.push(Number(item.pnl_valuation) || 0);
                feeData.push(Number(item.pnl_fee) || 0);
            }
        }
    });
    
    console.log('Extracted trend data:', {
        labelsCount: labels.length,
        totalPnlCount: totalPnlData.length,
        totalPnl: totalPnlData.slice(0, 3),
        interest: interestData.slice(0, 3),
        priceDiff: priceDiffData.slice(0, 3),
        valuation: valuationData.slice(0, 3),
        fee: feeData.slice(0, 3)
    });
    
    // 确保labels和data长度一致
    if (labels.length !== totalPnlData.length) {
        console.warn('Labels and data length mismatch:', {
            labelsLength: labels.length,
            dataLength: totalPnlData.length
        });
        // 如果长度不一致，使用较小的长度
        const minLength = Math.min(labels.length, totalPnlData.length);
        labels.splice(minLength);
        totalPnlData.splice(minLength);
        interestData.splice(minLength);
        priceDiffData.splice(minLength);
        valuationData.splice(minLength);
        feeData.splice(minLength);
    }
    
    if (labels.length === 0) {
        console.warn('No labels to display after processing');
        return;
    }
    
    // 验证数据长度
    if (totalPnlData.length !== labels.length) {
        console.error('Data length mismatch:', {
            labels: labels.length,
            totalPnl: totalPnlData.length,
            interest: interestData.length,
            priceDiff: priceDiffData.length,
            valuation: valuationData.length,
            fee: feeData.length
        });
    }
    
    console.log('Setting chart data with', labels.length, 'data points');
    if (labels.length > 0 && totalPnlData.length > 0) {
        console.log('Sample data:', {
            label: labels[0],
            totalPnl: totalPnlData[0],
            interest: interestData[0],
            priceDiff: priceDiffData[0],
            valuation: valuationData[0],
            fee: feeData[0]
        });
    }
    
    trendChartInstance.data.labels = labels;
    // 只显示总累计损益的波动情况
    trendChartInstance.data.datasets = [
        {
            label: '累计损益总额',
            data: totalPnlData,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: labels.length > 100 ? 2 : (labels.length > 50 ? 3 : 4),
            pointHoverRadius: 6,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHitRadius: 10
        },
        {
            label: '利息损益',
            data: interestData,
            borderColor: '#52c41a',
            backgroundColor: 'rgba(82, 196, 26, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: labels.length > 100 ? 1 : (labels.length > 50 ? 2 : 3),
            pointHoverRadius: 5,
            pointBackgroundColor: '#52c41a',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
        },
        {
            label: '价差损益',
            data: priceDiffData,
            borderColor: '#ff4d4f',
            backgroundColor: 'rgba(255, 77, 79, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: labels.length > 100 ? 1 : (labels.length > 50 ? 2 : 3),
            pointHoverRadius: 5,
            pointBackgroundColor: '#ff4d4f',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
        },
        {
            label: '估值损益',
            data: valuationData,
            borderColor: '#1890ff',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: labels.length > 100 ? 1 : (labels.length > 50 ? 2 : 3),
            pointHoverRadius: 5,
            pointBackgroundColor: '#1890ff',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
        },
        {
            label: '手续费损益',
            data: feeData,
            borderColor: '#faad14',
            backgroundColor: 'rgba(250, 173, 20, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: labels.length > 100 ? 1 : (labels.length > 50 ? 2 : 3),
            pointHoverRadius: 5,
            pointBackgroundColor: '#faad14',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
        }
    ];
    
    console.log('Chart data set, updating chart...');
    try {
        trendChartInstance.update();
        console.log('Chart updated successfully');
    } catch (error) {
        console.error('Error updating chart:', error);
        alert('更新趋势图失败：' + (error.message || '未知错误'));
    }
}

// 更新所有图表
function updateCharts(pnlData, trendData) {
    console.log('updateCharts called with trendData:', trendData);
    console.log('Trend data type:', typeof trendData);
    console.log('Trend data is array:', Array.isArray(trendData));
    if (trendData) {
        console.log('Trend data length:', trendData.length);
        if (trendData.length > 0) {
            console.log('First trend data item:', trendData[0]);
        }
    }
    updateTrendChart(trendData);
    // 柱状图和饼图已移除，不再更新
}

// 清空图表
function clearCharts() {
    if (trendChartInstance) {
        trendChartInstance.data.labels = [];
        trendChartInstance.data.datasets = [];
        trendChartInstance.update();
    }
    // 柱状图和饼图已移除，不再清除
}

// 初始化产品分类饼图
function initProductPieChart() {
    const ctx = document.getElementById('productPieChart');
    if (!ctx) return;
    
    console.log('Initializing product pie chart');
    productPieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4a90e2',
                    '#6c5ce7',
                    '#a29bfe',
                    '#74b9ff',
                    '#00b894',
                    '#00cec9',
                    '#fdcb6e',
                    '#e17055',
                    '#fd79a8',
                    '#fdcb6e'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%', // 甜甜圈图样式
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#262626',
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#262626',
                    bodyColor: '#595959',
                    borderColor: '#e8e8e8',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            // 从标签中提取原始产品名称（去掉占比）
                            const fullLabel = context.label || '';
                            const label = fullLabel.split(' (')[0]; // 去掉占比部分
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
                            return `${label}: ${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}万元 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // 保存到全局
    window.productPieChartInstance = productPieChartInstance;
    console.log('Product pie chart initialized successfully');
}

// 初始化损益分项柱状图
function initComponentBarChart() {
    const ctx = document.getElementById('componentBarChart');
    if (!ctx) return;
    
    console.log('Initializing component bar chart');
    componentBarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '损益金额（万元）',
                data: [],
                backgroundColor: [
                    '#52c41a',  // 利息损益 - 绿色
                    '#ff4d4f',  // 价差损益 - 红色
                    '#1890ff',  // 估值损益 - 蓝色
                    '#faad14',  // 融资成本 - 橙色
                    '#722ed1'   // 手续费 - 紫色
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#262626',
                    bodyColor: '#595959',
                    borderColor: '#e8e8e8',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            // 这个会在updateComponentBarChart中被动态设置
                            return `金额: ${context.parsed.y.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}万元`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '损益分项',
                        color: '#595959',
                        font: {
                            size: 12
                        }
                    },
                    ticks: {
                        color: '#8c8c8c',
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        color: '#f0f0f0',
                        drawBorder: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '金额（万元）',
                        color: '#595959',
                        font: {
                            size: 12
                        }
                    },
                    beginAtZero: true,
                    ticks: {
                        color: '#8c8c8c',
                        callback: function(value) {
                            return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    },
                    grid: {
                        color: '#f0f0f0',
                        drawBorder: false
                    }
                }
            },
            plugins: {
                datalabels: {
                    display: false // 默认不显示，我们会在更新时动态设置
                }
            }
        }
    });
    
    // 保存到全局
    window.componentBarChartInstance = componentBarChartInstance;
    console.log('Component bar chart initialized successfully');
}

// 产品代码到标准产品名称的映射
const productCodeToNameMap = {
    // 外汇即期
    'fxspot': '外汇即期',
    'fx_spot': '外汇即期',
    'fxspot01': '外汇即期',
    
    // 外汇远期
    'fwd01': '外汇远期',
    'fwd02': '外汇远期',
    
    // 外汇掉期
    'fxsw01': '外汇掉期',
    'fxsw02': '外汇掉期',
    
    // 外汇期权
    'fxo01': '外汇期权',
    'fxo02': '外汇期权',
    'fxopt': '外汇期权',
    
    // CCS（货币掉期）
    'ccs01': 'CCS',
    
    // IRS（利率互换）
    'sw01': 'IRS',
    'sw02': 'IRS',
};

// 产品名称映射函数
const mapProductName = (dimensionValue) => {
    if (!dimensionValue) return '未知';
    
    const value = dimensionValue.toLowerCase().trim();
    
    // 首先尝试直接匹配
    if (productCodeToNameMap[value]) {
        return productCodeToNameMap[value];
    }
    
    // 尝试包含匹配
    for (const [code, name] of Object.entries(productCodeToNameMap)) {
        if (value.includes(code) || value === code) {
            return name;
        }
    }
    
    // 关键词匹配
    if (value.includes('即期') || value.includes('spot')) {
        return '外汇即期';
    } else if (value.includes('远期') || value.includes('forward') || value.includes('fwd')) {
        return '外汇远期';
    } else if (value.includes('掉期') || value.includes('swap') || value.includes('fxsw')) {
        return '外汇掉期';
    } else if (value.includes('期权') || value.includes('option') || value.includes('fxo')) {
        return '外汇期权';
    } else if (value.includes('ccs') || value.includes('货币掉期')) {
        return 'CCS';
    } else if (value.includes('irs') || value.includes('利率互换') || value.includes('sw01') || value.includes('sw02')) {
        return 'IRS';
    }
    
    // 默认返回原始值
    return dimensionValue;
};

// 更新产品分类饼图
function updateProductPieChart(details) {
    // 如果图表未初始化，尝试初始化
    if (!productPieChartInstance) {
        initProductPieChart();
    }
    
    if (!productPieChartInstance || !details || details.length === 0) {
        return;
    }
    
    // 按标准产品名称分类汇总
    const productMap = {};
    details.forEach(detail => {
        // 将dimension_value映射到标准产品名称
        const productName = mapProductName(detail.dimension_value);
        if (!productMap[productName]) {
            productMap[productName] = 0;
        }
        productMap[productName] += detail.total_pnl || 0;
    });
    
    // 按固定顺序排列产品
    const productOrder = ['外汇即期', '外汇远期', '外汇掉期', '外汇期权', 'CCS', 'IRS'];
    const labels = productOrder.filter(name => productMap.hasOwnProperty(name));
    const data = labels.map(label => productMap[label]);
    
    // 计算总金额，用于计算占比
    const total = data.reduce((sum, val) => sum + val, 0);
    
    // 饼图标签不显示占比（占比在表格中显示）
    productPieChartInstance.data.labels = labels;
    productPieChartInstance.data.datasets[0].data = data;
    productPieChartInstance.update();
    
    // 更新产品分类表格
    updateProductTable(labels, data, total);
}

// 更新损益分项柱状图
function updateComponentBarChart(details) {
    // 如果图表未初始化，尝试初始化
    if (!componentBarChartInstance) {
        initComponentBarChart();
    }
    
    if (!componentBarChartInstance || !details || details.length === 0) {
        return;
    }
    
    // 按损益分项汇总
    let interestTotal = 0;
    let priceDiffTotal = 0;
    let valuationTotal = 0;
    let financingTotal = 0;
    let feeTotal = 0;
    
    details.forEach(detail => {
        interestTotal += detail.pnl_interest || 0;
        priceDiffTotal += detail.pnl_price_diff || 0;
        valuationTotal += detail.pnl_valuation || 0;
        financingTotal += detail.pnl_financing || 0;
        feeTotal += detail.pnl_fee || 0;
    });
    
    // 计算总金额，用于计算占比
    const total = interestTotal + priceDiffTotal + valuationTotal + financingTotal + feeTotal;
    
    // 计算各分项的占比
    const percentages = [
        total !== 0 ? ((interestTotal / total) * 100).toFixed(2) : '0.00',
        total !== 0 ? ((priceDiffTotal / total) * 100).toFixed(2) : '0.00',
        total !== 0 ? ((valuationTotal / total) * 100).toFixed(2) : '0.00',
        total !== 0 ? ((financingTotal / total) * 100).toFixed(2) : '0.00',
        total !== 0 ? ((feeTotal / total) * 100).toFixed(2) : '0.00'
    ];
    
    // 更新标签，显示占比
    const labels = [
        `利息损益 (${percentages[0]}%)`,
        `价差损益 (${percentages[1]}%)`,
        `估值损益 (${percentages[2]}%)`,
        `融资成本 (${percentages[3]}%)`,
        `手续费 (${percentages[4]}%)`
    ];
    const data = [interestTotal, priceDiffTotal, valuationTotal, financingTotal, feeTotal];
    
    componentBarChartInstance.data.labels = labels;
    componentBarChartInstance.data.datasets[0].data = data;
    
    // 更新tooltip以显示占比
    componentBarChartInstance.options.plugins.tooltip.callbacks.label = function(context) {
        const label = context.label || '';
        const originalLabel = label.split(' (')[0]; // 去掉占比部分
        const value = context.parsed.y || 0;
        const percentage = percentages[context.dataIndex] || '0.00';
        return `${originalLabel}: ${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}万元 (${percentage}%)`;
    };
    
    componentBarChartInstance.update();
}

// 更新产品分类表格
function updateProductTable(labels, data, total) {
    const productTableBody = document.getElementById('productTableBody');
    if (!productTableBody) return;
    
    productTableBody.innerHTML = '';
    
    if (!labels || labels.length === 0) {
        productTableBody.innerHTML = '<tr><td colspan="4" class="empty-state">暂无数据</td></tr>';
        return;
    }
    
    // 按金额排序（从大到小）
    const sortedData = labels.map((label, index) => ({
        label: label,
        value: data[index],
        percentage: total !== 0 ? ((data[index] / total) * 100).toFixed(2) : '0.00'
    })).sort((a, b) => b.value - a.value);
    
    sortedData.forEach(item => {
        const row = document.createElement('tr');
        const valueClass = item.value > 0 ? 'positive' : (item.value < 0 ? 'negative' : 'neutral');
        const percentageClass = parseFloat(item.percentage) > 0 ? 'positive' : (parseFloat(item.percentage) < 0 ? 'negative' : 'neutral');
        
        row.innerHTML = `
            <td>${item.label}</td>
            <td class="${valueClass}">${item.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="${percentageClass}">${item.percentage}%</td>
            <td>
                <button class="action-btn" onclick="showProductDetail('${item.label.replace(/'/g, "\\'")}')">查看明细</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

// 页面加载完成后初始化图表
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保DOM完全加载
    setTimeout(() => {
        console.log('DOMContentLoaded: Initializing charts...');
        const trendCtx = document.getElementById('trendChart');
        if (trendCtx) {
            console.log('Trend chart canvas found, initializing...');
            initCharts();
        } else {
            console.warn('Trend chart canvas not found on DOMContentLoaded, will retry later');
            // 延迟重试
            setTimeout(() => {
                const retryCtx = document.getElementById('trendChart');
                if (retryCtx) {
                    console.log('Retrying chart initialization...');
                    initCharts();
                } else {
                    console.error('Trend chart canvas still not found after retry');
                }
            }, 1000);
        }
    }, 100);
});





