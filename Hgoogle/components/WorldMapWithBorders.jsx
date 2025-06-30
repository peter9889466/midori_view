import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WorldMapWithBorders = () => {
  const [geoData, setGeoData] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);

  // GeoJSON 불러오기
  useEffect(() => {
    fetch('/countries.geo.json') // public 폴더에 저장되어 있어야 함
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  // 각 국가마다 이벤트 등록
  const onEachCountry = (feature, layer) => {
    layer.on({
      click: () => {
        setActiveCountry(feature.properties.ADMIN); // 국가 이름 저장
        layer.setStyle(highlightStyle); // 클릭된 국가 스타일 적용
      },
    });
  };

  // 기본 스타일
  const defaultStyle = {
    fillColor: "#ccc",
    weight: 1,
    color: "black",
    fillOpacity: 0.5,
  };

  // 클릭된 국가 스타일
  const highlightStyle = {
    fillColor: "#ff7800",
    weight: 2,
    color: "#ff0000",
    fillOpacity: 0.7,
  };

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {geoData && (
        <GeoJSON
          data={geoData}
          style={(feature) =>
            activeCountry === feature.properties.ADMIN ? highlightStyle : defaultStyle
          }
          onEachFeature={onEachCountry}
        />
      )}
    </MapContainer>
  );
};

export default WorldMapWithBorders;
