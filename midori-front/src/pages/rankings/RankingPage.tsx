"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import Logo from "../../components/logo";
import { useSorting } from "../../hooks/useSorting";
import type { TradeData } from "../../types/rankings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useNavigate } from "react-router-dom";

export default function RankingsPage() {
    const [tradeData, setTradeData] = useState<TradeData[]>([]);
    const [apiStatus, setApiStatus] = useState('');
    const [ecoData, setEcoData] = useState<any>(null);
    const [filter, setFilter] = useState({
        yearMonth: "2025.05",
        category: "all",
        country: "all",
    });
    const navigate = useNavigate();

    const yearMonthOptions = [
        "2024.07", "2024.08", "2024.09", "2024.10", "2024.11", "2024.12",
        "2025.01", "2025.02", "2025.03", "2025.04", "2025.05", "2025.06"
    ];

    // 백엔드 API 호출 함수
    const fetchDataFromBackend = async (yearMonth: string) => {
        try {
            setApiStatus(`🔄 ${yearMonth} 데이터 요청 중...`);

            const apiResponse = await fetch('http://localhost:3001/api/trade/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    yearMonth: yearMonth,
                    products: ecoData?.ecoProducts || [],
                    countries: ecoData?.countries || []
                })
            });

            if (!apiResponse.ok) {
                throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
            }

            const apiData = await apiResponse.json();

            if (apiData.success) {
                setApiStatus(`✅ ${yearMonth} 데이터 수신 완료 (${apiData.count}개 항목)`);

                // 백엔드 데이터를 기존 형식으로 변환
                const transformedData = (apiData.data || []).map((item: any) => {
                    // RANK_ID에서 HS코드 추출 (예: "AU-310100-2024.11" -> "310100")
                    let extractedHsCode = '';
                    if (item.RANK_ID) {
                        const parts = item.RANK_ID.split('-');
                        if (parts.length >= 2) {
                            extractedHsCode = parts[1];
                        }
                    }

                    return {
                        hsCd: extractedHsCode || item.HS_CODE || '',
                        statCd: item.RANK_COUNTRY_CODE || '',
                        statKor: item.RANK_PRODUCT || '',
                        statCdCntnKor1: item.RANK_COUNTRY || '',
                        expDlr: item.EXPORT_VALUE || 0,
                        impDlr: item.IMPORT_VALUE || 0,
                        balPayments: (item.EXPORT_VALUE || 0) + (item.IMPORT_VALUE || 0),
                        category: item.RANK_CATEGORY || '',
                        period: item.RANK_PERIOD || '',
                    };
                });

                return transformedData;
            } else {
                throw new Error(apiData.error || 'API 응답 실패');
            }

        } catch (error: any) {
            setApiStatus(`❌ API 호출 실패: ${error.message}`);
            return [];
        }
    };

    // 필터 변경 핸들러
    const handleFilterChange = (key: string, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value }));

        if (key === 'yearMonth') {
            const reloadData = async () => {
                const apiData = await fetchDataFromBackend(value);
                setTradeData(apiData);
            };
            reloadData();
        }
    };

    // 초기 데이터 로딩
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // ranking.json 로드 (선택사항)
                try {
                    const jsonResponse = await fetch('/ranking.json');
                    if (jsonResponse.ok) {
                        const data = await jsonResponse.json();
                        setEcoData(data);
                    }
                } catch (error) {
                    // ranking.json 없어도 계속 진행
                }

                // 실제 API 데이터 로드
                const apiData = await fetchDataFromBackend(filter.yearMonth);
                setTradeData(apiData);

            } catch (error: any) {
                setApiStatus(`❌ 초기화 실패: ${error.message}`);
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

        // 카테고리 필터 적용
        if (filter.category && filter.category !== "all") {
            filtered = filtered.filter((item: any) => item.category === filter.category);
        }

        // 국가 필터 적용
        if (filter.country && filter.country !== "all") {
            filtered = filtered.filter((item: any) => {
                const directMatch = item.statCd === filter.country;
                const ecoMatch = ecoData?.countries?.find((c: any) => c.name === item.statCdCntnKor1)?.code === filter.country;
                return directMatch || ecoMatch;
            });
        }

        return filtered;
    }, [sortedData, filter.category, filter.country, ecoData]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("ko-KR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + '$';
    };

    // 국가명 → 국기 이모지 매핑
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
                    {/* Enhanced Page Header */}
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
                                실시간 API 데이터를 기반으로 한 글로벌 무역 성과 분석
                            </p>
                        </div>
                    </div>

                    {/* Enhanced API Status */}
                    {apiStatus && apiStatus.includes('❌') && (
                        <div className="max-w-2xl mx-auto">
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-red-700 font-medium">{apiStatus}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Filter Section */}
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

                    {/* Enhanced Main Rankings Table */}
                    <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-[#9AD970] to-[#7BC142] text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold mb-2">무역 품목별 순위</CardTitle>
                                    <CardDescription className="text-green-100 text-base">
                                        실시간 API 데이터 기반 글로벌 무역 성과 분석 (단위: USD)
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{filteredData.length}</div>
                                    <div className="text-sm text-green-100">총 품목 수</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow className="border-b border-gray-200">
                                            <TableHead className="w-20 text-center font-semibold text-gray-700 py-4">순위</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">국가</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">품목</TableHead>
                                            <TableHead className="font-semibold text-gray-700 py-4">HS코드</TableHead>
                                            <TableHead
                                                className="w-36 font-semibold text-red-600 py-4 cursor-pointer hover:bg-red-50 transition-colors select-none"
                                                onClick={() => handleSort('expDlr')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>수출액</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs ${sortConfig.field === 'expDlr' && sortConfig.order === 'asc' ? 'text-red-600' : 'text-gray-400'}`}>▲</span>
                                                        <span className={`text-xs ${sortConfig.field === 'expDlr' && sortConfig.order === 'desc' ? 'text-red-600' : 'text-gray-400'}`}>▼</span>
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="w-36 font-semibold text-green-600 py-4 cursor-pointer hover:bg-green-50 transition-colors select-none"
                                                onClick={() => handleSort('impDlr')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>수입액</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs ${sortConfig.field === 'impDlr' && sortConfig.order === 'asc' ? 'text-green-600' : 'text-gray-400'}`}>▲</span>
                                                        <span className={`text-xs ${sortConfig.field === 'impDlr' && sortConfig.order === 'desc' ? 'text-green-600' : 'text-gray-400'}`}>▼</span>
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="w-36 font-semibold text-blue-600 py-4 cursor-pointer hover:bg-blue-50 transition-colors select-none"
                                                onClick={() => handleSort('balPayments')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>총수출입액</span>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs ${sortConfig.field === 'balPayments' && sortConfig.order === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}>▲</span>
                                                        <span className={`text-xs ${sortConfig.field === 'balPayments' && sortConfig.order === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}>▼</span>
                                                    </div>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.slice(0, 50).map((item, idx) => (
                                            <TableRow
                                                key={`${item.hsCd || 'no-hs'}-${item.statCd || 'no-stat'}-${item.statKor || 'no-product'}-${idx}`}
                                                className="hover:bg-blue-50 cursor-pointer transition-colors duration-200 border-b border-gray-100 group"
                                                onClick={() => navigate(`/graphs/${encodeURIComponent(item.statKor)}`)}
                                            >
                                                <TableCell className="text-center py-4">
                                                    {idx < 3 ? (
                                                        <div className="flex items-center justify-center">
                                                            <span className="text-2xl">
                                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            <span className="font-semibold text-gray-600 text-lg">
                                                                {idx + 1}
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-xl">{getCountryFlag(item.statCdCntnKor1)}</span>
                                                        <span className="font-medium text-gray-900">{item.statCdCntnKor1}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                                                        {item.statKor}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                        {item.hsCd}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="w-36 py-4">
                                                    <span className="font-mono font-semibold text-red-600">
                                                        {formatCurrency(item.expDlr)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="w-36 py-4">
                                                    <span className="font-mono font-semibold text-green-600">
                                                        {formatCurrency(item.impDlr)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="w-36 py-4">
                                                    <span className="font-mono font-semibold text-blue-600">
                                                        {formatCurrency(item.expDlr + item.impDlr)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Enhanced No Data Message */}
                            {filteredData.length === 0 && (
                                <div className="text-center py-16">
                                    {tradeData.length === 0 ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-2xl">📡</span>
                                            </div>
                                            <div className="text-gray-600 text-lg">
                                                백엔드 API에서 데이터를 가져오는 중입니다
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                백엔드 서버가 실행 중인지 확인해주세요: http://localhost:3001
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                                                <span className="text-2xl">🔍</span>
                                            </div>
                                            <div className="text-gray-600 text-lg">
                                                선택한 필터 조건에 맞는 데이터가 없습니다
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                다른 카테고리나 국가를 선택해보세요
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Enhanced Backend Connection Guide */}
                    {tradeData.length === 0 && (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">💡</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-amber-900 text-lg mb-3">
                                            백엔드 서버 실행 안내
                                        </h4>
                                        <p className="text-amber-800 mb-4 leading-relaxed">
                                            실시간 API 데이터를 확인하려면 백엔드 서버를 실행해주세요:
                                        </p>
                                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                                            <div className="text-green-400">$ npm install node-fetch</div>
                                            <div className="text-blue-400">$ node server.js</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}