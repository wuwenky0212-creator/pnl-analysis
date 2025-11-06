/**
 * 外汇类损益归因分析导出功能模块
 */

const fxExport = {
    /**
     * 导出为CSV格式
     */
    exportToCSV(data, filename = 'fx_attribution_export.csv') {
        if (!data || !data.details) {
            alert('没有可导出的数据');
            return;
        }

        const details = data.details;
        
        // CSV头部
        const headers = [
            '维度',
            '估值损益',
            'Delta损益',
            'Vega损益',
            'Gamma损益',
            'Theta损益',
            'Rho损益',
            'Vanna损益',
            'Charm损益',
            'Veta损益',
            'Vomma损益',
            'Speed损益',
            'ThetaDecay损益',
            '无法解释部分'
        ];
        
        let csv = '\uFEFF'; // BOM for UTF-8
        csv += headers.join(',') + '\n';
        
        // 因子代码映射
        const factorCodes = ['delta', 'vega', 'gamma', 'theta', 'rho', 'vanna', 
                           'charm', 'veta', 'vomma', 'speed', 'theta_decay'];
        
        // 数据行
        details.forEach(detail => {
            // 获取因子映射
            const factorsMap = {};
            (detail.factors || []).forEach(factor => {
                factorsMap[factor.factor_code] = factor;
            });
            
            const row = [
                detail.dimension_value || '',
                detail.valuation_pnl || 0,
                ...factorCodes.map(code => {
                    const factor = factorsMap[code];
                    return factor ? factor.pnl_contribution : 0;
                }),
                detail.unexplained || 0
            ];
            
            csv += row.join(',') + '\n';
        });
        
        // 添加汇总行
        const totalRow = [
            '总计',
            data.total_valuation_pnl || 0,
            ...factorCodes.map(code => {
                let total = 0;
                details.forEach(detail => {
                    const factorsMap = {};
                    (detail.factors || []).forEach(factor => {
                        factorsMap[factor.factor_code] = factor;
                    });
                    const factor = factorsMap[code];
                    if (factor) {
                        total += factor.pnl_contribution;
                    }
                });
                return total;
            }),
            details.reduce((sum, d) => sum + (d.unexplained || 0), 0)
        ];
        csv += totalRow.join(',') + '\n';
        
        // 下载文件
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * 导出为Excel格式（通过API）
     */
    async exportToExcel(params) {
        try {
            await api.exportFXExcel(params);
        } catch (error) {
            console.error('Excel export failed:', error);
            // 如果API失败，降级为CSV导出
            alert('Excel导出失败，已改为CSV格式导出');
            // 这里可以调用exportToCSV作为备选方案
        }
    }
};

// 将fxExport暴露到全局
window.fxExport = fxExport;

