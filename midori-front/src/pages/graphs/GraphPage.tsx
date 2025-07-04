"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchTradeDataByHsCode } from "../../api/api";
import type { ApiTradeData } from "../../types/types";
import { 
    CountryMapSection, 
    ChartSection, 
    LoadingState, 
    ErrorState 
} from "../../components/graphs";

// --- 메인 컴포넌트 ---
export default function GraphsPage() {
    const { hsCode } = useParams<{ hsCode?: string }>();
    const [selectedChart, setSelectedChart] = useState("bar");
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
    const [selectedYear, setSelectedYear] = useState(years[0]);
    const [selectedCountry, setSelectedCountry] = useState("미국");
    const [apiTradeData, setApiTradeData] = useState<ApiTradeData[]>([]);
    const [prevYearData, setPrevYearData] = useState<ApiTradeData[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    // API 데이터 로드
    useEffect(() => {
        let ignore = false;

        const loadTradeData = async () => {
            if (!hsCode) {
                setApiError('URL에 HS 코드가 없습니다.');
                return;
            }
            
            setLoading(true);
            setApiError('');
            setApiTradeData([]);
            setPrevYearData([]);

            try {
                // 올해 데이터
                const data = await fetchTradeDataByHsCode(hsCode, selectedCountry, selectedYear);
                // 전년도 데이터
                const prevYear = (parseInt(selectedYear) - 1).toString();
                const prevData = await fetchTradeDataByHsCode(hsCode, selectedCountry, prevYear);
                if (!ignore) {
                    setApiTradeData(data);
                    setPrevYearData(prevData);
                    if (data.length === 0) {
                        setApiError('선택된 조건으로 조회된 데이터가 없습니다.');
                    }
                }
            } catch (error) {
                if (!ignore) {
                    setApiError('데이터를 불러오는 데 실패했습니다.');
                    setApiTradeData([]);
                    setPrevYearData([]);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadTradeData();
        return () => { ignore = true; };
    }, [hsCode, selectedCountry, selectedYear]);



    if (!hsCode) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg text-gray-500">조회할 HS 코드를 URL에 입력해 주세요.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 space-y-8 pt-0">
            {loading && <LoadingState />}
            
            {apiError && <ErrorState message={apiError} />}

            {/* 지역별 데이터 맵 */}
            <CountryMapSection
                selectedCountry={selectedCountry}
                onCountrySelect={setSelectedCountry}
            />

            {/* 그래프 섹션 */}
            <ChartSection
                selectedChart={selectedChart}
                setSelectedChart={setSelectedChart}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                years={years}
                apiTradeData={apiTradeData}
                prevYearData={prevYearData}
                hsCode={hsCode}
            />
        </div>
    );
}