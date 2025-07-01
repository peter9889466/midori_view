"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { generateTradeData } from "../../data/tradeData";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    BarChart3,
    LineChart as LineChartIcon,
    Layers,
    Map,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { countries } from "../../components/constants";
import { useParams } from "react-router-dom";
import MixedChart from '../../chart/MixedChart';
import BarChart from '../../chart/BarChart';
import LineChart from '../../chart/LineChart';

interface ChartType {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

const chartTypes: ChartType[] = [
    { id: "bar", name: "막대 차트", icon: BarChart3 },
    { id: "line", name: "선형 차트", icon: LineChartIcon },
    { id: "combined", name: "혼합 차트", icon: Layers },
];

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(num);
};

const calculatePercentageChange = (current: number, previous: number) => {
    if (!previous) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
        value: Math.abs(change),
        isPositive: change >= 0
    };
};

// 월별 라벨 생성 함수
const generateMonthLabels = (selectedYear: string) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // 선택된 연도가 현재 연도인 경우 현재 월까지만 표시
    if (parseInt(selectedYear) === currentYear) {
        return Array.from({ length: currentMonth }, (_, i) => `${i + 1}월`);
    }

    // 과거 연도인 경우 12개월 모두 표시
    return Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
};

// 막대 차트 데이터 생성 함수
const generateBarData = (selectedYear: string) => {
    const labels = generateMonthLabels(selectedYear);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const dataLength = parseInt(selectedYear) === currentYear ? currentMonth : 12;

    return {
        labels,
        datasets: [
            {
                label: '수출',
                data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 500) + 100),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderRadius: 6,
            },
            {
                label: '수입',
                data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 500) + 100),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 6,
            },
        ],
    };
};

// 선형 차트 데이터 생성 함수
const generateLineData = (selectedYear: string) => {
    const labels = generateMonthLabels(selectedYear);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const dataLength = parseInt(selectedYear) === currentYear ? currentMonth : 12;

    return {
        labels,
        datasets: [
            {
                label: '수출',
                data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 500) + 100),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.0,
                fill: false,
            },
            {
                label: '수입',
                data: Array.from({ length: dataLength }, () => Math.floor(Math.random() * 500) + 100),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.0,
                fill: false,
            },
        ],
    };
};

// 혼합 차트 데이터 생성 함수
const generateMixedData = (selectedYear: string) => {
    const labels = generateMonthLabels(selectedYear);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const dataLength = parseInt(selectedYear) === currentYear ? currentMonth : 12;

    // 수출/수입 데이터 (막대그래프용)
    const exportData = Array.from({ length: dataLength }, () => Math.floor(Math.random() * 500) + 100);
    const importData = Array.from({ length: dataLength }, () => Math.floor(Math.random() * 500) + 100);

    // 전년대비동월증감률 데이터 (꺾은선그래프용) - -20% ~ +30% 범위
    const growthRateData = Array.from({ length: dataLength }, () =>
        Math.round((Math.random() * 50 - 20) * 10) / 10 // -20.0 ~ +30.0 범위, 소수점 첫째자리까지
    );

    return {
        labels,
        datasets: [
            {
                type: 'bar' as const,
                label: '수출',
                data: exportData,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderRadius: 6,
                yAxisID: 'y', // 왼쪽 Y축 (수출/수입용)
            },
            {
                type: 'bar' as const,
                label: '수입',
                data: importData,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 6,
                yAxisID: 'y', // 왼쪽 Y축 (수출/수입용)
            },
            {
                type: 'line' as const,
                label: '전년대비동월증감률(%)',
                data: growthRateData,
                borderColor: 'rgba(239, 68, 68, 1)', // 빨간색
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.0,
                fill: false,
                yAxisID: 'y1', // 오른쪽 Y축 (증감률용)
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
            },
        ],
    };
};

const sampleOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: '샘플 혼합 차트',
        },
    },
};

// 혼합차트용 옵션 (이중 Y축)
const mixedChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
            display: true,
            text: '수출/수입 및 전년대비증감률',
        },
    },
    scales: {
        y: {
            type: 'linear' as const,
            display: true,
            position: 'left' as const,
            title: {
                display: true,
                text: '수출/수입 금액 (USD)',
            },
        },
        y1: {
            type: 'linear' as const,
            display: true,
            position: 'right' as const,
            title: {
                display: true,
                text: '전년대비증감률 (%)',
            },
            grid: {
                drawOnChartArea: false,
            },
        },
    },
};

