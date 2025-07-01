// src/components/map/CountryMap.tsx

import { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

// 타입 임포트
import type { Layer } from 'leaflet';
import type { Feature, FeatureCollection } from 'geojson';

type SelectedCountry = Feature | null;

const CountryMap = () => {
    const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<SelectedCountry>(null);

    // ---  디버깅 1: 선택된 국가가 바뀔 때마다 로그 출력 ---
    useEffect(() => {
        console.log("✅ [상태 변경] 선택된 국가:", selectedCountry?.properties?.admin || "없음");
    }, [selectedCountry]);

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
            })
            .catch((err) => console.error("❌ 2. GeoJSON 데이터 로딩 실패! 원인:", err));
    }, []);

    const defaultStyle = {
        fillColor: "#e9ecef",
        weight: 1,
        color: "#adb5bd",
        fillOpacity: 0.7,
    };

    const highlightStyle = {
        fillColor: '#9AD970',
        weight: 2,
        color: '#9AD970',
        fillOpacity: 0.9,
    };

    const onEachFeature = (feature: Feature, layer: Layer) => {
        layer.on({
            click: (event) => {
                // --- 디버깅 2: 국가가 '클릭'되었는지 확인 ---
                L.DomEvent.stopPropagation(event); // 이벤트 버블링 중단
                console.log(`✅ 3. [클릭 이벤트 발생!] 국가: ${feature.properties?.admin}`);
                setSelectedCountry((prev: SelectedCountry) =>
                    prev?.properties?.admin === feature.properties?.admin ? null : feature
                );
            },
        });
    };

    const getFeatureStyle = (feature?: Feature) => {
        if (
            selectedCountry &&
            selectedCountry.properties &&
            feature?.properties?.admin === selectedCountry.properties.admin
        ) {
            return highlightStyle;
        }
        return defaultStyle;
    };

    return (
        <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
            {geoData && (
                <GeoJSON
                    key={JSON.stringify(selectedCountry)} // 선택이 바뀔 때마다 GeoJSON 컴포넌트를 강제로 다시 렌더링
                    data={geoData}
                    style={getFeatureStyle}
                    onEachFeature={onEachFeature}
                />
            )}
        </MapContainer>
    );
};

export default CountryMap;