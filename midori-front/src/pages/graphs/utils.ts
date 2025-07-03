import type { ApiTradeData } from "./types";

export const formatNumber = (num: number): string => num.toLocaleString();

export const generateChartData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
    const currentYearNum = parseInt(selectedYear);
    const now = new Date();
    const dataLength = currentYearNum === 2025 ? 6 : (currentYearNum === now.getFullYear() ? now.getMonth() + 1 : 12);

    const labels = [];
    for (let i = 1; i <= dataLength; i++) {
        labels.push(`${selectedYear}.${i < 10 ? '0' + i : i}`);
    }

    const exportData = new Array(dataLength).fill(0);
    const importData = new Array(dataLength).fill(0);

    apiTradeData.forEach(item => {
        const monthIndex = item.month - 1;
        if (monthIndex >= 0 && monthIndex < dataLength) {
            exportData[monthIndex] = item.exportValue;
            importData[monthIndex] = item.importValue;
        }
    });

    return { labels, exportData, importData };
};

export const generateBarData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
    const { labels, exportData, importData } = generateChartData(apiTradeData, selectedYear);
    
    return {
        labels,
        datasets: [
            {
                label: '수출액',
                data: exportData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: '수입액',
                data: importData,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };
};

export const generateLineData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
    const { labels, exportData, importData } = generateChartData(apiTradeData, selectedYear);
    
    return {
        labels,
        datasets: [
            {
                label: '수출액',
                data: exportData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                tension: 0.1,
            },
            {
                label: '수입액',
                data: importData,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: false,
                tension: 0.1,
            },
        ],
    };
};

export const generateMixedData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
    const { labels, exportData, importData } = generateChartData(apiTradeData, selectedYear);
    
    return {
        labels,
        datasets: [
            {
                type: 'bar' as const,
                label: '수출액 (막대)',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                data: exportData,
            },
            {
                type: 'line' as const,
                label: '수입액 (선)',
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: false,
                tension: 0.1,
                data: importData,
            },
        ],
    };
}; 