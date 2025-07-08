import type { ApiTradeData } from "../../types/types";

export const formatNumber = (num: number): string => num.toLocaleString();

// 🐛 수정: calculateGrowthRate 함수를 export 하여 외부에서 사용 가능하도록 함
export const calculateGrowthRate = (currentValue: number, prevValue: number): number => {
    if (!prevValue || prevValue === 0) {
        return currentValue === 0 ? 0 : Infinity;
    }
    return ((currentValue - prevValue) / prevValue) * 100;
};

export const generateChartData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
    const currentYearNum = parseInt(selectedYear);
    const now = new Date();
    // 2025년 6월까지의 데이터만 있다고 가정 (예시)
    const dataLength = currentYearNum === 2025 ? 5 : (currentYearNum === now.getFullYear() ? now.getMonth() + 1 : 12);

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

    // 🐛 calculateGrowthRate 함수를 export 했으므로 여기서는 더 이상 내부 정의가 필요 없음
    // const calculateGrowthRate = (currentValue: number, prevValue: number): number => {
    //     if (!prevValue || prevValue === 0) {
    //         return currentValue === 0 ? 0 : Infinity;
    //     }
    //     return ((currentValue - prevValue) / prevValue) * 100;
    // };

    // 🐛 수정: 전년동월대비 수입 증감률을 올바르게 계산
    const importGrowthRateData = apiTradeData.map((item, idx) => {
        const prev = prevYearData.find(prevItem => prevItem.month === item.month); // 월을 기준으로 정확히 찾기
        const prevImportValue = prev ? prev.importValue : 0;
        return calculateGrowthRate(item.importValue, prevImportValue);
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
                data: importGrowthRateData.map(rate => (rate === Infinity ? NaN : parseFloat(rate.toFixed(1)))), // Infinity 처리 및 소수점 첫째 자리까지 반올림
                yAxisID: 'y1',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(255, 159, 64, 1)',
            },
        ],
    };
};
