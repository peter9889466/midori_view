"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { SortableTableHeader } from "../../components/sortable-table-header";
import { Trophy, Star, TrendingUp, TrendingDown } from "lucide-react";
import Logo from "../../components/logo";
import { generateTradeData } from "../../data/tradeData";
import { useSorting } from "../../hooks/useSorting";
import type { TradeData } from "../../types/rankings";

export default function RankingsPage() {
    const [tradeData, setTradeData] = useState<TradeData[]>([]);

    useEffect(() => {
        setTradeData(generateTradeData());
    }, []);

    const { sortedData, sortConfig, handleSort } = useSorting(tradeData, {
        field: "exportAmount",
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

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[#9AD970] p-2">
                        <Logo size={40} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    무역 순위 및 성과
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    품목별 수출입 데이터를 기반으로 한 무역 성과 순위
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            수출 상위
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            수입 상위
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Trophy className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            총 무역량
                        </CardTitle>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                <Star className="h-6 w-6" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-sm">
                            성과 분석
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Main Rankings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>무역 품목별 순위</CardTitle>
                    <CardDescription>
                        수출액, 수입액, 총 무역액을 기준으로 한 품목별 순위
                        (단위: USD)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">순위</TableHead>
                                    <TableHead>품목</TableHead>
                                    <SortableTableHeader
                                        field="exportAmount"
                                        currentSortField={sortConfig.field}
                                        currentSortOrder={sortConfig.order}
                                        onSort={handleSort}
                                    >
                                        수출액
                                    </SortableTableHeader>
                                    <SortableTableHeader
                                        field="importAmount"
                                        currentSortField={sortConfig.field}
                                        currentSortOrder={sortConfig.order}
                                        onSort={handleSort}
                                    >
                                        수입액
                                    </SortableTableHeader>
                                    <SortableTableHeader
                                        field="totalTradeAmount"
                                        currentSortField={sortConfig.field}
                                        currentSortOrder={sortConfig.order}
                                        onSort={handleSort}
                                    >
                                        총 무역액
                                    </SortableTableHeader>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedData.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <TableCell className="min-w-8 justify-center">
                                                    {item.rank}
                                                </TableCell>
                                                {item.rank}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {item.item}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(item.exportAmount)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatCurrency(item.importAmount)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold">
                                            {formatCurrency(
                                                item.totalTradeAmount
                                            )}
                                        </TableCell>
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
