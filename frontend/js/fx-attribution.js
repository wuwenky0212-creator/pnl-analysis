/**
 * 外汇类损益归因分析主应用逻辑
 */

// 全局状态
const fxState = {
    portfolios: [],
    fxProducts: [],
    currentData: null,
    trendData: null,
    fxData: {
        portfolio: null,
        product: null,
        currencyPair: null
    }
    // trendChartVisible已移除，趋势图直接显示
};

// DOM 元素
const fxElements = {
    // 配置面板
    startDate: document.getElementById('fxStartDate'),
    endDate: document.getElementById('fxEndDate'),
    portfolioSelect: document.getElementById('fxPortfolioSelect'),
    productSelect: document.getElementById('fxProductSelect'),
    currencyPairSelect: document.getElementById('fxCurrencyPairSelect'),
    queryBtn: document.getElementById('fxQueryBtn'),
    resetBtn: document.getElementById('fxResetBtn'),
    
    // 指标卡片
    valuationPnl: document.getElementById('fxValuationPnl'),
    
    // 警告
    warningsSection: document.getElementById('fxWarningsSection'),
    warningsList: document.getElementById('fxWarningsList'),
    
    // 表格
    attributionTableBody: document.getElementById('fxAttributionTableBody'),
    portfolioSensitivityTableBody: document.getElementById('fxPortfolioSensitivityTableBody'),
    assetTargetTableBody: document.getElementById('fxAssetTargetTableBody'),
    
    // Tab按钮
    tabButtons: document.querySelectorAll('.tab-nav .tab-button[data-tab^="fxTab"]'),
    
};

// 初始化
async function initFXAttribution() {
    // 设置默认结束日期为今天
    const today = new Date().toISOString().split('T')[0];
    if (fxElements.endDate) {
        fxElements.endDate.value = today;
    }
    
    
    // 加载基础数据
    await loadFXBaseData();
    
    // 绑定事件
    bindFXEvents();
    
    console.log('FX Attribution Application initialized');
}

// 加载基础数据
async function loadFXBaseData() {
    try {
        // 投资组合和产品已改为固定下拉框，不需要从API加载
        // 设置默认值
        if (fxElements.portfolioSelect) {
            fxElements.portfolioSelect.value = '';
        }
        if (fxElements.productSelect) {
            fxElements.productSelect.value = '';
        }
        
        console.log('FX Base data initialized');
    } catch (error) {
        console.error('Failed to initialize:', error);
        showFXError('初始化失败');
    }
}

// 填充投资组合下拉框（已废弃，使用固定选项）
function populateFXPortfolios() {
    // 不再需要，使用HTML中的固定选项
}

// 填充外汇产品下拉框（已废弃，使用固定选项）
function populateFXProducts() {
    // 不再需要，使用HTML中的固定选项
}

// 绑定事件
function bindFXEvents() {
    if (fxElements.queryBtn) {
        fxElements.queryBtn.addEventListener('click', handleFXQuery);
    }
    
    if (fxElements.resetBtn) {
        fxElements.resetBtn.addEventListener('click', handleFXReset);
    }
    
    // 绑定Tab切换事件
    if (fxElements.tabButtons && fxElements.tabButtons.length > 0) {
        fxElements.tabButtons.forEach(button => {
            button.addEventListener('click', handleFXTabSwitch);
        });
    }
    
    // 导出按钮已移除
    // 趋势图切换按钮已移除，趋势图直接显示
}

// 处理查询
async function handleFXQuery() {
    try {
        const startDate = fxElements.startDate.value;
        const endDate = fxElements.endDate.value;
        
        if (!startDate || !endDate) {
            alert('请选择日期范围');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('起始日期不能大于结束日期');
            return;
        }
        
        // 处理投资组合（单选下拉框）
        const portfolioValue = fxElements.portfolioSelect.value;
        const portfolioIds = portfolioValue && portfolioValue !== '' ? [portfolioValue] : [];
        
        // 处理产品（单选下拉框）
        const productValue = fxElements.productSelect.value;
        const productCodes = productValue && productValue !== '' ? [productValue] : [];
        
        // 处理标的（货币对，单选下拉框）
        const currencyPairValue = fxElements.currencyPairSelect.value;
        const currencyPairs = currencyPairValue && currencyPairValue !== '' ? [currencyPairValue] : [];
        
        const groupBy = 'portfolio'; // 默认使用簿记架构分组
        
        // 显示加载状态
        fxElements.queryBtn.disabled = true;
        fxElements.queryBtn.textContent = '查询中...';
        
        // 调用API获取三个维度的数据
        const baseRequestData = {
            start_date: startDate,
            end_date: endDate,
            portfolio_ids: portfolioIds,
            product_codes: productCodes,
            currency_pairs: currencyPairs
        };
        
        // 并行请求三个维度的数据
        const [portfolioResponse, productResponse, currencyPairResponse] = await Promise.all([
            api.calculateFXAttribution({ ...baseRequestData, group_by: 'portfolio' }),
            api.calculateFXAttribution({ ...baseRequestData, group_by: 'product' }),
            api.calculateFXAttribution({ ...baseRequestData, group_by: 'currency_pair' })
        ]);
        
        // 保存三个维度的数据
        fxState.fxData = {
            portfolio: portfolioResponse,
            product: productResponse,
            currencyPair: currencyPairResponse
        };
        
        // 使用portfolio数据作为主数据（用于显示指标等）
        fxState.currentData = portfolioResponse;
        
        // 更新界面
        updateFXDisplay(portfolioResponse);
        
        // 加载趋势数据并更新趋势图
        await loadFXTrendData({ ...baseRequestData, group_by: 'portfolio' });
        
    } catch (error) {
        console.error('Query failed:', error);
        showFXError('查询失败：' + (error.message || '未知错误'));
    } finally {
        if (fxElements.queryBtn) {
            fxElements.queryBtn.disabled = false;
            fxElements.queryBtn.textContent = '查询';
        }
    }
}

