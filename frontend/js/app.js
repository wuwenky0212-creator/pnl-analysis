/**
 * 主应用逻辑
 */

// 全局状态
const state = {
    portfolios: [],
    products: [],
    currentData: null,
    trendData: null,
    selectedPortfolio: null, // 当前选中的投组
    selectedProduct: null // 当前选中的产品
};

// DOM 元素
const elements = {
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    portfolioSelect: document.getElementById('portfolioSelect'),
    productSelect: document.getElementById('productSelect'),
    queryBtn: document.getElementById('queryBtn'),
    resetBtn: document.getElementById('resetBtn'),
    totalPnl: document.getElementById('totalPnl'),
    interestPnl: document.getElementById('interestPnl'),
    valuationPnl: document.getElementById('valuationPnl'),
    priceDiffPnl: document.getElementById('priceDiffPnl'),
    warningsSection: document.getElementById('warningsSection'),
    warningsList: document.getElementById('warningsList'),
    portfolioTableBody: document.getElementById('portfolioTableBody'),
    productTableBody: document.getElementById('productTableBody'),
    transactionDetailModal: document.getElementById('transactionDetailModal'),
    transactionDetailContent: document.getElementById('transactionDetailContent'),
    closeModal: document.getElementById('closeModal')
};

// 初始化
async function init() {
    // 设置默认结束日期为今天
    const today = new Date().toISOString().split('T')[0];
    elements.endDate.value = today;
    
    // 加载基础数据
    await loadBaseData();
    
    // 绑定事件
    bindEvents();
    
    console.log('Application initialized');
}

// 加载基础数据
async function loadBaseData() {
    try {
        // 投资组合和产品已改为固定下拉框，不需要从API加载
        // 设置默认值
        if (elements.portfolioSelect) {
            elements.portfolioSelect.value = '';
        }
        if (elements.productSelect) {
            elements.productSelect.value = '';
        }
        
        console.log('Base data initialized');
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError('初始化失败');
    }
}

// 绑定事件
function bindEvents() {
    // 查询按钮
    elements.queryBtn.addEventListener('click', handleQuery);
    
    // TAB切换
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabSwitch);
    });
    
    // 模态框关闭
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeTransactionModal);
    }
    
    // 点击模态框外部关闭
    if (elements.transactionDetailModal) {
        elements.transactionDetailModal.addEventListener('click', (e) => {
            if (e.target === elements.transactionDetailModal) {
                closeTransactionModal();
            }
        });
    }
    
    // 重置按钮
    elements.resetBtn.addEventListener('click', handleReset);
    
    // 侧边栏菜单项点击
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', handleSidebarItemClick);
    });
}

