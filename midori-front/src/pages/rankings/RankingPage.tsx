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
    const [filter, setFilter] = useState({
        yearMonth: "",
        category: "",
        country: "",
    });
    const navigate = useNavigate();

    const getYearMonthOptions = () => {
        const options = [];
        const today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth(); // 0~11, 현재 월-1
        for (let i = 0; i < 12; i++) {
            if (month === 0) {
                year -= 1;
                month = 12;
            }
            const ym = `${year}.${month.toString().padStart(2, "0")}`;
            options.push(ym);
            month--;
        }
        return options;
    };
    const yearMonthOptions = getYearMonthOptions();

    const handleFilterChange = (key: string, value: string) => {
        setFilter((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        setTradeData(generateTradeData());
    }, []);

    const { sortedData, sortConfig, handleSort } = useSorting(tradeData, {
        field: "expDlr",
        order: "desc",
    });

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // 국가명 → 국기 이모지 매핑 함수
    const getCountryFlag = (country: string) => {
        const flags: Record<string, string> = {
            "미국": "🇺🇸", "중국": "🇨🇳", "일본": "🇯🇵", "베트남": "🇻🇳", "영국": "🇬🇧", "독일": "🇩🇪", "프랑스": "🇫🇷", "인도": "🇮🇳", "대만": "🇹🇼", "태국": "🇹🇭", "호주": "🇦🇺",
        };
        return flags[country] || "🌐";
    };

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
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">품목별 수출입 데이터를 기반으로 한 무역 성과 순위</p>
            </div>
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
                    <CardDescription className="text-base text-gray-500">수출액, 수입액, 총 무역액을 기준으로 한 품목별 순위 (단위: USD)</CardDescription>
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
                                    <TableRow key={item.hsCd + item.statCd} className="hover:bg-muted/50 cursor-pointer text-[15px]" onClick={() => navigate(`/graphs/${encodeURIComponent(item.statKor)}`)}>
                                        <TableCell className="font-semibold text-base">{idx + 1}</TableCell>
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
                </CardContent>
            </Card>
        </div>
    );
}
