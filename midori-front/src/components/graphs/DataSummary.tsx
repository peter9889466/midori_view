import { useState } from "react";
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
    selectedYear}: DataSummaryProps) {
    const [] = useState(false);

    const currentProductInfo = Object.values(hsCodeMap).find(item => item.code === hsCode);
    const displayProductName = currentProductInfo?.statKorName || 
        Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || 
        (hsCode ? `HS코드 ${hsCode}` : "품목");
    
    const productDescription = productDescriptions[Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || ''] || 
        productDescriptions[hsCode || ''] || 
        `${displayProductName}의 무역 데이터를 분석하고 있습니다.`;

    const 기간표현 = `${selectedYear}년 1월~${dataLength}월 누적`;


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
                </div>
            </div>
        </div>
    );
}