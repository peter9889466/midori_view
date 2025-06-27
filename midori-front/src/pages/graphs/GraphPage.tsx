"use client";

import type React from "react";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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
    RotateCcw,
    Search,
    Map,
} from "lucide-react";
import Logo from "../../components/logo";

interface ChartType {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface FilterState {
    country: string;
    product: string;
    year: string;
}

export default function GraphsPage() {
    const [selectedChart, setSelectedChart] = useState<string>("");
    const [filters, setFilters] = useState<FilterState>({
        country: "",
        product: "",
        year: "",
    });

    const chartTypes: ChartType[] = [
        { id: "bar", name: "막대 차트", icon: BarChart3 },
        { id: "line", name: "선형 차트", icon: LineChart },
        { id: "combined", name: "혼합 차트", icon: Layers },
    ];

    const countries = [
        "미국",
        "중국",
        "일본",
        "베트남",
        "영국",
        "독일",
        "프랑스",
        "인도",
        "대만",
        "태국",
        "호주",
    ];

    const products = [
        "태양광 패널",
        "풍력 터빈용 발전기",
        "전력 변환장치 (인버터)",
        "태양열 집열기",
        "전기자동차",
        "전기 이륜차",
        "전기차용 리튬이온 배터리",
        "실리콘 식기/빨대",
        "금속 빨대",
        "종이 빨대",
        "포장재",
        "천연 성분 세제",
        "천연 고무 라텍스",
        "유기농 면화",
        "천연 비료",
        "슬래그 울",
        "단열재",
    ];

    // Generate years from 2000 to current year
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) =>
        (2000 + i).toString()
    );

    const handleChartSelect = (chartId: string) => {
        setSelectedChart(chartId);
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        console.log("검색 실행:", { selectedChart, filters });
        // Here you would implement the actual search/filter logic
    };

    const handleReset = () => {
        setSelectedChart("");
        setFilters({ country: "", product: "", year: "" });
    };

    return (
        <div className="flex flex-col space-y-5">
            {/* Page Header */}
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-[#9AD970] p-2">
                        <Logo size={40} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    데이터 시각화
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    대화형 차트와 그래프를 통해 데이터를 탐색하세요
                </p>
            </div>

            {/* 1. Regional Data Map (지역별 데이터 맵) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Map className="h-6 w-6 text-[#9AD970]" />
                        지역별 데이터 맵
                    </CardTitle>
                    <CardDescription>
                        선택된 조건에 따른 지역별 데이터 시각화
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 lg:h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <Map className="h-16 w-16 text-gray-400 mx-auto" />
                            <div>
                                <p className="text-gray-600 font-medium">
                                    지도 컴포넌트가 여기에 표시됩니다
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    조건을 선택하고 검색 버튼을 클릭하세요
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Data Filtering (데이터 필터링) - Reduced Height */}
            <Card className="bg-gray-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">데이터 필터링</CardTitle>
                    <CardDescription className="text-sm">
                        조건을 선택하여 데이터를 필터링하세요
                    </CardDescription>
                </CardHeader>
                <CardContent className="py-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Country Selection */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">
                                나라 선택
                            </label>
                            <Select
                                value={filters.country}
                                onValueChange={(value) =>
                                    handleFilterChange("country", value)
                                }
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="나라를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem
                                            key={country}
                                            value={country}
                                        >
                                            {country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Item Selection */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">
                                품목 선택
                            </label>
                            <Select
                                value={filters.product}
                                onValueChange={(value) =>
                                    handleFilterChange("product", value)
                                }
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="품목을 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem
                                            key={product}
                                            value={product}
                                        >
                                            {product}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Year Selection */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-700">
                                년도 선택
                            </label>
                            <Select
                                value={filters.year}
                                onValueChange={(value) =>
                                    handleFilterChange("year", value)
                                }
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="년도를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.reverse().map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}년
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Search and Reset Buttons */}
                    <div className="mt-3 flex flex-col sm:flex-row gap-3">
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSearch}
                                className="h-8 bg-[#9AD970] hover:bg-[#8BC766] text-white text-sm px-6"
                                disabled={
                                    !filters.country ||
                                    !filters.product ||
                                    !filters.year
                                }
                            >
                                <Search className="h-3 w-3 mr-2" />
                                검색
                            </Button>
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                className="h-8 text-sm px-6 border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                            >
                                <RotateCcw className="h-3 w-3 mr-2" />
                                초기화
                            </Button>
                        </div>

                        {/* Selected Filters Display */}
                        {(filters.country ||
                            filters.product ||
                            filters.year ||
                            selectedChart) && (
                            <div className="flex-1 p-2 bg-white rounded-lg border text-xs">
                                <span className="font-medium text-gray-700">
                                    선택된 조건:{" "}
                                </span>
                                <span className="text-gray-600">
                                    {selectedChart &&
                                        `${
                                            chartTypes.find(
                                                (c) => c.id === selectedChart
                                            )?.name
                                        } | `}
                                    {filters.country && `${filters.country} | `}
                                    {filters.product && `${filters.product} | `}
                                    {filters.year && `${filters.year}년`}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Chart Type Selection (차트 종류 선택) - Reduced Height */}
            <Card className="bg-gray-50/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">차트 종류 선택</CardTitle>
                    <CardDescription className="text-sm">
                        원하는 차트 유형을 선택하세요
                    </CardDescription>
                </CardHeader>
                <CardContent className="py-3">
                    <div className="grid grid-cols-3 gap-2">
                        {chartTypes.map((chart) => {
                            const IconComponent = chart.icon;
                            const isSelected = selectedChart === chart.id;

                            return (
                                <Card
                                    key={chart.id}
                                    className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? "ring-2 ring-[#9AD970] bg-[#9AD970]/5"
                                            : ""
                                    }`}
                                    onClick={() => handleChartSelect(chart.id)}
                                >
                                    <CardHeader className="pb-1 pt-2 px-3">
                                        <div className="flex items-center justify-center">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#9AD970] text-white">
                                                <IconComponent className="h-3 w-3" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-center text-xs leading-tight">
                                            {chart.name}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 4. Chart Display Area (차트 표시 영역) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">차트 표시 영역</CardTitle>
                    <CardDescription>
                        선택된 조건에 따른 데이터 차트
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[500px] lg:h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            {selectedChart ? (
                                <>
                                    {(() => {
                                        const selectedChartType =
                                            chartTypes.find(
                                                (c) => c.id === selectedChart
                                            );
                                        const IconComponent =
                                            selectedChartType?.icon ||
                                            BarChart3;
                                        return (
                                            <IconComponent className="h-20 w-20 text-[#9AD970] mx-auto" />
                                        );
                                    })()}
                                    <div>
                                        <p className="text-lg text-gray-600 font-medium">
                                            {
                                                chartTypes.find(
                                                    (c) =>
                                                        c.id === selectedChart
                                                )?.name
                                            }{" "}
                                            시각화가 여기에 표시됩니다
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Chart.js 또는 다른 차트 라이브러리가
                                            여기에 통합됩니다
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <BarChart3 className="h-20 w-20 text-gray-400 mx-auto" />
                                    <div>
                                        <p className="text-lg text-gray-600 font-medium">
                                            차트 유형을 선택하고 조건을
                                            설정하세요
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            위에서 차트 종류와 필터 조건을
                                            선택해주세요
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
