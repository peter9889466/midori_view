"use client";

import { useState, useEffect } from "react";
import { hsDescriptions } from "../../data/TradeData";
import axios from 'axios';
import CountryMap from "../../components/map/CountryMap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { BarChart3, LineChart as LineChartIcon, Layers, Map } from "lucide-react";
import { useParams } from "react-router-dom";
import MixedChart from '../../chart/MixedChart';
import BarChart from '../../chart/BarChart';
import LineChart from '../../chart/LineChart';
import SimplePDFButton from '../../components/PDFbutton';

// --- Types and Constants ---
interface ApiTradeData {
    month: number;
    exportValue: number;
    importValue: number;
    growthRate?: number;
    year: number;
    country: string;
    product: string;
}

const chartTypes = [
    { id: "bar", icon: BarChart3, label: "Bar" },
    { id: "line", icon: LineChartIcon, label: "Line" },
    { id: "combined", icon: Layers, label: "Combined" },
];

const DEFAULT_COUNTRIES = ['미국', '중국', '일본', '베트남', '영국', '독일', '프랑스', '인도', '대만', '태국', '호주'];

const countryCodeMap: { [key: string]: string } = {
    '미국': 'US', '중국': 'CN', '일본': 'JP', '독일': 'DE', '프랑스': 'FR',
    '영국': 'GB', '인도': 'IN', '베트남': 'VN', '태국': 'TH', '호주': 'AU', '대만': 'TW'
};

const hsCodeMap: { [key: string]: { code: string; statKorName?: string } } = {
    '천연 비료': { code: '310100', statKorName: undefined },
    '천연 성분 세제': { code: '340290', statKorName: undefined },
    '실리콘 식기/빨대': { code: '392490', statKorName: undefined },
    '천연 고무 라텍스': { code: '400110', statKorName: undefined },
    '종이 빨대, 포장재': { code: '482390', statKorName: undefined },
    '유기농 면화': { code: '520100', statKorName: undefined },
    '슬래그 울, 단열재': { code: '680610', statKorName: undefined },
    '금속 빨대': { code: '821599', statKorName: undefined },
    '태양열 집열기': { code: '841919', statKorName: undefined },
    '풍력 터빈용 발전기': { code: '850231', statKorName: undefined },
    '전력 변환장치 (인버터)': { code: '850440', statKorName: undefined },
    '전기차용 리튬이온 배터리': { code: '850760', statKorName: undefined },
    '태양광 패널': { code: '854140', statKorName: undefined },
    '전기자동차': { code: '870380', statKorName: undefined },
    '전기 이륜차': { code: '871160', statKorName: undefined },
    'ESS배터리': { code: '8507603000', statKorName: '에너지 저장장치용' },
    '기타배터리': { code: '8507609000', statKorName: '기타' },
    '반도체': { code: '854211', statKorName: '반도체' },
    '컴퓨터': { code: '847130', statKorName: '컴퓨터' },
};

// --- 제품 설명 데이터 ---
const productDescriptions: { [key: string]: string } = {
    "310100": "화학 성분이 포함되지 않은 저탄소 농업용 비료로, 유기농 인증 농산물 생산에 필수적인 품목입니다.",
    "340290": "저자극성과 생분해성을 갖춘 친환경 세정제로, 환경성 질환 증가로 수요가 급증하고 있습니다.",
    "392490": "재사용이 가능하여 생활 폐기물을 줄일 수 있는 친환경 제품으로, 제로웨이스트 문화 확산과 함께 인기를 끌고 있습니다.",
    "400110": "생분해 가능한 생물 유래 소재로, 탄소중립에 기여할 수 있는 친환경 원료입니다.",
    "482390": "생분해 가능한 친환경 대체재로, 플라스틱 사용 규제로 인해 시장이 급성장하고 있습니다.",
    "520100": "생분해성이 뛰어난 천연 섬유로, 농약 없이 재배되어 지속가능 패션 수요에 대응하고 있습니다.",
    "680610": "폐철강 부산물을 재활용한 단열 성능이 우수한 친환경 건축 자재입니다.",
    "821599": "일회용품 대체용으로 반복 사용 가능한 스테인리스 빨대 등 친환경 식기입니다.",
    "841919": "태양 에너지를 열에너지로 변환하는 장비로, 친환경 난방·급탕 시설에 활용됩니다.",
    "850231": "풍력 자원을 활용한 재생에너지 발전 장비로, 해상풍력 확대에 따라 시장이 성장 중입니다.",
    "850440": "신재생 에너지를 효율적으로 운용하기 위한 핵심 장치로, ESS 연계 기술과 함께 중요성이 커지고 있습니다.",
    "850760": "무공해 전기차에 사용되는 에너지 저장 장치로, 미래 핵심 산업으로 주목받고 있습니다.",
    "854140": "태양 에너지를 전기로 변환하는 핵심 장비로, 탄소세 도입과 함께 설치가 급속히 확산되고 있습니다.",
    "870380": "배출가스가 없는 무공해 운송 수단으로, 전 세계적으로 보급 확대가 추진되고 있습니다.",
    "871160": "전기 구동 방식의 친환경 이륜차로, 도심 배송과 마이크로 모빌리티 수요로 급성장 중입니다.",
};

