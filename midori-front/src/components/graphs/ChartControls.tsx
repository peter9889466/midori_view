import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { chartTypes, DEFAULT_COUNTRIES } from "../../data/constants";

interface ChartControlsProps {
    selectedChart: string;
    setSelectedChart: (chart: string) => void;
    selectedCountry: string;
    setSelectedCountry: (country: string) => void;
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    years: string[];
}

export default function ChartControls({
    selectedChart,
    setSelectedChart,
    selectedCountry,
    setSelectedCountry,
    selectedYear,
    setSelectedYear,
    years
}: ChartControlsProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex gap-2">
                {chartTypes.map((type) => {
                    const Icon = type.icon;
                    const selected = selectedChart === type.id;
                    return (
                        <button
                            key={type.id}
                            onClick={() => setSelectedChart(type.id)}
                            className={`flex items-center justify-center px-3 py-2 rounded-lg border transition
                                ${selected 
                                    ? "bg-[#9AD970] text-white border-[#9AD970] shadow" 
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-[#eafbe0]"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                        </button>
                    );
                })}
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="h-10 w-40 bg-white border border-gray-200 rounded-lg">
                    <SelectValue placeholder="나라 선택" />
                </SelectTrigger>
                <SelectContent>
                    {DEFAULT_COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
    );
} 