export default function GraphsPage() {
    const { product } = useParams<{ product?: string }>();
    const [selectedChart, setSelectedChart] = useState("bar");
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [currentData, setCurrentData] = useState<{ totalDlr: number, prevTotalDlr: number }>({ totalDlr: 0, prevTotalDlr: 0 });

    useEffect(() => {
        // 현재 데이터 생성
        const tradeData = generateTradeData();
        const productData = tradeData.find(item => item.statKor === product);

        if (productData) {
            const currentTotalDlr = productData.expDlr + productData.impDlr;
            // 이전 달 데이터 생성 (임시로 현재 값의 랜덤 변동으로 설정)
            const prevTotalDlr = currentTotalDlr * (1 + (Math.random() * 0.2 - 0.1));

            setCurrentData({
                totalDlr: currentTotalDlr,
                prevTotalDlr: prevTotalDlr
            });
        }
    }, [product]);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg text-gray-500">품목을 선택해 주세요.</p>
            </div>
        );
    }

    const { value: percentChange, isPositive } = calculatePercentageChange(
        currentData.totalDlr,
        currentData.prevTotalDlr
    );

    return (
        <div className="container mx-auto px-4 py-12 space-y-8">
            {/* 품목명과 거래액 */}
            <div className="space-y-1">
                <h1 className="text-base font-medium text-left text-gray-600">{product}</h1>
                <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold">{formatNumber(currentData.totalDlr)}</span>
                    <div className={`flex items-center gap-1 text-lg font-medium ${currentData.prevTotalDlr === 0
                            ? 'text-gray-500'
                            : isPositive
                                ? 'text-green-500'
                                : 'text-red-500'
                        }`}>
                        {currentData.prevTotalDlr === 0 ? (
                            <span>0%</span>
                        ) : (
                            <>
                                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                <span>{percentChange.toFixed(1)}%</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 지도 섹션 */}
            <div className="rounded-2xl bg-white flex flex-col items-start py-8 mb-6 w-full">
                <div className="flex items-start mb-2">
                    <Map className="h-8 w-8 text-[#9AD970] mr-2" />
                    <span className="text-lg font-semibold text-gray-800">지역별 데이터 맵</span>
                </div>
                <div className="h-56 w-full flex items-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 justify-center">
                    <span className="text-gray-400">지도 컴포넌트가 여기에 표시됩니다</span>
                </div>
            </div>

            {/* 그래프 영역 (차트 옵션 포함)*/}
            <div className="mt-4 rounded-2xl bg-white w-full">
                <div className=" pt-6 pb-2">
                    <div className="text-base font-semibold mb-4">그래프</div>
                    {/* 차트 옵션 */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        {/* 차트 종류 버튼 그룹 (아이콘만) */}
                        <div className="flex gap-2">
                            {chartTypes.map((type) => {
                                const Icon = type.icon;
                                const selected = selectedChart === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedChart(type.id)}
                                        className={`flex items-center justify-center px-3 py-2 rounded-lg border transition text-xl
                                            ${selected ? "bg-[#9AD970] text-white border-[#9AD970] shadow" : "bg-white text-gray-700 border-gray-200 hover:bg-[#eafbe0]"}
                                        `}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                        {/* 나라 선택 Select */}
                        <div>
                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                <SelectTrigger className="h-10 w-40 bg-white border border-gray-200 rounded-lg">
                                    <SelectValue placeholder="나라 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country} value={country}>{country}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* 년도 선택 Select */}
                        <div>
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
                    </div>
                    {/* 그래프 영역 */}
                    <div className="h-full flex items-center justify-end gap-10">
                        <div className="w-1/4">
                            종목 <hr />
                            일단<hr />
                            아무<hr />
                            거나<hr />
                            텍스트<hr />

                        </div>
                        <div className="w-3/4 h-full">
                            {selectedChart === "bar" && (
                                <BarChart className="h-full w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200" data={generateBarData(selectedYear)} options={sampleOptions} />
                            )}
                            {selectedChart === "line" && (
                                <LineChart className="h-full w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200" data={generateLineData(selectedYear)} options={sampleOptions} />
                            )}
                            {selectedChart === "combined" && (
                                <MixedChart className="h-full w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200" data={generateMixedData(selectedYear)} options={mixedChartOptions} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
