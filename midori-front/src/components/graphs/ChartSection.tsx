import MixedChart from '../../chart/MixedChart';
import BarChart from '../../chart/BarChart';
import LineChart from '../../chart/LineChart';
import { chartOptions, mixedChartOptions } from "../../data/constants";
import { generateBarData, generateLineData, generateMixedData } from "../../lib/graphs/utils";
import type { ApiTradeData } from "../../types/types";
import ChartControls from "./ChartControls";
import DataSummary from "./DataSummary";
import SimplePDFButton from '../PDFbutton';
import { useState } from 'react';
import { productDescriptions, hsCodeMap } from '../../data/constants';
import { formatNumber, calculateGrowthRate } from '../../lib/graphs/utils'; // calculateGrowthRate import

interface ChartSectionProps {
    selectedChart: string;
    setSelectedChart: (chart: string) => void;
    selectedCountry: string;
    setSelectedCountry: (country: string) => void;
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    years: string[];
    apiTradeData: ApiTradeData[];
    prevYearData: ApiTradeData[];
    hsCode: string;
}

export default function ChartSection({
    selectedChart,
    setSelectedChart,
    selectedCountry,
    setSelectedCountry,
    selectedYear,
    setSelectedYear,
    years,
    apiTradeData,
    prevYearData,
    hsCode
}: ChartSectionProps) {
    const apiExportTotal = apiTradeData.reduce((sum, item) => sum + item.exportValue, 0);
    const apiImportTotal = apiTradeData.reduce((sum, item) => sum + item.importValue, 0);
    const totalTradeAmount = apiExportTotal + apiImportTotal;

    const currentYearNum = parseInt(selectedYear);
    const now = new Date();
    const isCurrentYear = currentYearNum === now.getFullYear();
    const dataLength = isCurrentYear ? apiTradeData.length : 12;

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const initiatePDFPrint = (
        data: ApiTradeData[],
        prevData: ApiTradeData[],
        exportTotal: number,
        importTotal: number,
        tradeAmount: number,
        len: number,
        year: string,
        country: string,
        code: string
    ) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
            setIsGeneratingPDF(false);
            return;
        }

        const currentProductInfo = Object.values(hsCodeMap).find(item => item.code === code);
        const displayProductName = currentProductInfo?.statKorName ||
            Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === code) ||
            (code ? `HS코드 ${code}` : "품목");
        const productDescription = productDescriptions[Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === code) || ''] ||
            productDescriptions[code || ''] ||
            `${displayProductName}의 무역 데이터를 분석하고 있습니다.`;
        const 기간표현 = `${year}년 1월~${len}월 누적`;
        const tradeBalance = exportTotal - importTotal;

        const prevYearExportTotal = prevData.slice(0, len).reduce((sum, item) => sum + item.exportValue, 0);
        const prevYearImportTotal = prevData.slice(0, len).reduce((sum, item) => sum + item.importValue, 0);
        const prevYearTotalAmount = prevYearExportTotal + prevYearImportTotal;

        const overallGrowthRate = calculateGrowthRate(tradeAmount, prevYearTotalAmount);

        const printHTML = `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>${displayProductName} 무역통계 보고서</title>
                <style>
                    body { font-family: 'Malgun Gothic', Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6AAE4A; padding-bottom: 15px; }
                    .header h1 { color: #6AAE4A; font-size: 24px; margin: 0 0 15px 0; }
                    .summary { display: flex; gap: 15px; margin: 30px 0; }
                    .summary-item { flex: 1; padding: 15px; border: 2px solid #ddd; text-align: center; border-radius: 8px; }
                    .export { background-color: #e3f2fd; border-color: #1565c0; }
                    .import { background-color: #fff3e0; border-color: #ef6c00; }
                    .balance { background-color: ${tradeBalance >= 0 ? '#e8f5e8' : '#ffebee'}; border-color: ${tradeBalance >= 0 ? '#2e7d32' : '#c62828'}; }
                    .total { background-color: #f5f5f5; border-color: #666; }
                    .summary-item h3 { margin: 0 0 10px 0; font-size: 14px; }
                    .summary-item p { margin: 0; font-size: 18px; font-weight: bold; }
                    .export h3, .export p { color: #1565c0; }
                    .import h3, .import p { color: #ef6c00; }
                    .balance h3, .balance p { color: ${tradeBalance >= 0 ? '#2e7d32' : '#c62828'}; }
                    .growth-rate { font-size: 12px; margin-top: 5px; }
                    .growth-positive { color: #2e7d32; }
                    .growth-negative { color: #c62828; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; border-left: 4px solid #6AAE4A; padding-left: 10px; }
                    @media print { body { margin: 0; padding: 15mm; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${displayProductName} 무역통계 보고서</h1>
                    <div class="header-info">
                        <div style="font-size: 13px;"><strong>대상 국가:</strong> ${country} | <strong>분석 기간:</strong> ${기간표현} | <strong>HS 코드:</strong> ${code} | <strong>생성일:</strong> ${new Date().toLocaleDateString('ko-KR')}</div>
                    </div>
                </div>

                <div class="section-title">📊 요약 통계</div>
                <div class="summary">
                    <div class="summary-item export">
                        <h3>총 수출액</h3>
                        <p>$${formatNumber(exportTotal)}</p>
                        <div class="growth-rate ${calculateGrowthRate(exportTotal, prevYearExportTotal) >= 0 ? 'growth-positive' : 'growth-negative'}">
                            전년 대비: ${calculateGrowthRate(exportTotal, prevYearExportTotal).toFixed(1)}%
                        </div>
                    </div>
                    <div class="summary-item import">
                        <h3>총 수입액</h3>
                        <p>$${formatNumber(importTotal)}</p>
                        <div class="growth-rate ${calculateGrowthRate(importTotal, prevYearImportTotal) >= 0 ? 'growth-positive' : 'growth-negative'}">
                            전년 대비: ${calculateGrowthRate(importTotal, prevYearImportTotal).toFixed(1)}%
                        </div>
                    </div>
                    <div class="summary-item balance">
                        <h3>무역수지</h3>
                        <p>$${formatNumber(Math.abs(tradeBalance))}<br><span style="font-size: 12px;">(${tradeBalance >= 0 ? '흑자' : '적자'})</span></p>
                    </div>
                    <div class="summary-item total">
                        <h3>총 수출입액</h3>
                        <p>$${formatNumber(tradeAmount)}</p>
                        <div class="growth-rate ${overallGrowthRate >= 0 ? 'growth-positive' : 'growth-negative'}">
                            전년 대비: ${overallGrowthRate.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div class="section-title">📋 월별 상세 데이터</div>
                <table>
                    <thead>
                        <tr>
                            <th>월</th>
                            <th>수출액 ($)</th>
                            <th>수입액 ($)</th>
                            <th>무역수지 ($)</th>
                            <th style="background-color: #e0f2f7;">증감률 (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.slice(0, len).map((item, index) => {
            const exportValue = item.exportValue || 0;
            const importValue = item.importValue || 0;
            const monthBalance = exportValue - importValue;

            const prevYearItemForMonth = prevData.find(prev => prev.month === item.month) || { exportValue: 0, importValue: 0 };

            const importGrowthRate = calculateGrowthRate(importValue, prevYearItemForMonth.importValue);

            return `
                                <tr>
                                    <td>${item.month || (index + 1)}월</td>
                                    <td style="color: #1565c0; font-weight: bold;">${formatNumber(exportValue)}</td>
                                    <td style="color: #ef6c00; font-weight: bold;">${formatNumber(importValue)}</td>
                                    <td style="color: ${monthBalance >= 0 ? '#2e7d32' : '#c62828'}; font-weight: bold;">${formatNumber(monthBalance)}</td>
                                    <td style="color: ${importGrowthRate >= 0 ? '#2e7d32' : '#c62828'}; font-weight: bold; background-color: #f0f8ff;">
                                        ${importGrowthRate === Infinity ? 'N/A' : importGrowthRate.toFixed(1) + '%'}
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
                    <p>※ 본 보고서는 무역통계 시스템을 통해 생성되었습니다.</p>
                    <p>※ 모든 금액은 미화(USD) 기준입니다.</p>
                    <p>※ 증감률은 전년 동기 대비 기준입니다.</p>
                    <p>※ ${productDescription}</p>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(() => window.print(), 1000);
                    };
                    window.onafterprint = function() {
                        window.close();
                    };
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(printHTML);
        printWindow.document.close();
        setIsGeneratingPDF(false);
    };

    // 🐛 수정: handlePDFDownload 함수 간소화 (디버그 모달 로직 제거)
    const handlePDFDownload = () => {
        if (!apiTradeData || apiTradeData.length === 0) {
            alert('데이터가 없습니다.');
            return;
        }
        setIsGeneratingPDF(true); // 로딩 상태 시작
        initiatePDFPrint(
            apiTradeData,
            prevYearData,
            apiExportTotal,
            apiImportTotal,
            totalTradeAmount,
            dataLength,
            selectedYear,
            selectedCountry,
            hsCode
        );
    };

    const productOptions = Object.keys(hsCodeMap).map(label => ({ label, value: hsCodeMap[label].code }));
    const currentProductLabel = Object.keys(hsCodeMap).find(label => hsCodeMap[label].code === hsCode) || '';
    const [selectedProduct, setSelectedProduct] = useState(currentProductLabel);

    return (
        <div className="rounded-2xl bg-white w-full p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div>
                <div className="text-base font-semibold mb-4">그래프</div>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <ChartControls
                        selectedChart={selectedChart}
                        setSelectedChart={setSelectedChart}
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
                        productOptions={productOptions}
                        selectedCountry={selectedCountry}
                        setSelectedCountry={setSelectedCountry}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        years={years}
                    />
                    <SimplePDFButton onClick={handlePDFDownload} className="my-auto" />
                    {isGeneratingPDF && (
                        <div className="text-xs text-[#9AD970] ml-2 flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-[#9AD970] border-t-transparent rounded-full animate-spin"></div>
                            PDF 생성 중...
                        </div>
                    )}
                </div>
                <div className="flex flex-col lg:flex-row items-start gap-6">
                    <DataSummary
                        hsCode={hsCode}
                        apiExportTotal={apiExportTotal}
                        apiImportTotal={apiImportTotal}
                        totalTradeAmount={totalTradeAmount}
                        dataLength={dataLength}
                        selectedYear={selectedYear}
                        selectedCountry={selectedCountry}
                        apiTradeData={apiTradeData}
                    />

                    <div className="w-full lg:w-3/4 min-w-0 flex-1">
                        <div className="relative w-full h-[400px] rounded-xl ">
                            {selectedChart === "bar" && (
                                <BarChart
                                    className="absolute inset-0 w-full h-full bg-[#e9ecef]  rounded-xl"
                                    data={generateBarData(apiTradeData, selectedYear)}
                                    options={chartOptions}
                                />
                            )}
                            {selectedChart === "line" && (<LineChart
                                className="absolute inset-0 w-full h-full bg-[#e9ecef]  rounded-xl"
                                data={generateLineData(apiTradeData, selectedYear)}
                                options={chartOptions}
                            />
                            )}
                            {selectedChart === "combined" && (
                                <MixedChart
                                    className="absolute inset-0 w-full h-full bg-[#e9ecef]  rounded-xl"
                                    data={generateMixedData(apiTradeData, selectedYear, prevYearData)}
                                    options={mixedChartOptions}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
