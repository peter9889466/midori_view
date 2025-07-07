"use client";

import { useState, useEffect, useMemo } from "react";
import Logo from "../../components/logo";
import { useSorting } from "../../hooks/useSorting";
import type { TradeData } from "../../types/rankings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useNavigate } from "react-router-dom";
import RankingTable from "../../components/rankings/RankingTable";

// 정적 데이터 파일 매핑
const STATIC_DATA_FILES = {
    "2024.06": "/data/trade-2024-06.json",
    "2024.07": "/data/trade-2024-07.json",
    "2024.08": "/data/trade-2024-08.json",
    "2024.09": "/data/trade-2024-09.json",
    "2024.10": "/data/trade-2024-10.json",
    "2024.11": "/data/trade-2024-11.json",
    "2024.12": "/data/trade-2024-12.json",
    "2025.01": "/data/trade-2025-01.json",
    "2025.02": "/data/trade-2025-02.json",
    "2025.03": "/data/trade-2025-03.json",
    "2025.04": "/data/trade-2025-04.json",
    "2025.05": "/data/trade-2025-05.json",
};

// 기본 국가 데이터
const DEFAULT_ECO_DATA = {
    countries: [
        { code: "US", name: "미국", flag: "🇺🇸" },
        { code: "CN", name: "중국", flag: "🇨🇳" },
        { code: "JP", name: "일본", flag: "🇯🇵" },
        { code: "VN", name: "베트남", flag: "🇻🇳" },
        { code: "GB", name: "영국", flag: "🇬🇧" },
        { code: "DE", name: "독일", flag: "🇩🇪" },
        { code: "FR", name: "프랑스", flag: "🇫🇷" },
        { code: "IN", name: "인도", flag: "🇮🇳" },
        { code: "TW", name: "대만", flag: "🇹🇼" },
        { code: "TH", name: "태국", flag: "🇹🇭" },
        { code: "AU", name: "호주", flag: "🇦🇺" },
    ],
    ecoProducts: []
};