// 加载趋势数据
async function loadFXTrendData(requestData) {
    try {
        const params = {
            start_date: requestData.start_date,
            end_date: requestData.end_date,
            portfolio_ids: requestData.portfolio_ids.join(','),
            product_codes: requestData.product_codes.join(','),
            currency_pairs: requestData.currency_pairs.join(','),
            group_by: requestData.group_by
        };
        
        const response = await api.getFXTrend(params);
        fxState.trendData = response.trend_data || [];
        
        // 更新趋势图（直接显示，不需要切换）
        if (window.fxCharts && fxState.trendData.length > 0) {
            window.fxCharts.updateTrendChart(fxState.trendData);
        }
    } catch (error) {
        console.error('Failed to load trend data:', error);
    }
}

// 更新显示
function updateFXDisplay(data) {
    // 保存数据到state
    fxState.currentData = data;
    
    // 更新指标卡片
    updateFXMetrics(data);
    
    // 更新当前激活的Tab表格
    updateFXTabs(data.details || []);
    
    // 更新图表
    if (window.fxCharts) {
        window.fxCharts.updateCharts(data);
    }
    
    // 更新警告
    updateFXWarnings(data.warnings || []);
}

// Tab切换处理
function handleFXTabSwitch(event) {
    const button = event.currentTarget;
    const tabId = button.getAttribute('data-tab');
    
    // 移除所有active类
    fxElements.tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content[id^="fxTab"]').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 添加active类到当前Tab
    button.classList.add('active');
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // 如果切换到Tab2，需要初始化饼图
    if (tabId === 'fxTab2' && !window.fxProductPieChartInstance) {
        initFXProductPieChart();
    }
    
    // 如果已有数据，更新当前Tab的显示
    if (fxState.fxData) {
        updateFXTabs([]);
    }
}

// 更新所有Tab表格
function updateFXTabs(details) {
    // 获取当前激活的Tab
    const activeTab = document.querySelector('.tab-button.active[data-tab^="fxTab"]');
    if (!activeTab) return;
    
    const tabId = activeTab.getAttribute('data-tab');
    
    // 根据Tab使用对应的数据
    if (tabId === 'fxTab1') {
        // 归因明细 - 按投组维度展示归因结果
        const portfolioData = fxState.fxData?.portfolio;
        updateFXAttributionTable(portfolioData?.details || []);
    } else if (tabId === 'fxTab2') {
        // 按投组 - 展示敏感值
        const portfolioData = fxState.fxData?.portfolio;
        updateFXPortfolioSensitivityTable(portfolioData?.details || []);
    } else if (tabId === 'fxTab3') {
        // 按资产标的 - 展示货币对归因结果
        const currencyPairData = fxState.fxData?.currencyPair;
        updateFXAssetTargetTable(currencyPairData?.details || []);
    }
}

// 更新指标
function updateFXMetrics(data) {
    if (fxElements.valuationPnl) {
        const value = data.total_valuation_pnl || 0;
        fxElements.valuationPnl.textContent = formatNumber(value);
        fxElements.valuationPnl.className = 'metric-value ' + getNumberClass(value);
    }
}

// 账户名称映射（归因明细使用）
const fxAccountNameMap = {
    '外汇即期自营户': '外汇即期自营户',
    '外汇即期内部报价户': '外汇即期内部报价户',
    '外汇远期自营户': '外汇远期自营户',
    '外汇远期内部报价户': '外汇远期内部报价户',
    '外汇掉期自营户': '外汇掉期自营户'
};

// 映射账户显示名称（用于归因明细）
function mapFXAccountName(dimensionValue) {
    if (!dimensionValue) return '未知';
    
    // 标准化处理：去除空格
    const value = dimensionValue.trim();
    
    // 尝试直接匹配
    if (fxAccountNameMap[value]) {
        return fxAccountNameMap[value];
    }
    
    // 如果包含关键词，尝试匹配
    if (value.includes('即期') && value.includes('自营')) {
        return '外汇即期自营户';
    } else if (value.includes('即期') && value.includes('内部')) {
        return '外汇即期内部报价户';
    } else if (value.includes('远期') && value.includes('自营')) {
        return '外汇远期自营户';
    } else if (value.includes('远期') && value.includes('内部')) {
        return '外汇远期内部报价户';
    } else if (value.includes('掉期') && value.includes('自营')) {
        return '外汇掉期自营户';
    }
    
    // 默认返回原始值
    return dimensionValue.trim();
}

