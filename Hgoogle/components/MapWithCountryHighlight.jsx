import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapWithCountryHighlight = () => {
  const [geoData, setGeoData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    fetch('/countries.geo.json')
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  const onEachFeature = (feature, layer) => {
    const countryName = feature.properties.ADMIN;
    layer.bindTooltip(countryName);

    layer.on('click', () => {
      setSelectedFeature((prev) =>
        prev?.properties.ADMIN === feature.properties.ADMIN ? null : feature
      );
    });
  };

  const highlightStyle = {
    fillColor: '#ff7800',
    weight: 2,
    color: '#ff0000',
    fillOpacity: 0.7,
  };

  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* 클릭용 경계선 (투명) */}
      {geoData && (
        <GeoJSON
          data={geoData}
          style={{ fillOpacity: 0 }} // 경계선은 보이지 않지만 클릭 가능
          onEachFeature={onEachFeature}
        />
      )}

      {/* 선택된 나라만 강조 */}
      {selectedFeature && (
        <GeoJSON data={selectedFeature} style={highlightStyle} />
      )}
    </MapContainer>
  );
};

export default MapWithCountryHighlight;
