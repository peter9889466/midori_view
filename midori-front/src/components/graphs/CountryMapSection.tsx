import { Map } from "lucide-react";
import CountryMap from "../map/CountryMap";
import { DEFAULT_COUNTRIES } from "../../data/constants";

interface CountryMapSectionProps {
    selectedCountry: string;
    onCountrySelect: (country: string) => void;
}

export default function CountryMapSection({
    selectedCountry,
    onCountrySelect
}: CountryMapSectionProps) {
    return (
        <div className="rounded-2xl bg-white flex flex-col items-start p-4 sm:p-6 shadow-md w-full">
            <div className="flex items-center mb-4">
                <Map className="h-7 w-7 text-[#9AD970] mr-3" />
                <span className="text-xl font-semibold text-gray-800">지역별 데이터 맵</span>
            </div>
            <div className="h-[500px] w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <CountryMap
                    allowedCountries={DEFAULT_COUNTRIES}
                    selectedCountryName={selectedCountry}
                    onCountrySelect={onCountrySelect}
                />
            </div>
        </div>
    );
} 