export default function RankingsPage() {
    const [tradeData, setTradeData] = useState<TradeData[]>([]);
    const [ecoData, setEcoData] = useState<any>(null);
    const [filter, setFilter] = useState({
        yearMonth: "2025.05",
        category: "all",
        country: "all",
    });
    const navigate = useNavigate();

    const yearMonthOptions = [
        '2024.06', "2024.07", "2024.08", "2024.09", "2024.10", "2024.11", "2024.12",
        "2025.01", "2025.02", "2025.03", "2025.04", "2025.05"
    ];

    // 데이터 로딩 함수 (JSON 파일 전용)
    const fetchData = async (yearMonth: string): Promise<TradeData[]> => {
        const staticFilePath = STATIC_DATA_FILES[yearMonth as keyof typeof STATIC_DATA_FILES];
        if (!staticFilePath) return [];

        try {
            const response = await fetch(staticFilePath);
            if (!response.ok) return [];
            
            const data = await response.json();
            
            // DB 형식을 프론트엔드 형식으로 변환
            return (data || []).map((item: any) => {
                const parts = item.RANK_ID?.split('-') || [];
                return {
                    hsCd: parts[1] || '',
                    statCd: parts[0] || '',
                    statKor: item.RANK_PRODUCT || '',
                    statCdCntnKor1: item.RANK_COUNTRY || '',
                    expDlr: item.EXPORT_VALUE || 0,
                    impDlr: item.IMPORT_VALUE || 0,
                    balPayments: (item.EXPORT_VALUE || 0) + (item.IMPORT_VALUE || 0),
                    category: item.RANK_CATEGORY || '',
                    period: item.RANK_PERIOD || '',
                };
            });
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            return [];
        }
    };

    // 필터 변경 핸들러
    const handleFilterChange = (key: string, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
        if (key === 'yearMonth') {
            fetchData(value).then(setTradeData);
        }
    };

    // 초기 데이터 로딩
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // eco 데이터 설정
                try {
                    const jsonResponse = await fetch('/ranking.json');
                    if (jsonResponse.ok) {
                        const data = await jsonResponse.json();
                        setEcoData(data);
                    } else {
                        setEcoData(DEFAULT_ECO_DATA);
                    }
                } catch (error) {
                    setEcoData(DEFAULT_ECO_DATA);
                }

                // JSON 파일에서 직접 데이터 로드
                const data = await fetchData(filter.yearMonth);
                setTradeData(data);

            } catch (error: any) {
                setEcoData(DEFAULT_ECO_DATA);
                setTradeData([]);
            }
        };

        loadInitialData();
    }, []);

    const { sortedData, sortConfig, handleSort } = useSorting(tradeData, {
        field: "expDlr",
        order: "desc",
    });

    // 필터링된 데이터
    const filteredData = useMemo(() => {
        let filtered = sortedData;

        if (filter.category !== "all") {
            filtered = filtered.filter((item: any) => item.category === filter.category);
        }

        if (filter.country !== "all") {
            filtered = filtered.filter((item: any) => 
                item.statCd === filter.country || 
                ecoData?.countries?.find((c: any) => c.name === item.statCdCntnKor1)?.code === filter.country
            );
        }

        return filtered;
    }, [sortedData, filter.category, filter.country, ecoData]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("ko-KR").format(amount) + '$';
    };

    const getCountryFlag = (country: string) => {
        const flags: Record<string, string> = {
            "미국": "🇺🇸", "중국": "🇨🇳", "일본": "🇯🇵", "베트남": "🇻🇳", "영국": "🇬🇧",
            "독일": "🇩🇪", "프랑스": "🇫🇷", "인도": "🇮🇳", "대만": "🇹🇼", "태국": "🇹🇭", "호주": "🇦🇺",
        };
        return flags[country] || "🌐";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8 font-sans">
                    {/* 페이지 헤더 */}
                    <div className="text-center space-y-6">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-20"></div>
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl border border-gray-100">
                                    <Logo size={44} className="text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                무역 순위 및 성과
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                글로벌 무역 성과 분석 대시보드
                            </p>
                        </div>
                    </div>

                    {/* 필터 섹션 */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                            <h2 className="text-lg font-semibold text-gray-900">데이터 필터</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 기준년월 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">기준년월</label>
                                <Select value={filter.yearMonth} onValueChange={v => handleFilterChange("yearMonth", v)}>
                                    <SelectTrigger className="w-full h-11 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors rounded-lg">
                                        <SelectValue placeholder="기준년월 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-gray-200">
                                        {yearMonthOptions.map((ym) => (
                                            <SelectItem key={ym} value={ym} className="hover:bg-blue-50">{ym}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 국가 필터 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">국가</label>
                                <Select value={filter.country} onValueChange={v => handleFilterChange("country", v)}>
                                    <SelectTrigger className="w-full h-11 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors rounded-lg">
                                        <SelectValue placeholder="국가 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-gray-200">
                                        <SelectItem value="all" className="hover:bg-blue-50">🌐 전체 국가</SelectItem>
                                        {ecoData?.countries ? (
                                            ecoData.countries.map((country: any) => (
                                                <SelectItem key={country.code} value={country.code} className="hover:bg-blue-50">
                                                    {country.flag || '🏳️'} {country.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="loading" disabled>데이터 로딩 중...</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 카테고리 필터 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">카테고리</label>
                                <Select value={filter.category} onValueChange={v => handleFilterChange("category", v)}>
                                    <SelectTrigger className="w-full h-11 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors rounded-lg">
                                        <SelectValue placeholder="카테고리 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-gray-200">
                                        <SelectItem value="all" className="hover:bg-blue-50">🌐 전체</SelectItem>
                                        {ecoData?.categories ? (
                                            Object.keys(ecoData.categories).map((category) => (
                                                <SelectItem key={category} value={category} className="hover:bg-blue-50">
                                                    {ecoData.categories[category]?.icon || '📦'} {category}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="loading" disabled>데이터 로딩 중...</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* 메인 테이블 */}
                    <RankingTable
                        filteredData={filteredData}
                        sortConfig={sortConfig}
                        handleSort={handleSort}
                        formatCurrency={formatCurrency}
                        getCountryFlag={getCountryFlag}
                        navigate={navigate}
                        tradeDataLength={tradeData.length}
                    />
                </div>
            </div>
        </div>
    );
}