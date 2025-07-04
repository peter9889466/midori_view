import type { ApiTradeData } from "../../types/types";

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
                label: '수출',
                data: exportData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: '수입',
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
                label: '수출',
                data: exportData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                tension: 0.1,
            },
            {
                label: '수입',
                data: importData,
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: false,
                tension: 0.1,
            },
        ],
    };
};

export const generateMixedData = (
    apiTradeData: ApiTradeData[],
    selectedYear: string,
    prevYearData: ApiTradeData[]
) => {
    const { labels, exportData, importData } = generateChartData(apiTradeData, selectedYear);

    // 실제 전년대비동월증감률 계산
    const growthRateData = apiTradeData.map((item, idx) => {
        const prev = prevYearData[idx];
        if (!prev || !prev.exportValue) return 0;
        return Math.round(((item.exportValue - prev.exportValue) / prev.exportValue) * 1000) / 10;
    });

    return {
        labels,
        datasets: [
            {
                type: 'bar' as const,
                label: '수출',
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                data: exportData,
                yAxisID: 'y',
            },
            {
                type: 'bar' as const,
                label: '수입',
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                data: importData,
                yAxisID: 'y',
            },
            {
                type: 'line' as const,
                label: '전년동월대비 수입 증감률 (%)',
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: false,
                tension: 0.1,
                data: growthRateData,
                yAxisID: 'y1',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(255, 159, 64, 1)',
            },
        ],
    };
}; 