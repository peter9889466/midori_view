import { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { Layer } from 'leaflet';
import type { Feature, FeatureCollection } from 'geojson';

type SelectedCountry = Feature | null;

interface CountryMapProps {
    allowedCountries?: string[];
    selectedCountryName?: string;
    onCountrySelect?: (countryName: string) => void;
}

const CountryMap = ({ allowedCountries, selectedCountryName, onCountrySelect }: CountryMapProps) => {
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<SelectedCountry>(null);

    // 외부에서 선택된 국가명 변경 시 내부 상태도 동기화
    useEffect(() => {
        if (!geoData || !selectedCountryName) return;
        const found = geoData.features.find(f => f.properties?.name_ko === selectedCountryName);
        if (found && (!selectedCountry || selectedCountry.properties?.name_ko !== selectedCountryName)) {
            setSelectedCountry(found);
        }
        if (!selectedCountryName) {
            setSelectedCountry(null);
        }
    }, [selectedCountryName, geoData]);

    useEffect(() => {
        fetch('/countries.geo.json')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP 에러! 상태: ${res.status}`);
                }
                return res.json();
            })
            .then((data: FeatureCollection) => {
                setGeoData(data);
            })
            .catch((err) => console.error(err));
    }, []);

    const defaultStyle = {
        fillColor: "#e9ecef",
        weight: 1,
        color: "#adb5bd",
        fillOpacity: 0.7,
    };

    const allowedStyle = {
        fillColor: '#9AD970',
        weight: 1.5,
        color: '#6AAE4A',
        fillOpacity: 0.7,
    };

    const highlightStyle = {
        fillColor: '#EF4444',
        weight: 2,
        color: '#EF4444',
        fillOpacity: 0.9,
    };

    const isAllowedCountry = (feature: Feature) => {
        if (!allowedCountries) return false;
        const nameKo = feature?.properties?.name_ko;
        return allowedCountries.includes(nameKo);
    };

    const onEachFeature = (feature: Feature, layer: Layer) => {
        layer.on({
            click: (event) => {
                L.DomEvent.stopPropagation(event);
                const nameKo = feature.properties?.name_ko;
                
                if (allowedCountries && !allowedCountries.includes(nameKo)) {
                    return;
                }
                
                setSelectedCountry((prev: SelectedCountry) =>
                    prev?.properties?.name_ko === nameKo ? null : feature
                );
                
                if (onCountrySelect) {
                    onCountrySelect(nameKo);
                }
            },
        });
    };

    const getFeatureStyle = (feature?: Feature) => {
        const nameKo = feature?.properties?.name_ko;
        
        if (
            selectedCountry &&
            selectedCountry.properties &&
            nameKo === selectedCountry.properties.name_ko
        ) {
            return highlightStyle;
        }
        
        if (allowedCountries && feature && isAllowedCountry(feature)) {
            return allowedStyle;
        }
        
        return defaultStyle;
    };

    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxBounds={[[-85, -180], [85, 180]]}
            maxBoundsViscosity={1.0}
            className="w-full h-[400px]"
            style={{ height: '400px', width: '100%', zIndex: 0 }}
        >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
            {geoData && (
                <GeoJSON
                    key={JSON.stringify(selectedCountry)}
                    data={geoData}
                    style={getFeatureStyle}
                    onEachFeature={onEachFeature}
                />
            )}
        </MapContainer>
    );
};

export default CountryMap;