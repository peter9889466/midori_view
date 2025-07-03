// src/components/map/CountryMap.tsx

import { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

// 타입 임포트
import type { Layer } from 'leaflet';
import type { Feature, FeatureCollection } from 'geojson';
import { countries as allowedCountryList } from "../../data/tradeData";

type SelectedCountry = Feature | null;

interface CountryMapProps {
    allowedCountries?: string[];
    selectedCountryName?: string;
    onCountrySelect?: (countryName: string) => void;
}

const CountryMap = ({ allowedCountries, selectedCountryName, onCountrySelect }: CountryMapProps) => {
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<SelectedCountry>(null);

    // ---  디버깅 1: 선택된 국가가 바뀔 때마다 로그 출력 ---
    useEffect(() => {
        console.log("✅ [상태 변경] 선택된 국가:", selectedCountry?.properties?.name_ko || "없음");
    }, [selectedCountry]);

    // 외부에서 선택된 국가명 변경 시 내부 상태도 동기화 (name_ko 기준)
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
        console.log("... 1. GeoJSON 데이터 로딩 시도 ...");
        fetch('/countries.geo.json')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP 에러! 상태: ${res.status}`);
                }
                return res.json();
            })
            .then((data: FeatureCollection) => {
                console.log("✅ 2. GeoJSON 데이터 로딩 성공!", data);
                setGeoData(data);
                // 1. GeoJSON의 모든 국가명(admin) 리스트 출력
                const geoAdminList = data.features.map(f => f.properties?.admin);
                console.log('[GeoJSON 국가명(admin) 전체]', geoAdminList);
                // 2. constants.countries와 매칭 안 되는 국가명 출력
                if (allowedCountryList) {
                    const notMatched = allowedCountryList.filter(c => !geoAdminList.includes(c));
                    console.log('[매칭 안 되는 국가명]', notMatched);
                }
                // 3. 매핑 테이블 예시(실제 프로젝트에서는 수동으로 보정 필요)
                // const countryNameMap = { "미국": "United States of America", ... };
            })
            .catch((err) => console.error("❌ 2. GeoJSON 데이터 로딩 실패! 원인:", err));
    }, []);

    const defaultStyle = {
        fillColor: "#e9ecef",
        weight: 1,
        color: "#adb5bd",
        fillOpacity: 0.7,
    };

    // 클릭 가능한 국가(allowedCountries)는 메인색, 클릭 시 빨간색
    const allowedStyle = {
        fillColor: '#9AD970',
        weight: 1.5,
        color: '#6AAE4A',
        fillOpacity: 0.7,
    };
    const highlightStyle = {
        fillColor: '#EF4444', // 빨간색
        weight: 2,
        color: '#EF4444',
        fillOpacity: 0.9,
    };

    // 4. 매핑 테이블 적용 (예시)
    // 실제로는 콘솔에서 매칭 안 되는 국가명을 확인 후 아래 객체를 완성해야 함
    // const countryNameMap: Record<string, string> = {
        // 예시: "미국": "United States of America",
        // "영국": "United Kingdom",
        // ...
    // };
    

    // 국가명 매칭 함수: feature의 name_ko(한글)와 allowedCountries(한글) 비교
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
                // allowedCountries가 있으면 name_ko(한글)로만 매칭
                if (allowedCountries && !allowedCountries.includes(nameKo)) {
                    return;
                }
                // 클릭 시 좌표 콘솔 출력
                let center = [0, 0];
                try {
                    const geoLayer = L.geoJSON(feature);
                    const bounds = geoLayer.getBounds();
                    center = [bounds.getCenter().lat, bounds.getCenter().lng];
                } catch (e) { }
                console.log(`[국가 클릭]`, nameKo, '좌표:', center);
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
        // 클릭된 국가(선택됨)
        if (
            selectedCountry &&
            selectedCountry.properties &&
            nameKo === selectedCountry.properties.name_ko
        ) {
            return highlightStyle;
        }
        // 클릭 가능 국가(allowedCountries)
        if (allowedCountries && feature && isAllowedCountry(feature)) {
            return allowedStyle;
        }
        // 나머지(비활성)
        return defaultStyle;
    };

    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxBounds={[[-85, -180], [85, 180]]}
            maxBoundsViscosity={1.0}
            className="w-full h-full"
            style={{ height: '100%', width: '100%' }}
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