// --- 유틸리티 함수들 ---
const formatNumber = (num: number): string => num.toLocaleString();

const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: change, isPositive: change >= 0 };
};

const generateMonthLabels = (year: string, dataLength: number): string[] => {
    const labels = [];
    for (let i = 1; i <= dataLength; i++) {
        labels.push(`${year}.${i < 10 ? '0' + i : i}`);
    }
    return labels;
};

const generateChartData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
    const currentYearNum = parseInt(selectedYear);
    const now = new Date();
    const isCurrentYear = currentYearNum === now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const dataLength = isCurrentYear ? currentMonth : 12;

    const labels = generateMonthLabels(selectedYear, dataLength);
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

const generateBarData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
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

const generateLineData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
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

const generateMixedData = (apiTradeData: ApiTradeData[], selectedYear: string) => {
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

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: '월별 수출입액' },
    },
    scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, title: { display: true, text: '금액 ($)' } },
    },
};

const mixedChartOptions = {
    ...chartOptions,
    plugins: {
        ...chartOptions.plugins,
        title: { display: true, text: '월별 수출입액 (혼합)' },
    },
};

// --- API 함수 ---
const fetchTradeDataByHsCode = async (hsCodeParam: string, country: string, year: string): Promise<ApiTradeData[]> => {
    try {
        const countryCode = countryCodeMap[country] || 'US';
        const productInfo = Object.values(hsCodeMap).find(item => item.code === hsCodeParam);
        
        if (!productInfo) {
            console.error(`HS Code '${hsCodeParam}' not found in hsCodeMap.`);
            return [];
        }

        const response = await axios.get('http://localhost:8088/MV/api/data', {
            params: {
                start: `${year}01`,
                end: `${year}12`,
                country: countryCode,
                hs: productInfo.code
            },
            timeout: 10000,
        });
        
        let responseData = response.data;
        if (typeof responseData === 'string') {
            responseData = JSON.parse(responseData);
        }

        let extractedDataArray: any[] = [];
        
        if (responseData?.response?.body?.items?.item) {
            extractedDataArray = Array.isArray(responseData.response.body.items.item) 
                ? responseData.response.body.items.item 
                : [responseData.response.body.items.item];
        } else if (responseData?.item && Array.isArray(responseData.item)) {
            extractedDataArray = responseData.item;
        }

        const transformedData: ApiTradeData[] = [];
        
        extractedDataArray.forEach((item: any, index: number) => {
            const trimmedItemStatKor = String(item.statKor || '').trim();
            const trimmedApiStatKorName = String(productInfo.statKorName || '').trim();

            if (item.statKor && item.statKor !== '-' && item.statKor !== '총계' && 
                (productInfo.statKorName ? trimmedItemStatKor === trimmedApiStatKorName : true)) {
                
                let monthExtracted = index + 1;
                if (item.year) {
                    const yearStr = String(item.year);
                    const dotIndex = yearStr.indexOf('.');
                    if (dotIndex !== -1 && dotIndex < yearStr.length - 1) {
                        monthExtracted = parseInt(yearStr.slice(dotIndex + 1), 10);
                    }
                }
                
                if (isNaN(monthExtracted) || monthExtracted < 1 || monthExtracted > 12) {
                    monthExtracted = index + 1;
                }

                transformedData.push({
                    month: monthExtracted,
                    exportValue: parseFloat(item.expDlr?.toString() || '0'),
                    importValue: parseFloat(item.impDlr?.toString() || '0'),
                    growthRate: parseFloat((item.growthRate || item.rate || item.growthRatio || 0).toString()),
                    year: parseInt(year),
                    country: country,
                    product: productInfo.statKorName || hsCodeParam
                });
            }
        });
        
        return transformedData;
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
};

// --- 메인 컴포넌트 ---
export default function GraphsPage() {
    const { hsCode } = useParams<{ hsCode?: string }>();
    
    // 디버깅을 위한 콘솔 로그
    console.log('Current hsCode from URL:', hsCode);
    console.log('Current URL:', window.location.href);
    
    const [selectedChart, setSelectedChart] = useState("bar");
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [selectedCountry, setSelectedCountry] = useState("미국");
    const [apiTradeData, setApiTradeData] = useState<ApiTradeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // API 데이터 로드
    useEffect(() => {
        let ignore = false;

        const loadTradeData = async () => {
            if (!hsCode) {
                setApiError('URL에 HS 코드가 없습니다.');
                return;
            }
            
            setLoading(true);
            setApiError('');
            setApiTradeData([]);

            try {
                const data = await fetchTradeDataByHsCode(hsCode, selectedCountry, selectedYear);
                if (!ignore) {
                    setApiTradeData(data);
                    if (data.length === 0) {
                        setApiError('선택된 조건으로 조회된 데이터가 없습니다.');
                    }
                }
            } catch (error) {
                if (!ignore) {
                    setApiError('데이터를 불러오는 데 실패했습니다.');
                    setApiTradeData([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadTradeData();
        return () => { ignore = true; };
    }, [hsCode, selectedCountry, selectedYear]);

    // 계산된 값들
    const currentProductInfo = Object.values(hsCodeMap).find(item => item.code === hsCode);
    const displayProductName = currentProductInfo?.statKorName || 
        Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || 
        (hsCode ? `HS코드 ${hsCode}` : "품목");
    
    const productDescription = hsDescriptions[Object.keys(hsCodeMap).find(key => hsCodeMap[key].code === hsCode) || ''] || 
        productDescriptions[hsCode || ''] || 
        `${displayProductName}의 무역 데이터를 분석하고 있습니다.`;

    const apiExportTotal = apiTradeData.reduce((sum, item) => sum + item.exportValue, 0);
    const apiImportTotal = apiTradeData.reduce((sum, item) => sum + item.importValue, 0);
    const totalTradeAmount = apiExportTotal + apiImportTotal;

    const currentYearNum = parseInt(selectedYear);
    const now = new Date();
    const isCurrentYear = currentYearNum === now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const dataLength = isCurrentYear ? currentMonth : 12;
    const 기간표현 = `${selectedYear}년 1월~${dataLength}월 누적`;

    if (!hsCode) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg text-gray-500">조회할 HS 코드를 URL에 입력해 주세요.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 space-y-8 pt-0">
            {loading && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    데이터를 불러오는 중...
                </div>
            )}
            
            {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                    ⚠️ {apiError}
                </div>
            )}

            {/* 지역별 데이터 맵 */}
            <div className="rounded-2xl bg-white flex flex-col items-start p-4 sm:p-6 shadow-md w-full">
                <div className="flex items-center mb-4">
                    <Map className="h-7 w-7 text-[#9AD970] mr-3" />
                    <span className="text-xl font-semibold text-gray-800">지역별 데이터 맵</span>
                </div>
                <div className="h-[500px] w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <CountryMap
                        allowedCountries={DEFAULT_COUNTRIES}
                        selectedCountryName={selectedCountry}
                        onCountrySelect={setSelectedCountry}
                    />
                </div>
            </div>

            {/* 그래프 섹션 */}
            <div className="rounded-2xl bg-white w-full">
                <div className="pt-6 pb-2 px-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-semibold">그래프</span>
                        {apiTradeData.length > 0 && (
                            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                API 데이터 {apiTradeData.length}건
                            </span>
                        )}
                    </div>
                    
                    {/* 컨트롤 패널 */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        <div className="flex gap-2">
                            {chartTypes.map((type) => {
                                const Icon = type.icon;
                                const selected = selectedChart === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedChart(type.id)}
                                        className={`flex items-center justify-center px-3 py-2 rounded-lg border transition
                                            ${selected 
                                                ? "bg-[#9AD970] text-white border-[#9AD970] shadow" 
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-[#eafbe0]"
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                            <SelectTrigger className="h-10 w-40 bg-white border border-gray-200 rounded-lg">
                                <SelectValue placeholder="나라 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEFAULT_COUNTRIES.map((country) => (
                                    <SelectItem key={country} value={country}>{country}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="h-10 w-40 bg-white border border-gray-200 rounded-lg">
                                <SelectValue placeholder="년도 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}년</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 데이터 요약 및 차트 */}
                    <div className="flex items-start gap-6">
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
                        
                        <div className="w-3/4 min-w-0 flex-1">
                            <div className="relative w-full h-[400px]">
                                {selectedChart === "bar" && (
                                    <BarChart
                                        className="absolute inset-0 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                                        data={generateBarData(apiTradeData, selectedYear)}
                                        options={chartOptions}
                                    />
                                )}
                                {selectedChart === "line" && (
                                    <LineChart
                                        className="absolute inset-0 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                                        data={generateLineData(apiTradeData, selectedYear)}
                                        options={chartOptions}
                                    />
                                )}
                                {selectedChart === "combined" && (
                                    <MixedChart
                                        className="absolute inset-0 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                                        data={generateMixedData(apiTradeData, selectedYear)}
                                        options={mixedChartOptions}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}