// 投组名称映射（保留用于其他地方）
const fxPortfolioNameMap = {
    '外汇即期投组': '外汇即期投组',
    '外汇远期投组': '外汇远期投组',
    '外汇掉期投组': '外汇掉期投组',
    '外汇期权投组': '外汇期权投组'
};

// 映射投组显示名称（用于按投组和按资产标的Tab）
function mapFXPortfolioName(dimensionValue) {
    if (!dimensionValue) return '未知';
    
    // 尝试直接匹配
    if (fxPortfolioNameMap[dimensionValue]) {
        return fxPortfolioNameMap[dimensionValue];
    }
    
    // 标准化处理：去除空格，转换为小写
    const value = dimensionValue.trim().toLowerCase();
    
    // 精确匹配标准名称
    const normalizedMap = {
        '外汇即期投组': '外汇即期投组',
        '外汇远期投组': '外汇远期投组',
        '外汇掉期投组': '外汇掉期投组',
        '外汇期权投组': '外汇期权投组',
        '外汇即期': '外汇即期投组',
        '外汇远期': '外汇远期投组',
        '外汇掉期': '外汇掉期投组',
        '外汇期权': '外汇期权投组'
    };
    
    if (normalizedMap[dimensionValue.trim()]) {
        return normalizedMap[dimensionValue.trim()];
    }
    
    // 关键词匹配（更宽松的匹配）
    if (value.includes('即期') || value.includes('spot') || value.includes('fxspot')) {
        return '外汇即期投组';
    } else if (value.includes('远期') || value.includes('forward') || value.includes('fwd')) {
        return '外汇远期投组';
    } else if (value.includes('掉期') || value.includes('swap') || value.includes('fxsw')) {
        return '外汇掉期投组';
    } else if (value.includes('期权') || value.includes('option') || value.includes('fxo')) {
        return '外汇期权投组';
    }
    
    // 如果包含投组相关的关键词，尝试提取产品类型
    if (value.includes('投组') || value.includes('portfolio')) {
        if (value.includes('即期') || value.includes('spot')) {
            return '外汇即期投组';
        } else if (value.includes('远期') || value.includes('forward') || value.includes('fwd')) {
            return '外汇远期投组';
        } else if (value.includes('掉期') || value.includes('swap') || value.includes('fxsw')) {
            return '外汇掉期投组';
        } else if (value.includes('期权') || value.includes('option') || value.includes('fxo')) {
            return '外汇期权投组';
        }
    }
    
    // 默认返回原始值（但尝试标准化）
    console.warn('未匹配的投组名称:', dimensionValue);
    return dimensionValue;
}

// Tab1: 更新归因明细表格（按投组维度，包含总敞口和资产标的）
function updateFXAttributionTable(details) {
    if (!fxElements.attributionTableBody) return;
    
    fxElements.attributionTableBody.innerHTML = '';
    
    if (!details || details.length === 0) {
        fxElements.attributionTableBody.innerHTML = '<tr><td colspan="16" class="empty-state">暂无数据</td></tr>';
        return;
    }
    
    // 按账户名称去重并汇总
    const portfolioMap = new Map();
    details.forEach(detail => {
        const folderName = mapFXAccountName(detail.dimension_value);
        
        if (!portfolioMap.has(folderName)) {
            portfolioMap.set(folderName, {
                dimension_value: folderName,
                valuation_pnl: 0,
                factors: {},
                unexplained: 0,
                total_exposure: 0, // 总敞口
                start_date_factors: detail.start_date_factors,
                end_date_factors: detail.end_date_factors
            });
        }
        
        const aggregated = portfolioMap.get(folderName);
        aggregated.valuation_pnl += detail.valuation_pnl || 0;
        aggregated.unexplained += detail.unexplained || 0;
        
        // 收集总敞口（如果有的话，否则使用估值损益的绝对值作为估算）
        if (detail.total_exposure !== undefined) {
            aggregated.total_exposure += Math.abs(detail.total_exposure);
        } else {
            // 如果没有总敞口数据，使用估值损益的绝对值作为估算
            aggregated.total_exposure += Math.abs(detail.valuation_pnl || 0) * 10; // 估算系数
        }
        
        // 汇总因子
        (detail.factors || []).forEach(factor => {
            if (!aggregated.factors[factor.factor_code]) {
                aggregated.factors[factor.factor_code] = {
                    factor_code: factor.factor_code,
                    factor_name: factor.factor_name,
                    pnl_contribution: 0
                };
            }
            aggregated.factors[factor.factor_code].pnl_contribution += factor.pnl_contribution || 0;
        });
    });
    
    // 转换为数组并创建行
    Array.from(portfolioMap.values()).forEach(aggregated => {
        // 将factors对象转换为数组
        aggregated.factors = Object.values(aggregated.factors);
        
        const row = createFXAttributionTableRow(aggregated);
        fxElements.attributionTableBody.appendChild(row);
    });
}

