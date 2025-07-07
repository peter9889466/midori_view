import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { SortField, TradeData } from "../../types/rankings";

interface RankingTableProps {
    filteredData: TradeData[];
    sortConfig: any;
    handleSort: (field: SortField) => void;
    formatCurrency: (amount: number) => string;
    getCountryFlag: (country: string) => string;
    navigate: (url: string) => void;
    tradeDataLength: number;
}

const RankingTable: React.FC<RankingTableProps> = ({
    filteredData,
    sortConfig,
    handleSort,
    formatCurrency,
    getCountryFlag,
    navigate,
    tradeDataLength
}) => {
    return (
        <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#9AD970] to-[#7BC142] text-white p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold mb-2">무역 품목별 순위</CardTitle>
                        <CardDescription className="text-green-100 text-base">
                            글로벌 무역 성과 분석 대시보드 (단위: USD)
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
                                    onClick={() => navigate(`/graphs/${item.hsCd}`)}
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

                {/* 데이터 없을 때 메시지 */}
                {filteredData.length === 0 && (
                    <div className="text-center py-16">
                        {tradeDataLength === 0 ? (
                            <div className="space-y-4">
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
    );
};

export default RankingTable;