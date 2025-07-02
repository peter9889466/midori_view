"use client";

import { useState, useEffect } from "react";
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
import { generateTradeData } from "../../data/tradeData";
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
        category: "",
        country: "",
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
                setApiStatus(`✅ ${yearMonth} 데이터 수신 완료 (${apiData.count}개 항목)`);
                
                // 백엔드 데이터를 기존 형식으로 변환
                const transformedData = (apiData.data || []).map((item: any) => ({
                    hsCd: item.HS_CODE || '',
                    statCd: item.RANK_COUNTRY_CODE || '',
                    statKor: item.RANK_PRODUCT || '',
                    statCdCntnKor1: item.RANK_COUNTRY || '',
                    expDlr: item.EXPORT_VALUE || 0,
                    impDlr: item.IMPORT_VALUE || 0,
                    balPayments: (item.EXPORT_VALUE || 0) + (item.IMPORT_VALUE || 0),
                }));
                
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
                    }
                } catch (error) {
                    console.log('ranking.json 파일이 없습니다. 기본 설정으로 진행합니다.');
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

    // 로딩 상태 처리
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <div className="text-lg">🔄 실제 API 데이터 로딩 중...</div>
                <div className="text-sm text-gray-600 text-center">{apiStatus}</div>
            </div>
        );
    }

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

            {/* API 상태 표시 */}
            {apiStatus && (
                <div className={`p-3 rounded-lg text-center text-sm mb-4 ${
                    apiStatus.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                    apiStatus.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
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
            </div>

            {/* Main Rankings Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">무역 품목별 순위</CardTitle>
                    <CardDescription className="text-base text-gray-500">
                        실제 API 데이터 기반 수출액, 수입액, 총 무역액을 기준으로 한 품목별 순위 (단위: USD)
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
                                {sortedData.map((item, idx) => (
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
                    {sortedData.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <div className="mb-2">
                                📡 백엔드 API에서 데이터를 가져오는 중이거나 해당 기간에 데이터가 없습니다.
                            </div>
                            <div className="text-sm">
                                백엔드 서버가 실행 중인지 확인해주세요: http://localhost:3001
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 백엔드 연결 안내 */}
            {sortedData.length === 0 && (
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