// Tab2: 更新按投组敏感值表格
function updateFXPortfolioSensitivityTable(details) {
    if (!fxElements.portfolioSensitivityTableBody) return;
    
    fxElements.portfolioSensitivityTableBody.innerHTML = '';
    
    if (!details || details.length === 0) {
        fxElements.portfolioSensitivityTableBody.innerHTML = '<tr><td colspan="14" class="empty-state">暂无数据</td></tr>';
        return;
    }
    
    // 按投组名称去重并汇总敏感值和总敞口
    const portfolioMap = new Map();
    details.forEach(detail => {
        const portfolioName = mapFXPortfolioName(detail.dimension_value);
        
        if (!portfolioMap.has(portfolioName)) {
            portfolioMap.set(portfolioName, {
                dimension_value: portfolioName,
                factors: {},
                total_exposure: 0,
                valuation_pnl: 0,
                unexplained: 0
            });
        }
        
        const aggregated = portfolioMap.get(portfolioName);
        
        // 收集总敞口
        if (detail.total_exposure !== undefined) {
            aggregated.total_exposure += Math.abs(detail.total_exposure);
        } else {
            // 如果没有总敞口数据，使用估值损益的绝对值作为估算
            aggregated.total_exposure += Math.abs(detail.valuation_pnl || 0) * 10;
        }
        
        // 收集估值损益和无法解释部分（用于贡献度计算）
        aggregated.valuation_pnl += detail.valuation_pnl || 0;
        aggregated.unexplained += detail.unexplained || 0;
        
        // 汇总因子（敏感值）
        (detail.factors || []).forEach(factor => {
            if (!aggregated.factors[factor.factor_code]) {
                aggregated.factors[factor.factor_code] = {
                    factor_code: factor.factor_code,
                    factor_name: factor.factor_name,
                    pnl_contribution: 0
                };
            }
            aggregated.factors[factor.factor_code].pnl_contribution += factor.pnl_contribution || 0;
        });
    });
    
    // 转换为数组并创建行
    Array.from(portfolioMap.values()).forEach(aggregated => {
        const row = createFXSensitivityTableRow(aggregated);
        fxElements.portfolioSensitivityTableBody.appendChild(row);
    });
}

// 填充Tab3投组选择器
function populateFXAssetTargetPortfolioSelect(portfolioResponse) {
    if (!fxElements.assetTargetPortfolioSelect) return;
    
    // 保存当前选择的值
    const currentValue = fxElements.assetTargetPortfolioSelect.value;
    
    // 清空现有选项（保留"请选择投组"选项）
    fxElements.assetTargetPortfolioSelect.innerHTML = '<option value="">请选择投组</option>';
    
    if (!portfolioResponse || !portfolioResponse.details || portfolioResponse.details.length === 0) {
        return;
    }
    
    // 从portfolio数据中提取投组列表
    const portfolioSet = new Set();
    portfolioResponse.details.forEach(detail => {
        const portfolioName = mapFXPortfolioName(detail.dimension_value);
        portfolioSet.add(portfolioName);
    });
    
    // 添加"全机构"选项
    const optionAll = document.createElement('option');
    optionAll.value = 'all';
    optionAll.textContent = '全机构';
    fxElements.assetTargetPortfolioSelect.appendChild(optionAll);
    
    // 添加各个投组选项
    Array.from(portfolioSet).sort().forEach(portfolioName => {
        const option = document.createElement('option');
        // 使用标准化的投组名称作为value，方便匹配
        option.value = portfolioName;
        option.textContent = portfolioName;
        fxElements.assetTargetPortfolioSelect.appendChild(option);
    });
    
    // 恢复之前选择的值（如果仍然存在）
    if (currentValue) {
        fxElements.assetTargetPortfolioSelect.value = currentValue;
    }
}

// Tab3: 更新按资产标的表格（直接显示所有货币对数据）
function updateFXAssetTargetTable(details) {
    if (!fxElements.assetTargetTableBody) return;
    
    fxElements.assetTargetTableBody.innerHTML = '';
    
    if (!details || details.length === 0) {
        fxElements.assetTargetTableBody.innerHTML = '<tr><td colspan="15" class="empty-state">暂无数据</td></tr>';
        return;
    }
    
    // 按货币对汇总（虽然currencyPair数据已经按货币对汇总，但这里再次汇总以确保一致性）
    const currencyPairMap = new Map();
    details.forEach(detail => {
        const currencyPair = detail.dimension_value || '未知货币对';
        
        if (!currencyPairMap.has(currencyPair)) {
            currencyPairMap.set(currencyPair, {
                dimension_value: currencyPair,
                valuation_pnl: 0,
                factors: {},
                unexplained: 0
            });
        }
        
        const aggregated = currencyPairMap.get(currencyPair);
        aggregated.valuation_pnl += detail.valuation_pnl || 0;
        aggregated.unexplained += detail.unexplained || 0;
        
        // 汇总因子
        (detail.factors || []).forEach(factor => {
            if (!aggregated.factors[factor.factor_code]) {
                aggregated.factors[factor.factor_code] = {
                    factor_code: factor.factor_code,
                    factor_name: factor.factor_name,
                    pnl_contribution: 0
                };
            }
            aggregated.factors[factor.factor_code].pnl_contribution += factor.pnl_contribution || 0;
        });
    });
    
    // 转换为数组并创建行
    Array.from(currencyPairMap.values()).forEach(aggregated => {
        aggregated.factors = Object.values(aggregated.factors);
        const row = createFXTableRow(aggregated, 'currency_pair');
        fxElements.assetTargetTableBody.appendChild(row);
    });
}

