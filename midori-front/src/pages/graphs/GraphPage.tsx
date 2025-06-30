"use client";

import type React from "react";

import { useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    BarChart3,
    LineChart,
    Layers,
    Map,
} from "lucide-react";
import { countries } from "../../components/constants";
import { useParams } from "react-router-dom";

interface ChartType {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

const chartTypes: ChartType[] = [
    { id: "bar", name: "막대 차트", icon: BarChart3 },
    { id: "line", name: "선형 차트", icon: LineChart },
    { id: "combined", name: "혼합 차트", icon: Layers },
];

export default function GraphsPage() {
    const { product } = useParams<{ product?: string }>();
    const [selectedChart, setSelectedChart] = useState("bar");
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [selectedCountry, setSelectedCountry] = useState("");

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg text-gray-500">품목을 선택해 주세요.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 space-y-8">
            {/* 품목명 */}
            <h1 className="text-3xl font-bold text-left text-gray-900 mb-6">{product}</h1>

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

            {/* 그래프 영역 (차트 옵션 포함) - Card 제거, div로 대체 */}
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
                    <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <span className="text-gray-400">여기에 차트가 들어갑니다</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
