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
import { SortableTableHeader } from "../../components/sortable-table-header";
import Logo from "../../components/logo";
import { useSorting } from "../../hooks/useSorting";
import type { TradeData } from "../../types/rankings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useNavigate } from "react-router-dom";

export default function RankingsPage() {
    const [tradeData, setTradeData] = useState<TradeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState('');
    const [ecoData, setEcoData] = useState<any>(null);
    const [filter, setFilter] = useState({
        yearMonth: "2025.05",
        category: "all",
        country: "all",
    });
    const navigate = useNavigate();

    // 수정된 년월 옵션 (하드코딩)
    const getYearMonthOptions = () => {
        return [
            "2024.07", "2024.08", "2024.09", "2024.10", "2024.11", "2024.12",
            "2025.01", "2025.02", "2025.03", "2025.04", "2025.05", "2025.06"
        ];
    };
    const yearMonthOptions = getYearMonthOptions();

    // 백엔드 API 호출 함수
    const fetchDataFromBackend = async (yearMonth: string) => {
        try {
            console.log(`🔄 백엔드 API로 ${yearMonth} 데이터 요청 중...`);
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
                console.log('✅ 백엔드 API 데이터 수신 성공:', apiData.count, '개 항목');
                
                // 디버깅: 첫 번째 데이터 항목의 구조 확인
                if (apiData.data && apiData.data.length > 0) {
                    console.log('🔍 첫 번째 데이터 항목 구조:', apiData.data[0]);
                    console.log('🔍 데이터 키들:', Object.keys(apiData.data[0]));
                }
                
                setApiStatus(`✅ ${yearMonth} 데이터 수신 완료 (${apiData.count}개 항목)`);
                
                // 백엔드 데이터를 기존 형식으로 변환
                const transformedData = (apiData.data || []).map((item: any) => {
                    // RANK_ID에서 HS코드 추출 (예: "AU-310100-2024.11" -> "310100")
                    let extractedHsCode = '';
                    if (item.RANK_ID) {
                        const parts = item.RANK_ID.split('-');
                        if (parts.length >= 2) {
                            extractedHsCode = parts[1]; // 두 번째 부분이 HS코드
                        }
                    }
                    
                    // 디버깅: HS코드 추출 과정 로그
                    console.log(`🔍 RANK_ID: ${item.RANK_ID} -> HS코드: ${extractedHsCode}`);
                    
                    return {
                        hsCd: extractedHsCode || item.HS_CODE || '',    // RANK_ID에서 추출한 HS코드 우선 사용
                        statCd: item.RANK_COUNTRY_CODE || '',           // DB의 RANK_COUNTRY_CODE 필드
                        statKor: item.RANK_PRODUCT || '',               // DB의 RANK_PRODUCT 필드
                        statCdCntnKor1: item.RANK_COUNTRY || '',        // DB의 RANK_COUNTRY 필드
                        expDlr: item.EXPORT_VALUE || 0,                 // DB의 EXPORT_VALUE 필드
                        impDlr: item.IMPORT_VALUE || 0,                 // DB의 IMPORT_VALUE 필드
                        balPayments: (item.EXPORT_VALUE || 0) + (item.IMPORT_VALUE || 0),
                        // 누락된 필드들 추가
                        category: item.RANK_CATEGORY || '',             // DB의 RANK_CATEGORY 필드
                        period: item.RANK_PERIOD || '',                 // DB의 RANK_PERIOD 필드
                    };
                });
                
                return transformedData;
            } else {
                throw new Error(apiData.error || 'API 응답 실패');
            }
            
        } catch (error: any) {
            console.error('❌ 백엔드 API 호출 실패:', error.message);
            setApiStatus(`❌ API 호출 실패: ${error.message}`);
            return [];
        }
    };

    // 수정된 handleFilterChange - yearMonth 변경시 API 재호출
    const handleFilterChange = (key: string, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
        
        // yearMonth가 변경된 경우 데이터 다시 로드
        if (key === 'yearMonth') {
            const reloadData = async () => {
                setLoading(true);
                const apiData = await fetchDataFromBackend(value);
                setTradeData(apiData);
                setLoading(false);
            };
            reloadData();
        }
    };

    // 수정된 useEffect - 실제 API 데이터 로드
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                
                // ranking.json 로드 (선택사항)
                try {
                    const jsonResponse = await fetch('/ranking.json');
                    if (jsonResponse.ok) {
                        const data = await jsonResponse.json();
                        setEcoData(data);
                        console.log('✅ ranking.json 로드 성공');
                        console.log('🔍 ecoData 구조:', data);
                        console.log('🔍 categories 키:', Object.keys(data.categories || {}));
                        console.log('🔍 countries 개수:', data.countries?.length || 0);
                    }
                } catch (error) {
                    console.log('ranking.json 파일이 없습니다. 기본 설정으로 진행합니다.');
                    console.log('❌ ranking.json 로드 에러:', error);
                }
                
                // 실제 API 데이터 로드
                const apiData = await fetchDataFromBackend(filter.yearMonth);
                setTradeData(apiData);
                
            } catch (error: any) {
                console.error('❌ 데이터 로딩 실패:', error.message);
                setApiStatus(`❌ 초기화 실패: ${error.message}`);
                setTradeData([]);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const { sortedData, sortConfig, handleSort } = useSorting(tradeData, {
        field: "expDlr",
        order: "desc",
    });

    // 필터링된 데이터 (카테고리와 국가 필터 적용)
    const filteredData = useMemo(() => {
        let filtered = sortedData;
        
        // 디버깅: 필터링 과정 로그
        console.log('🔍 필터링 시작:', { 
            totalData: filtered.length, 
            categoryFilter: filter.category, 
            countryFilter: filter.country 
        });
        
        // 카테고리 필터 적용
        if (filter.category && filter.category !== "all") {
            const beforeCount = filtered.length;
            filtered = filtered.filter((item: any) => {
                // DB의 RANK_CATEGORY와 직접 비교
                const matches = item.category === filter.category;
                if (matches) {
                    console.log('✅ 카테고리 매칭:', item.statKor, 'category:', item.category);
                }
                return matches;
            });
            console.log(`📂 카테고리 필터 적용: ${beforeCount} → ${filtered.length}개`);
        }
        
        // 국가 필터 적용
        if (filter.country && filter.country !== "all") {
            const beforeCount = filtered.length;
            filtered = filtered.filter((item: any) => {
                // DB의 RANK_COUNTRY_CODE와 직접 비교하거나 ecoData에서 매칭
                const directMatch = item.statCd === filter.country;
                const ecoMatch = ecoData?.countries?.find((c: any) => c.name === item.statCdCntnKor1)?.code === filter.country;
                const matches = directMatch || ecoMatch;
                
                if (matches) {
                    console.log('✅ 국가 매칭:', item.statCdCntnKor1, 'code:', item.statCd);
                }
                return matches;
            });
            console.log(`🌍 국가 필터 적용: ${beforeCount} → ${filtered.length}개`);
        }
        
        console.log('🎯 최종 필터링 결과:', filtered.length, '개');
        return filtered;
    }, [sortedData, filter.category, filter.country, ecoData]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("ko-KR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount) + '$';
    };

    // 국가명 → 국기 이모지 매핑 함수
    const getCountryFlag = (country: string) => {
        const flags: Record<string, string> = {
            "미국": "🇺🇸", "중국": "🇨🇳", "일본": "🇯🇵", "베트남": "🇻🇳", "영국": "🇬🇧", "독일": "🇩🇪", "프랑스": "🇫🇷", "인도": "🇮🇳", "대만": "🇹🇼", "태국": "🇹🇭", "호주": "🇦🇺",
        };
        return flags[country] || "🌐";
    };

    // 로딩 상태 처리 제거 - 바로 렌더링
    // if (loading) {
    //     return (
    //         <div className="flex flex-col justify-center items-center h-96 space-y-4">
    //             <div className="text-lg">🔄 실제 API 데이터 로딩 중...</div>
    //             <div className="text-sm text-gray-600 text-center">{apiStatus}</div>
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-8 font-sans text-[15px]">
            {/* Page Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[#9AD970] p-2">
                        <Logo size={40} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">무역 순위 및 성과</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">실제 API 데이터를 기반으로 한 무역 성과 순위</p>
            </div>

            {/* API 상태 표시 - 로딩/성공 상태는 숨김, 에러만 표시 */}
            {apiStatus && apiStatus.includes('❌') && (
                <div className="p-3 rounded-lg text-center text-sm mb-4 bg-red-50 text-red-700 border border-red-200">
                    {apiStatus}
                </div>
            )}

            {/* 필터 영역 */}
            <div className="flex flex-wrap gap-4 mb-4">
                {/* 기준년월 */}
                <div>
                    <label className="block text-xs font-medium mb-1">기준년월</label>
                    <Select value={filter.yearMonth} onValueChange={v => handleFilterChange("yearMonth", v)}>
                        <SelectTrigger className="w-36 h-8">
                            <SelectValue placeholder="기준년월 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {yearMonthOptions.map((ym) => (
                                <SelectItem key={ym} value={ym}>{ym}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 국가 필터 */}
                <div>
                    <label className="block text-xs font-medium mb-1">국가</label>
                    <Select value={filter.country} onValueChange={v => handleFilterChange("country", v)}>
                        <SelectTrigger className="w-40 h-8">
                            <SelectValue placeholder="국가 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">🌐 전체 국가</SelectItem>
                            {ecoData?.countries ? (
                                ecoData.countries.map((country: any) => (
                                    <SelectItem key={country.code} value={country.code}>
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
                <div>
                    <label className="block text-xs font-medium mb-1">카테고리</label>
                    <Select value={filter.category} onValueChange={v => handleFilterChange("category", v)}>
                        <SelectTrigger className="w-40 h-8">
                            <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">🌐 전체</SelectItem>
                            {ecoData?.categories ? (
                                Object.keys(ecoData.categories).map((category) => (
                                    <SelectItem key={category} value={category}>
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

            {/* Main Rankings Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">무역 품목별 순위</CardTitle>
                    <CardDescription className="text-base text-gray-500">
                        실제 API 데이터 기반 수출액, 수입액, 총 무역액을 기준으로 한 품목별 순위 (단위: USD) - 총 {filteredData.length}개 항목
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20 text-base font-semibold">순위</TableHead>
                                    <TableHead className="text-base font-semibold">국가</TableHead>
                                    <TableHead className="text-base font-semibold">품목</TableHead>
                                    <TableHead className="text-base font-semibold">HS코드</TableHead>
                                    <SortableTableHeader
                                        field="expDlr"
                                        currentSortField={sortConfig.field}
                                        currentSortOrder={sortConfig.order}
                                        onSort={handleSort}
                                    >
                                        <span className="text-red-600 font-bold">수출액</span>
                                    </SortableTableHeader>
                                    <SortableTableHeader
                                        field="impDlr"
                                        currentSortField={sortConfig.field}
                                        currentSortOrder={sortConfig.order}
                                        onSort={handleSort}
                                    >
                                        <span className="text-green-600 font-bold">수입액</span>
                                    </SortableTableHeader>
                                    <SortableTableHeader
                                        field="balPayments"
                                        currentSortField={sortConfig.field}
                                        currentSortOrder={sortConfig.order}
                                        onSort={handleSort}
                                    >
                                        <span className="font-bold">총수출입액</span>
                                    </SortableTableHeader>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item, idx) => (
                                    <TableRow 
                                        key={`${item.hsCd || 'no-hs'}-${item.statCd || 'no-stat'}-${item.statKor || 'no-product'}-${idx}`} 
                                        className="hover:bg-muted/50 cursor-pointer text-[15px]" 
                                        onClick={() => navigate(`/graphs/${encodeURIComponent(item.statKor)}`)}
                                    >
                                        <TableCell className="font-semibold text-base">
                                            {idx < 3 ? (
                                                <span className="text-xl">
                                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                                </span>
                                            ) : (
                                                idx + 1
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold text-base">
                                            <span className="mr-2 text-xl">{getCountryFlag(item.statCdCntnKor1)}</span>
                                            {item.statCdCntnKor1}
                                        </TableCell>
                                        <TableCell className="font-medium text-base">{item.statKor}</TableCell>
                                        <TableCell className="font-mono text-base">{item.hsCd}</TableCell>
                                        <TableCell className="font-mono text-base font-bold text-red-600">{formatCurrency(item.expDlr)}</TableCell>
                                        <TableCell className="font-mono text-base font-bold text-green-600">{formatCurrency(item.impDlr)}</TableCell>
                                        <TableCell className="font-mono text-base font-semibold">{formatCurrency(item.expDlr+item.impDlr)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* 데이터 없을 때 표시 */}
                    {filteredData.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {tradeData.length === 0 ? (
                                <div>
                                    <div className="mb-2">
                                        📡 백엔드 API에서 데이터를 가져오는 중이거나 해당 기간에 데이터가 없습니다.
                                    </div>
                                    <div className="text-sm">
                                        백엔드 서버가 실행 중인지 확인해주세요: http://localhost:3001
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-2">
                                        🔍 선택한 필터 조건에 맞는 데이터가 없습니다.
                                    </div>
                                    <div className="text-sm">
                                        다른 카테고리나 국가를 선택해보세요.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 백엔드 연결 안내 */}
            {tradeData.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                        💡 백엔드 서버 실행 안내
                    </h4>
                    <p className="text-yellow-700 mb-2">
                        실제 API 데이터를 보려면 백엔드 서버를 실행해주세요:
                    </p>
                    <code className="block bg-gray-100 p-2 rounded text-gray-700">
                        npm install node-fetch<br/>
                        node server.js
                    </code>
                </div>
            )}
        </div>
    );
}