// 更新投组维度表格（保留原函数，用于兼容）
function updateFXPortfolioTable(details) {
    // 重定向到新的归因明细表格
    updateFXAttributionTable(details);
}

// 更新产品维度饼图和表格
function updateFXProductTable(details) {
    if (!details || details.length === 0) {
        if (fxElements.productTableBody) {
            fxElements.productTableBody.innerHTML = '<tr><td colspan="4" class="empty-state">暂无数据</td></tr>';
        }
        return;
    }
    
    // 按产品汇总估值损益和归因分项
    const productMap = {};
    details.forEach(detail => {
        const productName = mapFXProductName(detail.dimension_value);
        if (!productMap[productName]) {
            productMap[productName] = {
                valuation_pnl: 0,
                factors: {},
                unexplained: 0
            };
        }
        productMap[productName].valuation_pnl += detail.valuation_pnl || 0;
        productMap[productName].unexplained += detail.unexplained || 0;
        
        // 汇总因子
        (detail.factors || []).forEach(factor => {
            if (!productMap[productName].factors[factor.factor_code]) {
                productMap[productName].factors[factor.factor_code] = {
                    factor_code: factor.factor_code,
                    factor_name: factor.factor_name,
                    pnl_contribution: 0
                };
            }
            productMap[productName].factors[factor.factor_code].pnl_contribution += factor.pnl_contribution || 0;
        });
    });
    
    // 按固定顺序排列产品
    const productOrder = ['外汇即期', '外汇远期', '外汇掉期', '外汇期权', 'CCS', 'IRS'];
    const labels = productOrder.filter(name => productMap.hasOwnProperty(name));
    const data = labels.map(label => productMap[label].valuation_pnl);
    
    // 计算总金额
    const total = data.reduce((sum, val) => sum + val, 0);
    
    // 更新饼图
    updateFXProductPieChart(labels, data);
    
    // 更新表格（传递产品详细信息）
    updateFXProductTableData(labels, data, total, productMap);
}