// 处理侧边栏菜单项点击
function handleSidebarItemClick(event) {
    const clickedItem = event.currentTarget;
    const itemId = clickedItem.id;
    
    // 移除所有active状态
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 隐藏所有内容视图
    document.querySelectorAll('.content-view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });
    
    // 添加当前项的active状态
    clickedItem.classList.add('active');
    
    // 显示对应的内容视图
    if (itemId === 'currentPnlMenuItem') {
        const currentPnlView = document.getElementById('currentPnlView');
        if (currentPnlView) {
            currentPnlView.classList.add('active');
            currentPnlView.style.display = 'block';
            // 确保趋势图已初始化（如果还未初始化）
            setTimeout(() => {
                const trendCtx = document.getElementById('trendChart');
                if (trendCtx) {
                    // 如果图表未初始化，或者当前视图是隐藏的，重新初始化
                    if (!window.trendChartInstance || !trendChartInstance) {
                        console.log('Initializing trend chart on view switch');
                        if (typeof initTrendChart === 'function') {
                            initTrendChart();
                        }
                    }
                    // 如果有趋势数据，更新图表
                    if (state.trendData && state.trendData.length > 0) {
                        console.log('Updating trend chart with existing data');
                        if (typeof updateTrendChart === 'function') {
                            updateTrendChart(state.trendData);
                        }
                    }
                }
            }, 300);
        }
    } else if (itemId === 'fxPnlMenuItem') {
        const fxPnlView = document.getElementById('fxPnlView');
        if (fxPnlView) {
            fxPnlView.classList.add('active');
            fxPnlView.style.display = 'block';
        }
    }
    
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 触发主内容区域的联动效果
    highlightMainContent();
}

// 高亮主内容区域
function highlightMainContent() {
    const activeView = document.querySelector('.content-view.active');
    if (activeView) {
        const configWidget = activeView.querySelector('.config-widget');
        if (configWidget) {
            configWidget.style.transition = 'all 0.3s';
            configWidget.style.borderColor = '#4a90e2';
            configWidget.style.boxShadow = '0 0 10px rgba(74, 144, 226, 0.2)';
            
            setTimeout(() => {
                configWidget.style.borderColor = '';
                configWidget.style.boxShadow = '';
                setTimeout(() => {
                    configWidget.style.transition = '';
                }, 300);
            }, 800);
        }
    }
}

// 处理查询
async function handleQuery() {
    try {
        // 显示加载状态
        elements.queryBtn.innerHTML = '<span class="loading"></span> 查询中...';
        elements.queryBtn.disabled = true;
        
        // 获取配置
        const analysisType = 'mark_to_market'; // 默认使用按市价分析
        const startDate = elements.startDate.value;
        const endDate = elements.endDate.value;
        
        // 处理投资组合（单选下拉框）
        const portfolioValue = elements.portfolioSelect.value;
        const portfolioIds = portfolioValue && portfolioValue !== '' ? [portfolioValue] : [];
        
        // 处理产品（单选下拉框）
        const productValue = elements.productSelect.value;
        const productCodes = productValue && productValue !== '' ? [productValue] : [];
        
        const groupBy = 'portfolio'; // 默认使用簿记架构分组
        
        // 验证日期
        if (!startDate || !endDate) {
            alert('请选择日期范围');
            return;
        }
        
        if (new Date(endDate) < new Date(startDate)) {
            alert('结束日期必须大于等于开始日期');
            return;
        }
        
        // 发送请求
        const pnlResponse = await api.calculatePnL({
            analysis_type: analysisType,
            start_date: startDate,
            end_date: endDate,
            portfolio_ids: portfolioIds,
            product_codes: productCodes,
            group_by: groupBy
        });
        
        // 保存数据和查询条件
        state.currentData = pnlResponse;
        state.selectedPortfolio = portfolioValue; // 保存选中的投组
        state.selectedProduct = productValue; // 保存选中的产品
        
        // 加载趋势数据
        try {
            const trendParams = {
                start_date: startDate,
                end_date: endDate,
                portfolio_ids: portfolioIds.length > 0 ? portfolioIds.join(',') : '',
                product_codes: productCodes.length > 0 ? productCodes.join(',') : '',
                group_by: groupBy
            };
            console.log('Fetching trend data with params:', trendParams);
            const trendResponse = await api.getPnLTrend(trendParams);
            console.log('Trend API response:', trendResponse);
            state.trendData = trendResponse.trend_data || [];
            console.log('Trend data loaded:', state.trendData);
            console.log('Trend data count:', state.trendData.length);
            if (state.trendData.length > 0) {
                console.log('First trend data point:', state.trendData[0]);
            }
        } catch (error) {
            console.error('Failed to load trend data:', error);
            console.error('Error details:', error.message, error.stack);
            state.trendData = [];
        }
        
        // 更新显示
        updateDisplay(pnlResponse, state.trendData);
        
        console.log('Query completed:', pnlResponse);
    } catch (error) {
        console.error('Query failed:', error);
        showError('查询失败，请检查后端服务');
    } finally {
        // 恢复按钮状态
        elements.queryBtn.innerHTML = '查询';
        elements.queryBtn.disabled = false;
    }
}

// 处理重置
function handleReset() {
    elements.startDate.value = '2025-11-01';
    elements.endDate.value = new Date().toISOString().split('T')[0];
    
    // 清空多选下拉框的所有选中项
    Array.from(elements.portfolioSelect.options).forEach(option => {
        option.selected = false;
    });
    Array.from(elements.productSelect.options).forEach(option => {
        option.selected = false;
    });
    
    // 清空显示
    elements.totalPnl.textContent = '--';
    elements.totalPnl.className = 'metric-value';
    elements.interestPnl.textContent = '--';
    elements.interestPnl.className = 'metric-value';
    elements.valuationPnl.textContent = '--';
    elements.valuationPnl.className = 'metric-value';
    elements.priceDiffPnl.textContent = '--';
    elements.priceDiffPnl.className = 'metric-value';
    elements.dataTableBody.innerHTML = '<tr><td colspan="8" class="empty-state">请点击查询按钮加载数据</td></tr>';
    
    state.currentData = null;
    state.trendData = null;
    
    // 清空图表
    clearCharts();
}

// 处理导出
async function handleExport() {
    try {
        if (!state.currentData) {
            alert('请先查询数据');
            return;
        }
        
        const analysisType = 'mark_to_market'; // 默认使用按市价分析
        const startDate = elements.startDate.value;
        const endDate = elements.endDate.value;
        
        // 处理投资组合（单选下拉框）
        const portfolioValue = elements.portfolioSelect.value;
        const portfolioIds = portfolioValue && portfolioValue !== '' ? portfolioValue : '';
        
        // 处理产品（单选下拉框）
        const productValue = elements.productSelect.value;
        const productCodes = productValue && productValue !== '' ? productValue : '';
        
        const groupBy = 'portfolio'; // 默认使用簿记架构分组
        
        await api.exportExcel({
            start_date: startDate,
            end_date: endDate,
            analysis_type: analysisType,
            portfolio_ids: portfolioIds,
            product_codes: productCodes,
            group_by: groupBy
        });
    } catch (error) {
        console.error('Export failed:', error);
        alert('导出失败，请稍后重试');
    }
}

// 更新显示
function updateDisplay(pnlData, trendData) {
    console.log('updateDisplay called with:', { pnlData, trendData });
    
    // 更新核心指标
    updateMetrics(pnlData);
    
    // 更新警告
    updateWarnings(pnlData.warnings);
    
    // 更新TAB内容
    updateTabs(pnlData.details);
    
    // 更新图表（确保在DOM准备好后更新）
    setTimeout(() => {
        console.log('Updating charts with trend data:', trendData);
        updateCharts(pnlData, trendData);
    }, 100);
}

// 更新核心指标
function updateMetrics(data) {
    // 累计损益总额
    const total = data.total_pnl || 0;
    elements.totalPnl.textContent = formatNumber(total);
    elements.totalPnl.className = 'metric-value ' + getNumberClass(total);
    
    // 计算各项损益（从details中汇总）
    let interestTotal = 0;
    let valuationTotal = 0;
    let priceDiffTotal = 0;
    
    if (data.details && data.details.length > 0) {
        data.details.forEach(detail => {
            interestTotal += detail.pnl_interest || 0;
            valuationTotal += detail.pnl_valuation || 0;
            priceDiffTotal += detail.pnl_price_diff || 0;
        });
    }
    
    // 利息损益
    elements.interestPnl.textContent = formatNumber(interestTotal);
    elements.interestPnl.className = 'metric-value ' + getNumberClass(interestTotal);
    
    // 估值损益
    elements.valuationPnl.textContent = formatNumber(valuationTotal);
    elements.valuationPnl.className = 'metric-value ' + getNumberClass(valuationTotal);
    
    // 价差损益
    elements.priceDiffPnl.textContent = formatNumber(priceDiffTotal);
    elements.priceDiffPnl.className = 'metric-value ' + getNumberClass(priceDiffTotal);
}

// 更新警告
function updateWarnings(warnings) {
    if (warnings && warnings.length > 0) {
        elements.warningsSection.style.display = 'block';
        elements.warningsList.innerHTML = '';
        warnings.forEach(warning => {
            const li = document.createElement('li');
            li.textContent = `[${warning.type}] ${warning.date}: ${warning.product || 'N/A'} - ${warning.suggested_action}`;
            elements.warningsList.appendChild(li);
        });
    } else {
        elements.warningsSection.style.display = 'none';
    }
}

// TAB切换处理
function handleTabSwitch(event) {
    const tabButton = event.currentTarget;
    const tabId = tabButton.getAttribute('data-tab');
    
    // 移除所有active状态
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 激活选中的TAB
    tabButton.classList.add('active');
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // 如果切换到图表TAB，需要初始化并更新图表
    if (tabId === 'tab2') {
        // 初始化产品分类饼图
        if (typeof initProductPieChart === 'function' && !window.productPieChartInstance) {
            initProductPieChart();
        }
        if (state.currentData && state.currentData.details && typeof updateProductPieChart === 'function') {
            updateProductPieChart(state.currentData.details);
        }
    } else if (tabId === 'tab3') {
        // 初始化损益分项柱状图
        if (typeof initComponentBarChart === 'function' && !window.componentBarChartInstance) {
            initComponentBarChart();
        }
        if (state.currentData && state.currentData.details && typeof updateComponentBarChart === 'function') {
            updateComponentBarChart(state.currentData.details);
        }
    }
}

// 更新TAB内容
function updateTabs(details) {
    // Tab1: 按投组维度表格
    updatePortfolioTable(details);
    
    // Tab2: 按产品分类饼图（如果当前激活）
    if (document.getElementById('tab2').classList.contains('active')) {
        updateProductPieChart(details);
    }
    
    // Tab3: 按损益分项柱状图（如果当前激活）
    if (document.getElementById('tab3').classList.contains('active')) {
        updateComponentBarChart(details);
    }
}

// 更新投组维度表格
function updatePortfolioTable(details) {
    if (!elements.portfolioTableBody) return;
    
    elements.portfolioTableBody.innerHTML = '';
    
    if (!details || details.length === 0) {
        elements.portfolioTableBody.innerHTML = '<tr><td colspan="9" class="empty-state">暂无数据</td></tr>';
        return;
    }
    
    // 获取查询条件中选中的投组
    const selectedPortfolio = state.selectedPortfolio;
    
    // 投组值到显示名称的映射
    const portfolioNameMap = {
        'all': '全机构',
        'fx_spot': '外汇即期投组',
        'derivative': '衍生品投组',
        'ir': '利率投组',
        'option': '期权投组'
    };
    
    // 投组值到匹配关键词的映射（用于匹配dimension_value）
    const portfolioMatchMap = {
        'all': ['全机构', '全部', 'all'],
        'fx_spot': ['外汇即期', '外汇即期投组', 'fx_spot', 'FX_SPOT', 'fxspot'],
        'derivative': ['衍生品', '衍生品投组', 'derivative', 'DERIVATIVE'],
        'ir': ['利率', '利率投组', 'ir', 'IR'],
        'option': ['期权', '期权投组', 'option', 'OPTION']
    };
    
    // 如果选择了特定投组，需要过滤数据
    // 后端已经根据portfolio_ids过滤了数据，但dimension_value可能不直接对应
    // 所以这里主要确保显示的数据与查询条件一致
    let filteredDetails = details;
    
    if (selectedPortfolio && selectedPortfolio !== '' && selectedPortfolio !== 'all') {
        // 选择了特定投组，尝试匹配dimension_value
        const matchKeywords = portfolioMatchMap[selectedPortfolio] || [];
        filteredDetails = details.filter(detail => {
            const dimensionValue = (detail.dimension_value || '').toLowerCase();
            // 检查dimension_value是否包含匹配关键词
            return matchKeywords.some(keyword => 
                dimensionValue.includes(keyword.toLowerCase())
            );
        });
        
        // 如果没有匹配到，但后端返回了数据，说明后端已经过滤了，直接显示
        if (filteredDetails.length === 0 && details.length > 0) {
            // 后端已经过滤，直接使用后端返回的数据
            filteredDetails = details;
        }
    } else if (selectedPortfolio === 'all' || !selectedPortfolio) {
        // 选择了"全机构"或未选择，显示所有数据
        filteredDetails = details;
    }
    
    // 如果没有数据，显示提示
    if (filteredDetails.length === 0) {
        elements.portfolioTableBody.innerHTML = '<tr><td colspan="9" class="empty-state">当前查询条件下暂无数据</td></tr>';
        return;
    }
    
    // 产品代码到投组的映射
    const productToPortfolioMap = {
        // 外汇即期投组
        'fwd01': '外汇即期投组',
        'fxspot': '外汇即期投组',
        'fx_spot': '外汇即期投组',
        
        // 衍生品投组
        'ccs01': '衍生品投组',
        'ausw01': '衍生品投组',
        'fxsw01': '衍生品投组',
        'fxsw02': '衍生品投组',
        
        // 利率投组
        'bond01': '利率投组',
        'bond03': '利率投组',
        'cb01': '利率投组',
        'sw01': '利率投组',
        'sw02': '利率投组',
        '5025242': '利率投组',
        'lend01': '利率投组',
        
        // 期权投组
        'fxo01': '期权投组',
        'fxo02': '期权投组',
        'cpfr01': '期权投组',
    };
    
    // 投组名称映射函数
    const mapPortfolioName = (dimensionValue) => {
        if (!dimensionValue) return '未知投组';
        
        const value = dimensionValue.toLowerCase().trim();
        
        // 首先尝试通过产品代码直接匹配
        if (productToPortfolioMap[value]) {
            return productToPortfolioMap[value];
        }
        
        // 如果dimension_value包含产品代码，尝试匹配
        for (const [productCode, portfolioName] of Object.entries(productToPortfolioMap)) {
            if (value.includes(productCode) || value === productCode) {
                return portfolioName;
            }
        }
        
        // 按优先级匹配投组（通过关键词）
        if (value.includes('外汇即期') || value.includes('fx_spot') || value.includes('fxspot') || value.includes('fwd01')) {
            return '外汇即期投组';
        } else if (value.includes('衍生品') || value.includes('derivative') || value.includes('ccs01') || value.includes('ausw01')) {
            return '衍生品投组';
        } else if (value.includes('期权') || value.includes('option') || value.includes('fxo01') || value.includes('fxo02') || value.includes('cpfr01')) {
            return '期权投组';
        } else if (value.includes('利率') || value.includes('bond01') || value.includes('sw01') || value.includes('5025242') || (value.includes('ir') && !value.includes('期权'))) {
            return '利率投组';
        } else {
            // 如果无法匹配，尝试通过关键词匹配
            for (const [key, keywords] of Object.entries(portfolioMatchMap)) {
                if (key !== 'all' && keywords.some(keyword => value.includes(keyword.toLowerCase()))) {
                    return portfolioNameMap[key] || dimensionValue;
                }
            }
            // 默认返回原始值
            return dimensionValue;
        }
    };
    
    // 按投组名称分组并汇总数据（去重）
    const portfolioMap = new Map();
    
    filteredDetails.forEach(detail => {
        // 将dimension_value映射到标准投组显示名称
        const portfolioDisplayName = mapPortfolioName(detail.dimension_value);
        
        // 如果该投组已存在，汇总数据
        if (portfolioMap.has(portfolioDisplayName)) {
            const existing = portfolioMap.get(portfolioDisplayName);
            existing.pnl_interest += detail.pnl_interest || 0;
            existing.pnl_price_diff += detail.pnl_price_diff || 0;
            existing.pnl_valuation += detail.pnl_valuation || 0;
            existing.pnl_financing += detail.pnl_financing || 0;
            existing.pnl_fee += detail.pnl_fee || 0;
            existing.total_pnl += detail.total_pnl || 0;
            // 保存原始dimension_value列表，用于查看明细
            if (!existing.originalValues) {
                existing.originalValues = [];
            }
            existing.originalValues.push(detail.dimension_value);
        } else {
            // 创建新的投组数据
            portfolioMap.set(portfolioDisplayName, {
                portfolioDisplayName: portfolioDisplayName,
                pnl_interest: detail.pnl_interest || 0,
                pnl_price_diff: detail.pnl_price_diff || 0,
                pnl_valuation: detail.pnl_valuation || 0,
                pnl_financing: detail.pnl_financing || 0,
                pnl_fee: detail.pnl_fee || 0,
                total_pnl: detail.total_pnl || 0,
                originalValues: [detail.dimension_value]
            });
        }
    });
    
    // 计算总损益，用于计算占比
    const totalPnl = Array.from(portfolioMap.values()).reduce((sum, item) => sum + item.total_pnl, 0);
    
    // 按投组名称排序并显示
    const sortedPortfolios = Array.from(portfolioMap.values()).sort((a, b) => {
        // 按投组名称排序
        const order = ['外汇即期投组', '衍生品投组', '利率投组', '期权投组'];
        const indexA = order.indexOf(a.portfolioDisplayName);
        const indexB = order.indexOf(b.portfolioDisplayName);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.portfolioDisplayName.localeCompare(b.portfolioDisplayName);
    });
    
    sortedPortfolios.forEach(portfolioData => {
        const row = document.createElement('tr');
        // 计算占比
        const percentage = totalPnl !== 0 ? (portfolioData.total_pnl / totalPnl * 100) : 0;
        // 获取原始dimension_value，用于查看明细
        const originalValue = portfolioData.originalValues.join(', ');
        
        row.innerHTML = `
            <td>${portfolioData.portfolioDisplayName}</td>
            <td class="${getNumberClass(portfolioData.pnl_interest)}">${formatNumber(portfolioData.pnl_interest)}</td>
            <td class="${getNumberClass(portfolioData.pnl_price_diff)}">${formatNumber(portfolioData.pnl_price_diff)}</td>
            <td class="${getNumberClass(portfolioData.pnl_valuation)}">${formatNumber(portfolioData.pnl_valuation)}</td>
            <td class="${getNumberClass(portfolioData.pnl_financing)}">${formatNumber(portfolioData.pnl_financing)}</td>
            <td class="${getNumberClass(portfolioData.pnl_fee)}">${formatNumber(portfolioData.pnl_fee)}</td>
            <td class="${getNumberClass(portfolioData.total_pnl)}"><strong>${formatNumber(portfolioData.total_pnl)}</strong></td>
            <td>${percentage.toFixed(2)}%</td>
            <td>
                <button class="action-btn" onclick="showTransactionDetail('${portfolioData.portfolioDisplayName}', '${originalValue}')">查看明细</button>
            </td>
        `;
        elements.portfolioTableBody.appendChild(row);
    });
}

// 显示交易明细
async function showTransactionDetail(portfolio, originalValues = '') {
    if (!elements.transactionDetailModal) return;
    
    elements.transactionDetailModal.style.display = 'flex';
    
    // 显示加载状态
    elements.transactionDetailContent.innerHTML = `
        <div style="padding: 20px;">
            <h4>投组: ${portfolio}</h4>
            <p style="margin-top: 16px; color: var(--text-secondary);">交易明细数据加载中...</p>
        </div>
    `;
    
    try {
        // 获取当前查询参数
        const startDate = elements.startDate.value;
        const endDate = elements.endDate.value;
        
        // 调用API获取交易明细
        const requestData = {
            start_date: startDate,
            end_date: endDate,
            dimension_type: 'portfolio',
            dimension_value: portfolio,
            portfolio_ids: state.selectedPortfolio && state.selectedPortfolio !== 'all' ? state.selectedPortfolio : null,
            product_codes: null
        };
        
        const response = await api.getTransactionDetails(requestData);
        
        // 更新交易明细表格
        updateTransactionTable(response.transactions || [], portfolio);
        
    } catch (error) {
        console.error('Failed to load transaction details:', error);
        elements.transactionDetailContent.innerHTML = `
            <div style="padding: 20px;">
                <h4>投组: ${portfolio}</h4>
                <p style="margin-top: 16px; color: var(--text-error);">加载失败：${error.message || '未知错误'}</p>
            </div>
        `;
    }
}

// 更新交易明细表格
function updateTransactionTable(transactions, portfolio) {
    if (!elements.transactionDetailContent) return;
    
    if (!transactions || transactions.length === 0) {
        elements.transactionDetailContent.innerHTML = `
            <div style="padding: 20px;">
                <h4>投组: ${portfolio}</h4>
                <p style="margin-top: 16px; color: var(--text-secondary);">暂无交易数据</p>
            </div>
        `;
        return;
    }
    
    // 构建表格HTML
    let tableHTML = `
        <div style="padding: 20px;">
            <h4>投组: ${portfolio}</h4>
            <p style="margin-top: 8px; color: var(--text-secondary); font-size: 14px;">共 ${transactions.length} 笔交易</p>
            <div class="table-container" style="margin-top: 16px; max-height: 500px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">交易ID</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">交易日期</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">产品代码</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">产品名称</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">交易方向</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">名义本金（万元）</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">价格</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">利息损益</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">价差损益</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">估值损益</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">融资成本</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">手续费</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">总损益</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    transactions.forEach(txn => {
        const pnlClass = txn.total_pnl > 0 ? 'positive' : txn.total_pnl < 0 ? 'negative' : '';
        tableHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px;">${txn.transaction_id}</td>
                <td style="padding: 10px;">${txn.trade_date}</td>
                <td style="padding: 10px;">${txn.product_code}</td>
                <td style="padding: 10px;">${txn.product_name}</td>
                <td style="padding: 10px;">${txn.trade_direction}</td>
                <td style="padding: 10px; text-align: right;">${formatNumber(txn.notional_amount)}</td>
                <td style="padding: 10px; text-align: right;">${txn.price ? formatNumber(txn.price, 4) : '--'}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_interest)}">${formatNumber(txn.pnl_interest)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_price_diff)}">${formatNumber(txn.pnl_price_diff)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_valuation)}">${formatNumber(txn.pnl_valuation)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_financing)}">${formatNumber(txn.pnl_financing)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_fee)}">${formatNumber(txn.pnl_fee)}</td>
                <td style="padding: 10px; text-align: right; ${pnlClass}"><strong>${formatNumber(txn.total_pnl)}</strong></td>
            </tr>
        `;
    });
    
    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    elements.transactionDetailContent.innerHTML = tableHTML;
}

