import { useRef } from 'react';
import MixedChart from '../../chart/MixedChart';
import BarChart from '../../chart/BarChart';
import LineChart from '../../chart/LineChart';
import { chartOptions, mixedChartOptions } from "../../data/constants";
import { generateBarData, generateLineData, generateMixedData } from "../../lib/graphs/utils";
import type { ApiTradeData } from "../../types/types";
import ChartControls from "./ChartControls";
import DataSummary from "./DataSummary";

interface ChartSectionProps {
    selectedChart: string;
    setSelectedChart: (chart: string) => void;
    selectedCountry: string;
    setSelectedCountry: (country: string) => void;
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    years: string[];
    apiTradeData: ApiTradeData[];
    hsCode: string;
}

export default function ChartSection({
    selectedChart,
    setSelectedChart,
    selectedCountry,
    setSelectedCountry,
    selectedYear,
    setSelectedYear,
    years,
    apiTradeData,
    hsCode
}: ChartSectionProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    
    const apiExportTotal = apiTradeData.reduce((sum, item) => sum + item.exportValue, 0);
    const apiImportTotal = apiTradeData.reduce((sum, item) => sum + item.importValue, 0);
    const totalTradeAmount = apiExportTotal + apiImportTotal;

    const currentYearNum = parseInt(selectedYear);
    const now = new Date();
    const isCurrentYear = currentYearNum === now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const dataLength = isCurrentYear ? currentMonth : 12;

    return (
        <div className="rounded-2xl bg-white w-full">
            <div className="pt-6 pb-2 px-6">
                <div className="text-base font-semibold mb-4">그래프</div>
                
                <ChartControls
                    selectedChart={selectedChart}
                    setSelectedChart={setSelectedChart}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    years={years}
                />

                <div className="flex items-start gap-6">
                    <DataSummary
                        hsCode={hsCode}
                        apiExportTotal={apiExportTotal}
                        apiImportTotal={apiImportTotal}
                        totalTradeAmount={totalTradeAmount}
                        dataLength={dataLength}
                        selectedYear={selectedYear}
                        selectedCountry={selectedCountry}  // 추가
                        apiTradeData={apiTradeData}        // 추가
                        chartRef={chartRef}                // 차트 참조 전달
                        selectedChart={selectedChart}      // 차트 타입 전달
                    />
                    
                    <div className="w-3/4 min-w-0 flex-1">
                        <div ref={chartRef} className="relative w-full h-[400px]">
                            {selectedChart === "bar" && (
                                <BarChart
                                    className="absolute inset-0 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                                    data={generateBarData(apiTradeData, selectedYear)}
                                    options={chartOptions}
                                />
                            )}
                            {selectedChart === "line" && (
                                <LineChart
                                    className="absolute inset-0 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                                    data={generateLineData(apiTradeData, selectedYear)}
                                    options={chartOptions}
                                />
                            )}
                            {selectedChart === "combined" && (
                                <MixedChart 
                                    className="absolute inset-0 w-full h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
                                    data={generateMixedData(apiTradeData, selectedYear)}
                                    options={mixedChartOptions}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}