// 产品名称映射函数（用于外汇归因分析）
function mapFXProductName(dimensionValue) {
    if (!dimensionValue) return '未知';
    
    const value = dimensionValue.toLowerCase().trim();
    
    // 产品代码映射
    const productCodeMap = {
        'fxspot': '外汇即期',
        'fx_spot': '外汇即期',
        'fxspot01': '外汇即期',
        'fwd01': '外汇远期',
        'fwd02': '外汇远期',
        'fxsw01': '外汇掉期',
        'fxsw02': '外汇掉期',
        'fxo01': '外汇期权',
        'fxo02': '外汇期权',
        'fxopt': '外汇期权',
        'ccs01': 'CCS',
        'sw01': 'IRS',
        'sw02': 'IRS'
    };
    
    // 首先尝试直接匹配
    if (productCodeMap[value]) {
        return productCodeMap[value];
    }
    
    // 尝试包含匹配
    for (const [code, name] of Object.entries(productCodeMap)) {
        if (value.includes(code)) {
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
    } else if (value.includes('irs') || value.includes('利率互换') || value.includes('sw')) {
        return 'IRS';
    }
    
    // 默认返回原始值
    return dimensionValue;
}

// 更新产品饼图
function updateFXProductPieChart(labels, data) {
    if (!window.fxProductPieChartInstance) {
        initFXProductPieChart();
    }
    
    if (!window.fxProductPieChartInstance) return;
    
    window.fxProductPieChartInstance.data.labels = labels;
    window.fxProductPieChartInstance.data.datasets[0].data = data;
    window.fxProductPieChartInstance.update();
}

// 初始化产品饼图
function initFXProductPieChart() {
    const ctx = document.getElementById('fxProductPieChart');
    if (!ctx) return;
    
    window.fxProductPieChartInstance = new Chart(ctx, {
        type: 'doughnut',
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
                    '#00d9ff'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#333',
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
}

// 存储产品归因数据（用于按钮点击时获取）
let productAttributionDataMap = {};

// 更新产品表格数据
function updateFXProductTableData(labels, data, total, productMap = {}) {
    if (!fxElements.productTableBody) return;
    
    fxElements.productTableBody.innerHTML = '';
    
    if (labels.length === 0) {
        fxElements.productTableBody.innerHTML = '<tr><td colspan="4" class="empty-state">暂无数据</td></tr>';
        return;
    }
    
    // 保存产品数据到全局映射
    productAttributionDataMap = {};
    Object.keys(productMap).forEach(key => {
        productAttributionDataMap[key] = productMap[key];
    });
    
    // 创建数据数组并排序
    const tableData = labels.map((label, index) => ({
        label,
        value: data[index],
        percentage: total !== 0 ? (data[index] / total * 100).toFixed(2) : '0.00',
        productData: productMap[label] || null
    })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    
    // 生成表格行
    tableData.forEach(item => {
        const row = document.createElement('tr');
        const hasAttributionData = item.productData && item.productData.factors && Object.keys(item.productData.factors).length > 0;
        row.innerHTML = `
            <td>${item.label}</td>
            <td class="${getNumberClass(item.value)}">${formatNumber(item.value)}</td>
            <td>${item.percentage}%</td>
            <td>
                ${hasAttributionData ? `<button class="btn btn-small btn-primary" onclick='showFXProductAttribution("${item.label.replace(/"/g, '&quot;')}")'>查看归因贡献</button>` : '<span style="color: #999;">--</span>'}
            </td>
        `;
        fxElements.productTableBody.appendChild(row);
    });
}

// 更新货币对维度表格
function updateFXCurrencyPairTable(details) {
    if (!fxElements.currencyPairTableBody) return;
    
    fxElements.currencyPairTableBody.innerHTML = '';
    
    if (!details || details.length === 0) {
        fxElements.currencyPairTableBody.innerHTML = '<tr><td colspan="15" class="empty-state">暂无数据</td></tr>';
        return;
    }
    
    details.forEach(detail => {
        const row = createFXTableRow(detail, 'currency_pair');
        fxElements.currencyPairTableBody.appendChild(row);
    });
}

// 创建归因明细表格行（Tab1：包含总敞口）
function createFXAttributionTableRow(detail) {
    const row = document.createElement('tr');
    
    // 获取因子映射（处理factors可能是数组或对象的情况）
    const factorsMap = {};
    if (Array.isArray(detail.factors)) {
        detail.factors.forEach(factor => {
            factorsMap[factor.factor_code] = factor;
        });
    } else if (detail.factors && typeof detail.factors === 'object') {
        Object.values(detail.factors).forEach(factor => {
            if (factor && factor.factor_code) {
                factorsMap[factor.factor_code] = factor;
            }
        });
    }
    
    // 因子代码映射 - 调整为新的因子列表
    const factorCodes = ['delta', 'gamma', 'vega', 'theta', 'rho', 'phi', 'volga', 'vanna'];
    
    const dimensionValue = detail.dimension_value || '';
    const totalExposure = detail.total_exposure || 0;
    
    row.innerHTML = `
        <td>${dimensionValue}</td>
        <td class="${getNumberClass(totalExposure)}">${formatNumber(totalExposure)}</td>
        <td class="${getNumberClass(detail.valuation_pnl)}">${formatNumber(detail.valuation_pnl)}</td>
        ${factorCodes.map(code => {
            const factor = factorsMap[code];
            const value = factor ? factor.pnl_contribution : 0;
            return `<td class="${getNumberClass(value)}">${formatNumber(value)}</td>`;
        }).join('')}
        <td class="${getNumberClass(detail.unexplained)}">${formatNumber(detail.unexplained)}</td>
        <td>
            <div style="display: flex; gap: 6px; justify-content: center;">
                <button class="btn btn-small btn-secondary" onclick='fxDrilldown.showDrilldown("${dimensionValue.replace(/"/g, '&quot;')}", "portfolio")'>
                    查看明细
                </button>
                <button class="btn btn-small btn-primary" onclick='fxTrendChart.showTrendChart("${dimensionValue.replace(/"/g, '&quot;')}", "portfolio")'>
                    趋势图
                </button>
                <button class="btn btn-small btn-primary" onclick='fxContribution.showContribution("${dimensionValue.replace(/"/g, '&quot;')}", "portfolio")'>
                    贡献度
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// 创建敏感值表格行（Tab2：显示敏感值和总敞口、操作列）
function createFXSensitivityTableRow(detail) {
    const row = document.createElement('tr');
    
    // 获取因子映射（处理factors可能是数组或对象的情况）
    const factorsMap = {};
    if (Array.isArray(detail.factors)) {
        detail.factors.forEach(factor => {
            factorsMap[factor.factor_code] = factor;
        });
    } else if (detail.factors && typeof detail.factors === 'object') {
        Object.values(detail.factors).forEach(factor => {
            if (factor && factor.factor_code) {
                factorsMap[factor.factor_code] = factor;
            }
        });
    }
    
    // 因子代码映射 - 调整为新的因子列表
    const factorCodes = ['delta', 'gamma', 'vega', 'theta', 'rho', 'phi', 'volga', 'vanna'];
    
    const dimensionValue = detail.dimension_value || '';
    const totalExposure = detail.total_exposure || 0;
    
    row.innerHTML = `
        <td>${dimensionValue}</td>
        <td class="${getNumberClass(totalExposure)}">${formatNumber(totalExposure)}</td>
        ${factorCodes.map(code => {
            const factor = factorsMap[code];
            const value = factor ? factor.pnl_contribution : 0;
            return `<td class="${getNumberClass(value)}">${formatNumber(value)}</td>`;
        }).join('')}
        <td>
            <div style="display: flex; gap: 6px; justify-content: center;">
                <button class="btn btn-small btn-secondary" onclick='fxDrilldown.showDrilldown("${dimensionValue.replace(/"/g, '&quot;')}", "portfolio")'>
                    查看明细
                </button>
                <button class="btn btn-small btn-primary" onclick='fxTrendChart.showTrendChart("${dimensionValue.replace(/"/g, '&quot;')}", "portfolio")'>
                    趋势图
                </button>
                <button class="btn btn-small btn-primary" onclick='fxContribution.showContribution("${dimensionValue.replace(/"/g, '&quot;')}", "portfolio")'>
                    贡献度
                </button>
            </div>
        </td>
    `;
    
    // 保存详细数据到行元素，用于贡献度查看
    row._detailData = detail;
    
    return row;
}

// 创建表格行（通用函数）
function createFXTableRow(detail, dimensionType) {
    const row = document.createElement('tr');
    
    // 获取因子映射（处理factors可能是数组或对象的情况）
    const factorsMap = {};
    if (Array.isArray(detail.factors)) {
        detail.factors.forEach(factor => {
            factorsMap[factor.factor_code] = factor;
        });
    } else if (detail.factors && typeof detail.factors === 'object') {
        Object.values(detail.factors).forEach(factor => {
            if (factor && factor.factor_code) {
                factorsMap[factor.factor_code] = factor;
            }
        });
    }
    
    // 因子代码映射 - 调整为新的因子列表
    const factorCodes = ['delta', 'gamma', 'vega', 'theta', 'rho', 'phi', 'volga', 'vanna'];
    
    const dimensionValue = detail.dimension_value || '';
    
    row.innerHTML = `
        <td>${dimensionValue}</td>
        <td class="${getNumberClass(detail.valuation_pnl)}">${formatNumber(detail.valuation_pnl)}</td>
        ${factorCodes.map(code => {
            const factor = factorsMap[code];
            const value = factor ? factor.pnl_contribution : 0;
            return `<td class="${getNumberClass(value)}">${formatNumber(value)}</td>`;
        }).join('')}
        <td class="${getNumberClass(detail.unexplained)}">${formatNumber(detail.unexplained)}</td>
        <td>
            <div style="display: flex; gap: 6px; justify-content: center;">
                <button class="btn btn-small btn-secondary" onclick='fxDrilldown.showDrilldown("${dimensionValue.replace(/"/g, '&quot;')}", "${dimensionType}")'>
                    查看明细
                </button>
                <button class="btn btn-small btn-primary" onclick='fxTrendChart.showTrendChart("${dimensionValue.replace(/"/g, '&quot;')}", "${dimensionType}")'>
                    趋势图
                </button>
                <button class="btn btn-small btn-primary" onclick='fxContribution.showContribution("${dimensionValue.replace(/"/g, '&quot;')}", "${dimensionType}")'>
                    贡献度
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// 更新警告
function updateFXWarnings(warnings) {
    if (!fxElements.warningsSection || !fxElements.warningsList) return;
    
    if (warnings.length === 0) {
        fxElements.warningsSection.style.display = 'none';
        return;
    }
    
    fxElements.warningsSection.style.display = 'block';
    fxElements.warningsList.innerHTML = '';
    
    warnings.forEach(warning => {
        const li = document.createElement('li');
        li.textContent = `${warning.date || ''}: ${warning.suggested_action || warning.message || '数据警告'}`;
        fxElements.warningsList.appendChild(li);
    });
}

// 处理重置
function handleFXReset() {
    // 设置默认日期
    fxElements.startDate.value = '2025-11-01';
    fxElements.endDate.value = new Date().toISOString().split('T')[0];
    
    // 清空单选下拉框
    if (fxElements.portfolioSelect) {
        fxElements.portfolioSelect.value = '';
    }
    if (fxElements.productSelect) {
        fxElements.productSelect.value = '';
    }
    if (fxElements.currencyPairSelect) {
        fxElements.currencyPairSelect.value = '';
    }
    
    
    // 清空显示
    if (fxElements.valuationPnl) {
        fxElements.valuationPnl.textContent = '--';
        fxElements.valuationPnl.className = 'metric-value';
    }
    
    // 清空警告
    if (fxElements.warningsSection) {
        fxElements.warningsSection.style.display = 'none';
    }
    if (fxElements.warningsList) {
        fxElements.warningsList.innerHTML = '';
    }
    
    // 清空表格
    if (fxElements.portfolioTableBody) {
        fxElements.portfolioTableBody.innerHTML = '<tr><td colspan="15" class="empty-state">请点击查询按钮加载数据</td></tr>';
    }
    if (fxElements.productTableBody) {
        fxElements.productTableBody.innerHTML = '<tr><td colspan="15" class="empty-state">请点击查询按钮加载数据</td></tr>';
    }
    if (fxElements.currencyPairTableBody) {
        fxElements.currencyPairTableBody.innerHTML = '<tr><td colspan="15" class="empty-state">请点击查询按钮加载数据</td></tr>';
    }
    
    // 清空状态
    fxState.currentData = null;
    fxState.trendData = null;
    fxState.fxData = {
        portfolio: null,
        product: null,
        currencyPair: null
    };
    
    // 清空图表
    if (typeof clearFXCharts === 'function') {
        clearFXCharts();
    }
}

// 处理导出（已移除，导出按钮已移除）
// async function handleFXExport() { ... }

// 趋势图切换功能已移除，趋势图直接显示

// 显示错误
function showFXError(message) {
    alert(message);
}

// 格式化数字
function formatNumber(value) {
    if (value === null || value === undefined) return '--';
    return Number(value).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 获取数字样式类
function getNumberClass(value) {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (num > 0) return 'positive';
    if (num < 0) return 'negative';
    return 'neutral';
}

// 将fxState和fxElements暴露到全局
// 显示产品归因贡献
function showFXProductAttribution(productName) {
    const modal = document.getElementById('fxProductAttributionModal');
    if (!modal) {
        console.error('Product attribution modal not found');
        return;
    }
    
    // 显示产品名称
    const productNameElement = document.getElementById('fxProductAttributionProductName');
    if (productNameElement) {
        productNameElement.textContent = `产品：${productName}`;
    }
    
    // 从全局映射中获取产品数据
    const productData = productAttributionDataMap[productName];
    
    // 显示模态框
    modal.style.display = 'block';
    
    // 更新归因贡献表格
    const tbody = document.getElementById('fxProductAttributionBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!productData || !productData.factors || Object.keys(productData.factors).length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">暂无归因数据</td></tr>';
        bindProductAttributionModalEvents();
        return;
    }
    
    // 获取因子数据
    const factors = Object.values(productData.factors);
    const unexplained = productData.unexplained || 0;
    const totalValuationPnl = productData.valuation_pnl || 0;
    
    // 因子名称映射
    const factorNameMap = {
        'delta': 'Delta',
        'gamma': 'Gamma',
        'vega': 'Vega',
        'theta': 'Theta',
        'rho': 'Rho',
        'phi': 'Phi',
        'volga': 'Volga',
        'vanna': 'Vanna'
    };
    
    // 创建数据数组
    const attributionData = factors.map(factor => ({
        name: factorNameMap[factor.factor_code] || factor.factor_name || factor.factor_code,
        value: factor.pnl_contribution || 0
    }));
    
    // 添加无法解释部分
    if (unexplained !== 0) {
        attributionData.push({
            name: '无法解释部分',
            value: unexplained
        });
    }
    
    // 按绝对值排序
    attributionData.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    
    // 生成表格行
    attributionData.forEach(item => {
        const row = document.createElement('tr');
        const percentage = totalValuationPnl !== 0 ? ((item.value / totalValuationPnl) * 100).toFixed(2) : '0.00';
        row.innerHTML = `
            <td>${item.name}</td>
            <td class="text-right ${item.value > 0 ? 'positive' : item.value < 0 ? 'negative' : ''}">${formatNumber(item.value)}</td>
            <td class="text-right">${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
    
    // 绑定关闭事件
    bindProductAttributionModalEvents();
}

// 绑定产品归因贡献模态框事件
function bindProductAttributionModalEvents() {
    const modal = document.getElementById('fxProductAttributionModal');
    if (!modal) return;
    
    // 关闭按钮
    const closeBtn = document.getElementById('fxProductAttributionModalClose');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    
    // 点击外部关闭
    const originalOnClick = window.onclick;
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
        // 调用原始onclick（如果存在）
        if (originalOnClick && typeof originalOnClick === 'function') {
            originalOnClick(event);
        }
    };
}

window.fxState = fxState;
window.fxElements = fxElements;
window.showFXProductAttribution = showFXProductAttribution;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否在外汇界面
    const fxView = document.getElementById('fxPnlView');
    if (fxView) {
        // 延迟初始化，确保DOM已加载
        setTimeout(() => {
            initFXAttribution();
        }, 100);
    }
});

// 当切换到外汇界面时初始化
const originalHandleSidebarItemClick = window.handleSidebarItemClick;
if (originalHandleSidebarItemClick) {
    window.handleSidebarItemClick = function(event) {
        originalHandleSidebarItemClick(event);
        
        // 如果切换到外汇界面，初始化
        const clickedItem = event.currentTarget;
        if (clickedItem.id === 'fxPnlMenuItem') {
            setTimeout(() => {
                if (!fxState.portfolios || fxState.portfolios.length === 0) {
                    initFXAttribution();
                }
            }, 100);
        }
    };
}