// 关闭交易明细模态框
function closeTransactionModal() {
    if (elements.transactionDetailModal) {
        elements.transactionDetailModal.style.display = 'none';
    }
}

// 将函数暴露到全局，供onclick使用
window.showTransactionDetail = showTransactionDetail;

// 显示产品明细
async function showProductDetail(productName) {
    if (!elements.transactionDetailModal) return;
    
    // 显示模态框
    elements.transactionDetailModal.style.display = 'flex';
    
    // 显示加载状态
    elements.transactionDetailContent.innerHTML = `
        <div style="padding: 20px;">
            <h4>产品: ${productName}</h4>
            <p style="margin-top: 16px; color: var(--text-secondary);">交易明细数据加载中...</p>
        </div>
    `;
    
    try {
        // 从当前数据中获取该产品对应的产品代码
        if (!state.currentData || !state.currentData.details) {
            throw new Error('暂无数据');
        }
        
        // 产品名称到产品代码的反向映射（与后端保持一致）
        const productNameToCodesMap = {
            '外汇即期': ['FXSPOT', 'fxspot', 'fx_spot', 'fxspot01'],
            '外汇远期': ['FWD', 'FWD01', 'fwd01', 'fwd02'],
            '外汇掉期': ['FXSW', 'fxsw01', 'fxsw02'],
            '外汇期权': ['FXOPT', 'FXO', 'fxo01', 'fxo02', 'fxopt'],
            'CCS': ['CCS', 'ccs01'],
            'IRS': ['IRS', 'SW01', 'SW02', 'sw01', 'sw02']
        };
        
        // 获取该产品对应的所有可能的产品代码
        const productCodes = productNameToCodesMap[productName] || [productName];
        
        // 从details中查找匹配的产品代码
        let matchedProductCode = null;
        for (const detail of state.currentData.details) {
            const detailValue = detail.dimension_value || '';
            for (const code of productCodes) {
                // 不区分大小写匹配
                if (detailValue.toUpperCase() === code.toUpperCase() || 
                    detailValue.toUpperCase().includes(code.toUpperCase()) ||
                    code.toUpperCase().includes(detailValue.toUpperCase())) {
                    matchedProductCode = detail.dimension_value;
                    break;
                }
            }
            if (matchedProductCode) break;
        }
        
        // 如果没找到，使用第一个产品代码作为默认值
        if (!matchedProductCode && productCodes.length > 0) {
            matchedProductCode = productCodes[0];
        }
        
        // 获取当前查询参数
        const startDate = elements.startDate.value;
        const endDate = elements.endDate.value;
        
        // 调用API获取交易明细
        const requestData = {
            start_date: startDate,
            end_date: endDate,
            dimension_type: 'product',
            dimension_value: matchedProductCode || productName,
            portfolio_ids: state.selectedPortfolio && state.selectedPortfolio !== 'all' ? state.selectedPortfolio : null,
            product_codes: matchedProductCode || productCodes[0] || productName
        };
        
        console.log('Fetching product transaction details:', requestData);
        
        const response = await api.getTransactionDetails(requestData);
        
        // 更新交易明细表格（使用相同的函数，但标题改为产品名称）
        updateProductTransactionTable(response.transactions || [], productName);
        
    } catch (error) {
        console.error('Failed to load product transaction details:', error);
        elements.transactionDetailContent.innerHTML = `
            <div style="padding: 20px;">
                <h4>产品: ${productName}</h4>
                <p style="margin-top: 16px; color: var(--danger);">加载失败：${error.message || '未知错误'}</p>
            </div>
        `;
    }
}

