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
}

export default function DataSummary({
    hsCode,
    apiExportTotal,
    apiImportTotal,
    totalTradeAmount,
    dataLength,
    selectedYear
}: DataSummaryProps) {
    const currentProductInfo = Object.values(hsCodeMap).find(item => item.code === hsCode);
    const displayProductName = currentProductInfo?.statKorName || 
        Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || 
        (hsCode ? `HS코드 ${hsCode}` : "품목");
    
    const productDescription = productDescriptions[Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || ''] || 
        productDescriptions[hsCode || ''] || 
        `${displayProductName}의 무역 데이터를 분석하고 있습니다.`;

    const 기간표현 = `${selectedYear}년 1월~${dataLength}월 누적`;

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
                        <SimplePDFButton onClick={() => alert("PDF 다운로드 기능이 준비 중입니다.")} />
                    </div>
                </div>
            </div>
        </div>
    );
} 