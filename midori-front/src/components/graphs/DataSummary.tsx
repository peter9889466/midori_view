import { useState } from "react";
import SimplePDFButton from "../PDFbutton";
import { formatNumber } from "../../lib/graphs/utils";
import { productDescriptions, hsCodeMap } from "../../data/constants";

interface DataSummaryProps {
    hsCode: string;
    apiExportTotal: number;
    apiImportTotal: number;
    totalTradeAmount: number;
    dataLength: number;
    selectedYear: string;
    selectedCountry?: string;
    apiTradeData?: any[];
}

export default function DataSummary({
    hsCode,
    apiExportTotal,
    apiImportTotal,
    totalTradeAmount,
    dataLength,
    selectedYear,
    selectedCountry = "미국",
    apiTradeData = []
}: DataSummaryProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const currentProductInfo = Object.values(hsCodeMap).find(item => item.code === hsCode);
    const displayProductName = currentProductInfo?.statKorName || 
        Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || 
        (hsCode ? `HS코드 ${hsCode}` : "품목");
    
    const productDescription = productDescriptions[Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || ''] || 
        productDescriptions[hsCode || ''] || 
        `${displayProductName}의 무역 데이터를 분석하고 있습니다.`;

    const 기간표현 = `${selectedYear}년 1월~${dataLength}월 누적`;
    const tradeBalance = apiExportTotal - apiImportTotal;

    const handlePDFDownload = () => {
        if (!apiTradeData || apiTradeData.length === 0) {
            alert('데이터가 없습니다.');
            return;
        }
        
        setIsGeneratingPDF(true);
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('팝업이 차단되었습니다.');
            setIsGeneratingPDF(false);
            return;
        }
        
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
                        <div style="font-size: 13px;"><strong>대상 국가:</strong> ${selectedCountry} | <strong>분석 기간:</strong> ${기간표현} | <strong>HS 코드:</strong> ${hsCode} | <strong>생성일:</strong> ${new Date().toLocaleDateString('ko-KR')}</div>
                    </div>
                </div>

                <div class="section-title">📊 요약 통계</div>
                <div class="summary">
                    <div class="summary-item export">
                        <h3>총 수출액</h3>
                        <p>$${formatNumber(apiExportTotal)}</p>
                    </div>
                    <div class="summary-item import">
                        <h3>총 수입액</h3>
                        <p>$${formatNumber(apiImportTotal)}</p>
                    </div>
                    <div class="summary-item balance">
                        <h3>무역수지</h3>
                        <p>$${formatNumber(Math.abs(tradeBalance))}<br><span style="font-size: 12px;">(${tradeBalance >= 0 ? '흑자' : '적자'})</span></p>
                    </div>
                    <div class="summary-item total">
                        <h3>총 수출입액</h3>
                        <p>$${formatNumber(totalTradeAmount)}</p>
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
                            <th>증감률 (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${apiTradeData.slice(0, dataLength).map((item, index) => {
                            const exportValue = item.exportValue || 0;
                            const importValue = item.importValue || 0;
                            const monthBalance = exportValue - importValue;
                            const growthRate = item.growthRate || 0;
                            
                            return `
                                <tr>
                                    <td>${item.month || (index + 1)}월</td>
                                    <td style="color: #1565c0; font-weight: bold;">${formatNumber(exportValue)}</td>
                                    <td style="color: #ef6c00; font-weight: bold;">${formatNumber(importValue)}</td>
                                    <td style="color: ${monthBalance >= 0 ? '#2e7d32' : '#c62828'}; font-weight: bold;">${formatNumber(monthBalance)}</td>
                                    <td>${growthRate.toFixed(1)}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #666;">
                    <p>※ 본 보고서는 무역통계 시스템을 통해 생성되었습니다.</p>
                    <p>※ 모든 금액은 미화(USD) 기준입니다.</p>
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

    return (
        <div className="w-full lg:w-1/4 min-w-0 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-auto lg:h-[400px] flex flex-col hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col space-y-3">
                    {/* 헤더 섹션 */}
                    <div className="pb-3 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">{displayProductName}</h3>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#9AD970]/10 text-[#9AD970] text-xs font-medium">
                            총 수출입
                        </div>
                    </div>

                    {/* 메인 수치 */}
                    <div className="text-center py-1">
                        <div className="text-3xl font-bold text-gray-900 mb-1 break-all">
                            ${formatNumber(totalTradeAmount)}
                        </div>
                    </div>

                    {/* 상세 수치 */}
                    <div className="grid grid-cols-1 gap-2 py-1">
                        <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">수출</span>
                            <span className="text-xs font-semibold text-[#9AD970] truncate ml-2">${formatNumber(apiExportTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">수입</span>
                            <span className="text-xs font-semibold text-blue-600 truncate ml-2">${formatNumber(apiImportTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-lg">
                            <span className="text-xs font-medium text-gray-600">평균</span>
                            <span className="text-xs font-semibold text-gray-700 truncate ml-2">${formatNumber(totalTradeAmount / (dataLength || 1))}</span>
                        </div>
                    </div>

                    {/* 기간 정보 */}
                    <div className="text-center py-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-full inline-block">
                            그래프 기간: {기간표현}
                        </span>
                    </div>

                    {/* 제품 설명 */}
                    <div className="flex-1 pt-1 min-h-0">
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 overflow-hidden">
                            {productDescription}
                        </p>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="w-full">
                            <SimplePDFButton
                                onClick={handlePDFDownload}
                            />
                        </div>
                        {isGeneratingPDF && (
                            <div className="text-xs text-[#9AD970] mt-2 flex items-center justify-center gap-2">
                                <div className="w-3 h-3 border-2 border-[#9AD970] border-t-transparent rounded-full animate-spin"></div>
                                PDF 생성 중...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}