// 更新产品交易明细表格
function updateProductTransactionTable(transactions, productName) {
    if (!elements.transactionDetailContent) return;
    
    if (!transactions || transactions.length === 0) {
        elements.transactionDetailContent.innerHTML = `
            <div style="padding: 20px;">
                <h4>产品: ${productName}</h4>
                <p style="margin-top: 16px; color: var(--text-secondary);">暂无交易数据</p>
            </div>
        `;
        return;
    }
    
    // 构建表格HTML（与updateTransactionTable相同）
    let tableHTML = `
        <div style="padding: 20px;">
            <h4>产品: ${productName}</h4>
            <p style="margin-top: 8px; color: var(--text-secondary); font-size: 14px;">共 ${transactions.length} 笔交易</p>
            <div class="table-container" style="margin-top: 16px; max-height: 500px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">交易ID</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">交易日期</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">产品代码</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">产品名称</th>
                            <th style="padding: 12px; text-align: left; font-weight: 600; color: var(--text-primary);">交易方向</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">名义本金（万元）</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">价格</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">利息损益</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">价差损益</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">估值损益</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">融资成本</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">手续费</th>
                            <th style="padding: 12px; text-align: right; font-weight: 600; color: var(--text-primary);">总损益</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    transactions.forEach(txn => {
        const pnlClass = txn.total_pnl > 0 ? 'positive' : txn.total_pnl < 0 ? 'negative' : '';
        tableHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px;">${txn.transaction_id}</td>
                <td style="padding: 10px;">${txn.trade_date}</td>
                <td style="padding: 10px;">${txn.product_code}</td>
                <td style="padding: 10px;">${txn.product_name}</td>
                <td style="padding: 10px;">${txn.trade_direction}</td>
                <td style="padding: 10px; text-align: right;">${formatNumber(txn.notional_amount)}</td>
                <td style="padding: 10px; text-align: right;">${txn.price ? txn.price.toLocaleString('zh-CN', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '--'}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_interest)}">${formatNumber(txn.pnl_interest)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_price_diff)}">${formatNumber(txn.pnl_price_diff)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_valuation)}">${formatNumber(txn.pnl_valuation)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_financing)}">${formatNumber(txn.pnl_financing)}</td>
                <td style="padding: 10px; text-align: right; ${getNumberClass(txn.pnl_fee)}">${formatNumber(txn.pnl_fee)}</td>
                <td style="padding: 10px; text-align: right; ${pnlClass}"><strong>${formatNumber(txn.total_pnl)}</strong></td>
            </tr>
        `;
    });
    
    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    elements.transactionDetailContent.innerHTML = tableHTML;
}

// 将函数暴露到全局
window.showProductDetail = showProductDetail;

// 显示错误
function showError(message) {
    alert(message);
}

// 工具函数
function formatNumber(num) {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getNumberClass(num) {
    if (num > 0) return 'positive';
    if (num < 0) return 'negative';
    return 'neutral';
}

// 更新时间显示
function updateWidgetTimes() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });
    document.querySelectorAll('.widget-time').forEach(el => {
        el.textContent = timeStr;
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    // 每秒更新时间
    setInterval(updateWidgetTimes, 1000);
    updateWidgetTimes();
});





