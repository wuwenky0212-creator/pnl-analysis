/**
 * 导出功能模块
 */

class ExportManager {
    /**
     * 导出为 CSV
     */
    exportToCSV(data, filename = 'pnl_export.csv') {
        const details = data.details || [];
        const headers = ['维度', '利息损益', '价差损益', '估值损益', '融资成本', '手续费', '总计', '占比'];
        
        let csv = '\uFEFF'; // BOM for Excel Chinese support
        csv += headers.join(',') + '\n';
        
        details.forEach(detail => {
            const row = [
                detail.dimension_value,
                detail.pnl_interest,
                detail.pnl_price_diff,
                detail.pnl_valuation,
                detail.pnl_financing,
                detail.pnl_fee,
                detail.total_pnl,
                detail.percentage.toFixed(2) + '%'
            ];
            csv += row.join(',') + '\n';
        });
        
        this.downloadFile(csv, filename, 'text/csv;charset=utf-8;');
    }
    
    /**
     * 导出为 JSON
     */
    exportToJSON(data, filename = 'pnl_export.json') {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    }
    
    /**
     * 下载文件
     */
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// 创建全局导出管理器实例
const exportManager = new ExportManager();






