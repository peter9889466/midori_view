import React from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";

interface ChartType {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface CardGridProps {
    chartTypes: ChartType[];
    selectedChart: string;
    onChartSelect: (chartId: string) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ chartTypes, selectedChart, onChartSelect }) => {
    return (
        <div className="grid grid-cols-3 gap-2">
            {chartTypes.map((chart) => {
                const IconComponent = chart.icon;
                const isSelected = selectedChart === chart.id;
                return (
                    <Card
                        key={chart.id}
                        className={`border-0 transition-all duration-200 cursor-pointer ${
                            isSelected
                                ? "shadow-[4px_4px_0px_0px_rgba(154,217,112,0.4)] hover:shadow-[5px_5px_0px_0px_rgba(154,217,112,0.6)] bg-[#9AD970]/5"
                                : "shadow-[2px_2px_0px_0px_rgba(154,217,112,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(154,217,112,0.4)]"
                        }`}
                        onClick={() => onChartSelect(chart.id)}
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
    );
};

export default CardGrid; 