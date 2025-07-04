import { useRef, useState } from "react";
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
    chartRef?: React.RefObject<HTMLDivElement>;
    selectedChart?: string;
}

export default function DataSummary({
    hsCode,
    apiExportTotal,
    apiImportTotal,
    totalTradeAmount,
    dataLength,
    selectedYear,
    selectedCountry = "미국",
    apiTradeData = [],
    chartRef,
    selectedChart = "bar"
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

    const testChartCapture = async () => {
        console.log('=== 차트 캡처 테스트 시작 ===');
        
        if (!chartRef?.current) {
            const errorMsg = 'chartRef가 없습니다';
            console.log('❌', errorMsg, chartRef);
            alert(errorMsg);
            return;
        }

        const chartElement = chartRef.current;
        console.log('✅ chartRef 확인됨:', chartElement);

        try {
            // html2canvas 로드 확인
            if (!window.html2canvas) {
                console.log('html2canvas 로딩 중...');
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
                console.log('✅ html2canvas 로딩 완료');
            }

            // oklch 색상 문제 해결을 위한 임시 스타일 적용
            console.log('oklch 색상 문제 해결 중...');
            const tempStyle = document.createElement('style');
            tempStyle.id = 'temp-capture-style';
            tempStyle.textContent = `
                /* oklch 색상을 RGB로 강제 변환 */
                * {
                    color: rgb(51, 51, 51) !important;
                    background-color: rgb(255, 255, 255) !important;
                    border-color: rgb(229, 229, 229) !important;
                }
                
                /* 차트 관련 색상 재정의 */
                .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
                .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
                .text-gray-500 { color: rgb(107, 114, 128) !important; }
                
                /* 차트 데이터 색상 */
                [fill], [stroke] {
                    fill: rgb(59, 130, 246) !important;
                    stroke: rgb(59, 130, 246) !important;
                }
            `;
            document.head.appendChild(tempStyle);

            // 스타일 적용 대기
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log('차트 캡처 시작...');
            const canvas = await window.html2canvas(chartElement, {
                scale: 1.5, // 스케일 조정
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                foreignObjectRendering: false,
                width: 800, // 고정 너비
                height: 400, // 고정 높이
                ignoreElements: (element) => {
                    return element.tagName === 'STYLE' && element.id !== 'temp-capture-style';
                }
            });

            // 임시 스타일 제거
            document.head.removeChild(tempStyle);

            console.log('✅ 캡처 완료, canvas 크기:', canvas.width, 'x', canvas.height);

            const dataUrl = canvas.toDataURL('image/png');
            console.log('✅ 이미지 변환 완료, 크기:', dataUrl.length, 'bytes');
            
            // 캡처된 이미지를 새 탭에서 보여주기
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head><title>차트 캡처 테스트</title></head>
                        <body style="margin: 20px;">
                            <h2>차트 캡처 결과</h2>
                            <img src="${dataUrl}" style="max-width: 100%; border: 1px solid #ccc;" />
                            <p>크기: ${canvas.width} x ${canvas.height}</p>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            }
            
            alert('✅ 차트 캡처 성공! 새 탭에서 확인하세요.');
            
        } catch (error) {
            console.error('❌ 차트 캡처 실패 상세:', error);
            alert(`차트 캡처 실패:\n${error.name}: ${error.message}`);
        }
        
        console.log('=== 차트 캡처 테스트 종료 ===');
    };

    // 차트 타입명 변환 함수
    const getChartTypeName = (chartType: string) => {
        switch (chartType) {
            case 'bar': return '막대 차트';
            case 'line': return '선형 차트';
            case 'combined': return '복합 차트';
            default: return '차트';
        }
    };

    const handlePDFDownload = async () => {
        if (!apiTradeData || apiTradeData.length === 0) {
            alert('데이터가 없습니다.');
            return;
        }
        
        setIsGeneratingPDF(true);
        
        try {
            let chartImageData = '';
            
            // 차트 이미지 캡처
            if (chartRef?.current) {
                try {
                    // html2canvas 라이브러리 로드
                    if (!window.html2canvas) {
                        const html2canvasScript = document.createElement('script');
                        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                        await new Promise((resolve, reject) => {
                            html2canvasScript.onload = resolve;
                            html2canvasScript.onerror = reject;
                            document.head.appendChild(html2canvasScript);
                        });
                    }

                    await new Promise(resolve => setTimeout(resolve, 500));

                    const chartCanvas = await window.html2canvas(chartRef.current, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        logging: false,
                        foreignObjectRendering: true
                    });

                    chartImageData = chartCanvas.toDataURL('image/png');
                } catch (chartError) {
                    console.warn('차트 캡처 실패:', chartError);
                    // 차트 캡처 실패해도 계속 진행
                }
            }

            // 브라우저 인쇄 기능 사용
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('팝업이 차단되었습니다. 팝업을 허용해주세요.');
                return;
            }
            
            const printHTML = `
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${displayProductName} 무역통계 보고서</title>
                    <style>
                        body { 
                            font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6;
                            color: #333;
                        }
                        .header { 
                            margin-bottom: 30px; 
                            border-bottom: 2px solid #6AAE4A; 
                            padding-bottom: 15px;
                            text-align: center;
                        }
                        .header h1 {
                            color: #6AAE4A;
                            font-size: 24px;
                            margin: 0 0 15px 0;
                        }
                        .header-info {
                            font-size: 14px;
                            color: #666;
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                            margin-top: 10px;
                        }
                        .summary { 
                            display: flex; 
                            gap: 20px; 
                            margin: 30px 0; 
                        }
                        .summary-item { 
                            flex: 1; 
                            padding: 20px; 
                            border: 2px solid #ddd; 
                            text-align: center;
                            border-radius: 8px;
                        }
                        .export { 
                            background-color: #e3f2fd; 
                            border-color: #1565c0;
                        }
                        .import { 
                            background-color: #fff3e0; 
                            border-color: #ef6c00;
                        }
                        .balance { 
                            background-color: ${tradeBalance >= 0 ? '#e8f5e8' : '#ffebee'};
                            border-color: ${tradeBalance >= 0 ? '#2e7d32' : '#c62828'};
                        }
                        .total {
                            background-color: #f5f5f5;
                            border-color: #666;
                        }
                        .summary-item h3 {
                            margin: 0 0 10px 0;
                            font-size: 16px;
                        }
                        .summary-item p {
                            margin: 0;
                            font-size: 20px;
                            font-weight: bold;
                        }
                        .export h3, .export p { color: #1565c0; }
                        .import h3, .import p { color: #ef6c00; }
                        .balance h3, .balance p { color: ${tradeBalance >= 0 ? '#2e7d32' : '#c62828'}; }
                        .total h3, .total p { color: #666; }
                        
                        .section-title {
                            font-size: 18px;
                            font-weight: bold;
                            margin: 30px 0 15px 0;
                            color: #333;
                            border-left: 4px solid #6AAE4A;
                            padding-left: 10px;
                        }
                        
                        .chart-container {
                            text-align: center;
                            margin: 20px 0;
                            page-break-inside: avoid;
                        }
                        
                        .chart-image {
                            max-width: 100%;
                            height: auto;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0; 
                            font-size: 12px;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: left; 
                        }
                        th { 
                            background-color: #f5f5f5; 
                            font-weight: bold; 
                            color: #333;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        
                        .description {
                            background-color: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                            font-size: 13px;
                            color: #555;
                        }
                        
                        .footer {
                            margin-top: 40px;
                            padding-top: 15px;
                            border-top: 1px solid #ddd;
                            font-size: 11px;
                            color: #666;
                        }
                        
                        @media print {
                            body { margin: 0; padding: 15mm; }
                            .no-print { display: none; }
                            .chart-container { page-break-inside: avoid; }
                        }
                        @page {
                            margin: 15mm;
                            size: A4;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${displayProductName} 무역통계 보고서</h1>
                        <div class="header-info">
                            <div><strong>대상 국가:</strong> ${selectedCountry}</div>
                            <div><strong>분석 기간:</strong> ${기간표현}</div>
                            <div><strong>HS 코드:</strong> ${hsCode}</div>
                            <div><strong>생성일:</strong> ${new Date().toLocaleDateString('ko-KR')}</div>
                        </div>
                    </div>

                    <div class="section-title">📊 요약 통계</div>
                    <div class="summary">
                        <div class="summary-item export">
                            <h3>총 수출액</h3>
                            <p>${formatNumber(apiExportTotal)}</p>
                        </div>
                        <div class="summary-item import">
                            <h3>총 수입액</h3>
                            <p>${formatNumber(apiImportTotal)}</p>
                        </div>
                        <div class="summary-item balance">
                            <h3>무역수지</h3>
                            <p>${formatNumber(Math.abs(tradeBalance))}<br>
                            <span style="font-size: 14px;">(${tradeBalance >= 0 ? '흑자' : '적자'})</span></p>
                        </div>
                        <div class="summary-item total">
                            <h3>총 수출입액</h3>
                            <p>${formatNumber(totalTradeAmount)}</p>
                        </div>
                    </div>
                    
                    <div class="description">
                        <strong>📝 제품 설명:</strong> ${productDescription}
                    </div>

                    ${chartImageData ? `
                        <div class="section-title">📈 ${getChartTypeName(selectedChart)}</div>
                        <div class="chart-container">
                            <img src="${chartImageData}" alt="무역통계 차트" class="chart-image" />
                        </div>
                    ` : ''}

                    <div class="section-title">📋 월별 상세 데이터</div>
                    <table>
                        <thead>
                            <tr>
                                <th class="text-center">월</th>
                                <th class="text-right">수출액 ($)</th>
                                <th class="text-right">수입액 ($)</th>
                                <th class="text-right">무역수지 ($)</th>
                                <th class="text-center">증감률 (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${apiTradeData.map((item, index) => {
                                const exportValue = item.exportValue || 0;
                                const importValue = item.importValue || 0;
                                const monthBalance = exportValue - importValue;
                                const growthRate = item.growthRate || 0;
                                
                                return `
                                    <tr>
                                        <td class="text-center">${item.month || (index + 1)}월</td>
                                        <td class="text-right" style="color: #1565c0; font-weight: bold;">${formatNumber(exportValue)}</td>
                                        <td class="text-right" style="color: #ef6c00; font-weight: bold;">${formatNumber(importValue)}</td>
                                        <td class="text-right" style="color: ${monthBalance >= 0 ? '#2e7d32' : '#c62828'}; font-weight: bold;">${formatNumber(monthBalance)}</td>
                                        <td class="text-center">${growthRate.toFixed(1)}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>※ 본 보고서는 무역통계 시스템을 통해 생성되었습니다.</p>
                        <p>※ 모든 금액은 미화(USD) 기준입니다.</p>
                        <p>※ 데이터 출처: 한국무역통계 API</p>
                        <p>※ 생성 시간: ${new Date().toLocaleString('ko-KR')}</p>
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 1000);
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
            printWindow.focus();
            
        } catch (error) {
            console.error('PDF 생성 실패:', error);
            alert(`PDF 생성에 실패했습니다: ${error.message}`);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="w-1/4 min-w-0 flex-shrink-0">
            <div className="bg-white rounded-lg p-4 border border-gray-200 h-[400px] flex flex-col">
                <div className="flex flex-col space-y-2">
                    <span className="text-lg font-bold text-[#6AAE4A]">{displayProductName}</span>
                    <span className="text-sm font-bold">총 수출입액</span>
                    <span className="text-4xl font-bold">${formatNumber(totalTradeAmount)}</span>
                    <div className="text-sm space-y-1">
                        <div>수출액 ${formatNumber(apiExportTotal)}</div>
                        <div>수입액 ${formatNumber(apiImportTotal)}</div>
                        <div>평균액 ${formatNumber(totalTradeAmount / (dataLength || 1))}</div>
                        <div>그래프 기간: {기간표현}</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 flex-1">
                        {productDescription}
                    </div>
                    <div className="mt-auto">
                        <SimplePDFButton 
                            onClick={handlePDFDownload}
                        />
                        {/* 차트 캡처 테스트 버튼 - 임시 */}
                        <button 
                            onClick={testChartCapture}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded text-xs"
                        >
                            차트 테스트
                        </button>
                        {isGeneratingPDF && (
                            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                PDF 생성 중...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}