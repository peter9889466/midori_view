import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { chartTypes, DEFAULT_COUNTRIES } from "../../data/constants";
import { useNavigate } from 'react-router-dom';

interface ChartControlsProps {
    selectedChart: string;
    setSelectedChart: (chart: string) => void;
    selectedProduct: string;
    setSelectedProduct: (product: string) => void;
    productOptions: { label: string; value: string }[];
    selectedCountry: string;
    setSelectedCountry: (country: string) => void;
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    years: string[];
}

export default function ChartControls({
    selectedChart,
    setSelectedChart,
    selectedProduct,
    setSelectedProduct,
    productOptions,
    selectedCountry,
    setSelectedCountry,
    selectedYear,
    setSelectedYear,
    years
}: ChartControlsProps) {
    const navigate = useNavigate();
    const handleProductChange = (productLabel: string) => {
        setSelectedProduct(productLabel);
        const hsCode = productOptions.find(option => option.label === productLabel)?.value;
        if (hsCode) {
            navigate(`/graphs/${hsCode}`);
        }
    };
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 w-full">
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
            <Select value={selectedProduct} onValueChange={handleProductChange}>
                <SelectTrigger className="h-10 w-60 bg-white border border-gray-200 rounded-lg">
                    <SelectValue placeholder="품목 선택" />
                </SelectTrigger>
                <SelectContent>
                    {productOptions.map((option) => (
                        <SelectItem key={option.value} value={option.label}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
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