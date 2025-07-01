import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// CSS 스타일 추가
const mapStyles = `
  .leaflet-container .leaflet-interactive:focus {
    outline: none !important;
  }
  .leaflet-container path {
    outline: none !important;
  }
  .leaflet-container path:focus {
    outline: none !important;
  }
  .leaflet-overlay-pane svg {
    z-index: 1000 !important;
    pointer-events: none !important;
  }
  .leaflet-tooltip-pane {
    z-index: 2000 !important;
  }
  .leaflet-tooltip {
    z-index: 2000 !important;
  }
`;

// 주요 국가들의 수도 좌표 데이터
const capitalCoordinates = {
  // 아시아
  '대한민국': [37.5665, 126.9780],
  'South Korea': [37.5665, 126.9780],
  '한국': [37.5665, 126.9780],
  '일본': [35.6762, 139.6503], // 도쿄
  'Japan': [35.6762, 139.6503],
  '중국': [39.9042, 116.4074], // 베이징
  'China': [39.9042, 116.4074],
  '북한': [39.0392, 125.7625], // 평양
  'North Korea': [39.0392, 125.7625],
  '러시아': [55.7558, 37.6176], // 모스크바
  'Russia': [55.7558, 37.6176],
  '인도': [28.6139, 77.2090], // 뉴델리
  'India': [28.6139, 77.2090],
  '태국': [13.7563, 100.5018], // 방콕
  'Thailand': [13.7563, 100.5018],
  '베트남': [21.0285, 105.8542], // 하노이
  'Vietnam': [21.0285, 105.8542],
  '싱가포르': [1.3521, 103.8198],
  'Singapore': [1.3521, 103.8198],
  '말레이시아': [3.1390, 101.6869], // 쿠알라룸푸르
  'Malaysia': [3.1390, 101.6869],
  '인도네시아': [-6.2088, 106.8456], // 자카르타
  'Indonesia': [-6.2088, 106.8456],
  '필리핀': [14.5995, 120.9842], // 마닐라
  'Philippines': [14.5995, 120.9842],
  '파키스탄': [33.6844, 73.0479], // 이슬라마바드
  'Pakistan': [33.6844, 73.0479],
  '방글라데시': [23.8103, 90.4125], // 다카
  'Bangladesh': [23.8103, 90.4125],
  '미얀마': [19.7633, 96.0785], // 네피도
  'Myanmar': [19.7633, 96.0785],
  '스리랑카': [6.9271, 79.8612], // 콜롬보
  'Sri Lanka': [6.9271, 79.8612],
  '몽골': [47.8864, 106.9057], // 울란바토르
  'Mongolia': [47.8864, 106.9057],
  '카자흐스탄': [51.1694, 71.4491], // 누르술탄
  'Kazakhstan': [51.1694, 71.4491],
  '우즈베키스탄': [41.2995, 69.2401], // 타슈켄트
  'Uzbekistan': [41.2995, 69.2401],
  '아프가니스탄': [34.5553, 69.2075], // 카불
  'Afghanistan': [34.5553, 69.2075],
  '이란': [35.6892, 51.3890], // 테헤란
  'Iran': [35.6892, 51.3890],
  '이라크': [33.3128, 44.3615], // 바그다드
  'Iraq': [33.3128, 44.3615],
  '사우디아라비아': [24.7136, 46.6753], // 리야드
  'Saudi Arabia': [24.7136, 46.6753],
  '터키': [39.9334, 32.8597], // 앙카라
  'Turkey': [39.9334, 32.8597],
  '이스라엘': [31.7683, 35.2137], // 예루살렘
  'Israel': [31.7683, 35.2137],
  '아랍에미리트': [24.4539, 54.3773], // 아부다비
  'United Arab Emirates': [24.4539, 54.3773],
  
  // 유럽
  '독일': [52.5200, 13.4050], // 베를린
  'Germany': [52.5200, 13.4050],
  '프랑스': [48.8566, 2.3522], // 파리
  'France': [48.8566, 2.3522],
  '영국': [51.5074, -0.1278], // 런던
  'United Kingdom': [51.5074, -0.1278],
  '이탈리아': [41.9028, 12.4964], // 로마
  'Italy': [41.9028, 12.4964],
  '스페인': [40.4168, -3.7038], // 마드리드
  'Spain': [40.4168, -3.7038],
  '네덜란드': [52.3676, 4.9041], // 암스테르담
  'Netherlands': [52.3676, 4.9041],
  '벨기에': [50.8503, 4.3517], // 브뤼셀
  'Belgium': [50.8503, 4.3517],
  '스위스': [46.9481, 7.4474], // 베른
  'Switzerland': [46.9481, 7.4474],
  '오스트리아': [48.2082, 16.3738], // 비엔나
  'Austria': [48.2082, 16.3738],
  '폴란드': [52.2297, 21.0122], // 바르샤바
  'Poland': [52.2297, 21.0122],
  '체코': [50.0755, 14.4378], // 프라하
  'Czech Republic': [50.0755, 14.4378],
  '헝가리': [47.4979, 19.0402], // 부다페스트
  'Hungary': [47.4979, 19.0402],
  '루마니아': [44.4268, 26.1025], // 부쿠레슈티
  'Romania': [44.4268, 26.1025],
  '그리스': [37.9755, 23.7348], // 아테네
  'Greece': [37.9755, 23.7348],
  '포르투갈': [38.7223, -9.1393], // 리스본
  'Portugal': [38.7223, -9.1393],
  '노르웨이': [59.9139, 10.7522], // 오슬로
  'Norway': [59.9139, 10.7522],
  '스웨덴': [59.3293, 18.0686], // 스톡홀름
  'Sweden': [59.3293, 18.0686],
  '덴마크': [55.6761, 12.5683], // 코펜하겐
  'Denmark': [55.6761, 12.5683],
  '핀란드': [60.1699, 24.9384], // 헬싱키
  'Finland': [60.1699, 24.9384],
  '우크라이나': [50.4501, 30.5234], // 키예프
  'Ukraine': [50.4501, 30.5234],
  '벨라루스': [53.9045, 27.5615], // 민스크
  'Belarus': [53.9045, 27.5615],
  
  // 북미
  '미국': [38.9072, -77.0369], // 워싱턴 D.C.
  'United States of America': [38.9072, -77.0369],
  'United States': [38.9072, -77.0369],
  '캐나다': [45.4215, -75.6972], // 오타와
  'Canada': [45.4215, -75.6972],
  '멕시코': [19.4326, -99.1332], // 멕시코시티
  'Mexico': [19.4326, -99.1332],
  
  // 남미
  '브라질': [-15.8267, -47.9218], // 브라질리아
  'Brazil': [-15.8267, -47.9218],
  '아르헨티나': [-34.6118, -58.3960], // 부에노스아이레스
  'Argentina': [-34.6118, -58.3960],
  '칠레': [-33.4489, -70.6693], // 산티아고
  'Chile': [-33.4489, -70.6693],
  '콜롬비아': [4.7110, -74.0721], // 보고타
  'Colombia': [4.7110, -74.0721],
  '페루': [-12.0464, -77.0428], // 리마
  'Peru': [-12.0464, -77.0428],
  '베네수엘라': [10.4806, -66.9036], // 카라카스
  'Venezuela': [10.4806, -66.9036],
  '에콰도르': [-0.1807, -78.4678], // 키토
  'Ecuador': [-0.1807, -78.4678],
  '우루과이': [-34.9011, -56.1645], // 몬테비데오
  'Uruguay': [-34.9011, -56.1645],
  '파라과이': [-25.2637, -57.5759], // 아순시온
  'Paraguay': [-25.2637, -57.5759],
  '볼리비아': [-16.2902, -63.5887], // 수크레
  'Bolivia': [-16.2902, -63.5887],
  
  // 아프리카
  '이집트': [30.0444, 31.2357], // 카이로
  'Egypt': [30.0444, 31.2357],
  '남아프리카 공화국': [-25.7479, 28.2293], // 프리토리아
  'South Africa': [-25.7479, 28.2293],
  '나이지리아': [9.0765, 7.3986], // 아부자
  'Nigeria': [9.0765, 7.3986],
  '케냐': [-1.2921, 36.8219], // 나이로비
  'Kenya': [-1.2921, 36.8219],
  '에티오피아': [9.1450, 40.4897], // 아디스아바바
  'Ethiopia': [9.1450, 40.4897],
  '모로코': [34.0209, -6.8416], // 라바트
  'Morocco': [34.0209, -6.8416],
  '가나': [5.6037, -0.1870], // 아크라
  'Ghana': [5.6037, -0.1870],
  '알제리': [36.7538, 3.0588], // 알제
  'Algeria': [36.7538, 3.0588],
  '튀니지': [36.8065, 10.1815], // 튀니스
  'Tunisia': [36.8065, 10.1815],
  '리비아': [32.8872, 13.1913], // 트리폴리
  'Libya': [32.8872, 13.1913],
  '수단': [15.5007, 32.5599], // 하르툼
  'Sudan': [15.5007, 32.5599],
  
  // 오세아니아
  '호주': [-35.2809, 149.1300], // 캔버라
  'Australia': [-35.2809, 149.1300],
  '뉴질랜드': [-41.2924, 174.7787], // 웰링턴
  'New Zealand': [-41.2924, 174.7787],
  '피지': [-18.1248, 178.4501], // 수바
  'Fiji': [-18.1248, 178.4501]
};

const SelectCountryMap = () => {
  const [geoData, setGeoData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [countryList, setCountryList] = useState([]);
  const [connectionLine, setConnectionLine] = useState(null);
  
  // 대한민국 수도 좌표 (서울)
  const koreaCapital = [37.5665, 126.9780];

  useEffect(() => {
    setLoading(true);
    fetch('/countries.geo.json')
      .then((res) => {
        if (!res.ok) throw new Error('데이터 로딩 실패');
        return res.json();
      })
      .then((data) => {
        const filtered = {
          ...data,
          features: data.features.filter(
            (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
          )
        };
        setGeoData(filtered);
        
        // 국가 목록 추출
        const countries = filtered.features.map(f => f.properties.name_ko || f.properties.ADMIN || f.properties.name).filter(Boolean);
        setCountryList(countries.sort());
        
        setLoading(false);
      })
      .catch((error) => {
        console.error('GeoJSON 로딩 오류:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // 국가의 수도 좌표 가져오기 함수
  const getCapitalCoordinates = (countryName) => {
    // 다양한 국가명 변형으로 찾기
    const variations = [
      countryName,
      countryName.replace(/^The /, ''), // "The" 제거
      countryName.replace(/ of America$/, ''), // "of America" 제거
      countryName.replace(/^Republic of /, ''), // "Republic of" 제거
      countryName.replace(/^Democratic Republic of /, ''), // "Democratic Republic of" 제거
    ];
    
    for (const variation of variations) {
      if (capitalCoordinates[variation]) {
        return capitalCoordinates[variation];
      }
    }
    
    // 수도 좌표를 찾을 수 없는 경우 null 반환
    return null;
  };

  // 국가의 중심점 계산 함수 - 날짜변경선 및 다중 폴리곤 문제 해결
  const getCountryCenter = (feature) => {
    let minLat = Infinity, maxLat = -Infinity;
    let allLngs = [];
    let allLats = [];
    
    const processCoordinates = (coords) => {
      coords.forEach(coord => {
        if (Array.isArray(coord[0])) {
          // 중첩된 배열인 경우 재귀 호출
          processCoordinates(coord);
        } else {
          // 실제 좌표인 경우
          const [lng, lat] = coord;
          allLats.push(lat);
          allLngs.push(lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      });
    };
    
    if (feature.geometry.type === 'Polygon') {
      processCoordinates(feature.geometry.coordinates);
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach(polygon => {
        processCoordinates(polygon);
      });
    }
    
    // 경도 처리 - 날짜변경선 문제 해결
    let centerLng;
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);
    const lngRange = maxLng - minLng;
    
    if (lngRange > 180) {
      // 날짜변경선을 넘나드는 경우
      // 모든 음수 경도를 양수로 변환
      const adjustedLngs = allLngs.map(lng => lng < 0 ? lng + 360 : lng);
      const avgLng = adjustedLngs.reduce((sum, lng) => sum + lng, 0) / adjustedLngs.length;
      centerLng = avgLng > 180 ? avgLng - 360 : avgLng;
    } else {
      // 일반적인 경우 - 가중 평균 대신 바운딩 박스 중심 사용
      centerLng = (minLng + maxLng) / 2;
    }
    
    // 위도는 단순 바운딩 박스 중심
    const centerLat = (minLat + maxLat) / 2;
    
    // 특정 국가들에 대한 수동 조정 - 더 정확한 중심점
    const countryName = feature.properties.name_ko || feature.properties.ADMIN || feature.properties.name;
    
    // 문제가 있는 국가들의 정확한 중심점 좌표
    const countryAdjustments = {
      // 동남아시아
      'Indonesia': [-0.7893, 113.9213], // 인도네시아 중심 (칼리만탄 중부)
      '인도네시아': [-0.7893, 113.9213],
      'Philippines': [12.8797, 121.7740], // 필리핀 중심
      '필리핀': [12.8797, 121.7740],
      'Vietnam': [14.0583, 108.2772], // 베트남 중심 (중부 지역)
      '베트남': [14.0583, 108.2772],
      'Laos': [19.8563, 102.4955], // 라오스 중심
      '라오스': [19.8563, 102.4955],
      'Malaysia': [4.2105, 101.9758], // 말레이시아 중심
      '말레이시아': [4.2105, 101.9758],
      'Thailand': [15.8700, 100.9925], // 태국 중심
      '태국': [15.8700, 100.9925],
      'Myanmar': [21.9162, 95.9560], // 미얀마 중심
      '미얀마': [21.9162, 95.9560],
      'Cambodia': [12.5657, 104.9910], // 캄보디아 중심
      '캄보디아': [12.5657, 104.9910],
      
      // 동아시아
      'Japan': [36.2048, 138.2529], // 일본 혼슈 중심
      '일본': [36.2048, 138.2529],
      'China': [35.8617, 104.1954], // 중국 중심부
      '중국': [35.8617, 104.1954],
      'Mongolia': [46.8625, 103.8467], // 몽골 중심
      '몽골': [46.8625, 103.8467],
      
      // 유럽 (해외 영토 문제가 있는 국가들)
      'France': [46.2276, 2.2137], // 프랑스 본토 중심
      '프랑스': [46.2276, 2.2137],
      'United Kingdom': [55.3781, -3.4360], // 영국 본토 중심
      '영국': [55.3781, -3.4360],
      'Netherlands': [52.1326, 5.2913], // 네덜란드 본토 중심
      '네덜란드': [52.1326, 5.2913],
      'Spain': [40.4637, -3.7492], // 스페인 본토 중심
      '스페인': [40.4637, -3.7492],
      'Portugal': [39.3999, -8.2245], // 포르투갈 본토 중심
      '포르투갈': [39.3999, -8.2245],
      'Denmark': [56.2639, 9.5018], // 덴마크 본토 중심
      '덴마크': [56.2639, 9.5018],
      'Norway': [60.4720, 8.4689], // 노르웨이 본토 중심
      '노르웨이': [60.4720, 8.4689],
      
      // 대형 국가들
      'Russia': [61.5240, 105.3188], // 러시아 중심 (시베리아)
      '러시아': [61.5240, 105.3188],
      'United States of America': [39.8283, -98.5795], // 미국 중심
      'United States': [39.8283, -98.5795],
      '미국': [39.8283, -98.5795],
      'Canada': [56.1304, -106.3468], // 캐나다 중심
      '캐나다': [56.1304, -106.3468],
      'Brazil': [-14.2350, -51.9253], // 브라질 중심
      '브라질': [-14.2350, -51.9253],
      'Australia': [-25.2744, 133.7751], // 호주 중심
      '호주': [-25.2744, 133.7751],
      
      // 기타 문제가 될 수 있는 국가들
      'India': [20.5937, 78.9629], // 인도 중심
      '인도': [20.5937, 78.9629],
      'Kazakhstan': [48.0196, 66.9237], // 카자흐스탄 중심
      '카자흐스탄': [48.0196, 66.9237],
      'Iran': [32.4279, 53.6880], // 이란 중심
      '이란': [32.4279, 53.6880],
      'Turkey': [38.9637, 35.2433], // 터키 중심 (아나톨리아)
      '터키': [38.9637, 35.2433],
      'Chile': [-35.6751, -71.5430], // 칠레 중심부
      '칠레': [-35.6751, -71.5430],
      'Argentina': [-38.4161, -63.6167], // 아르헨티나 중심
      '아르헨티나': [-38.4161, -63.6167]
    };
    
    // 조정된 좌표가 있으면 사용
    if (countryAdjustments[countryName]) {
      return countryAdjustments[countryName];
    }
    
    return [centerLat, centerLng];
  };

  // 연결선 업데이트 함수 - 국가 중심점 기준으로 연결
  const updateConnectionLine = (countryName) => {
    if (!geoData || !countryName) {
      setConnectionLine(null);
      return;
    }

    // 한국 feature 찾기
    const koreaFeature = geoData.features.find(f => {
      const name = f.properties.name_ko || f.properties.ADMIN || f.properties.name;
      return name === '대한민국' || name === 'South Korea' || name === '한국';
    });

    const targetFeature = geoData.features.find(f => 
      (f.properties.name_ko || f.properties.ADMIN || f.properties.name) === countryName
    );

    if (koreaFeature && targetFeature && countryName !== '대한민국' && countryName !== 'South Korea' && countryName !== '한국') {
      const koreaCenter = getCountryCenter(koreaFeature);
      const targetCenter = getCountryCenter(targetFeature);
      
      if (koreaCenter && targetCenter) {
        setConnectionLine([koreaCenter, targetCenter]);
      }
    }
  };

  // 스타일 함수 - 매번 새로 계산
  const getStyle = (feature) => {
    const countryName = feature.properties.name_ko || feature.properties.ADMIN || feature.properties.name;
    const isSelected = selectedCountry === countryName;
    
    return {
      fillColor: isSelected ? '#9AD970' : '#ffffff', // 내부색 ? "선택색" : "비선택색"
      color: isSelected ? '#8CBF67' : '#666666',     // 선색 ? "선택색" : "비선택색"
      weight: isSelected ? 3 : 1,
      fillOpacity: isSelected ? 0.8 : 0.3,
      opacity: 1,
    };
  };

  const onEachFeature = (feature, layer) => {
    const countryName = feature.properties.name_ko || feature.properties.ADMIN || feature.properties.name;
    
    if (countryName) {
      layer.bindTooltip(countryName, { 
        sticky: true,
        className: 'custom-tooltip'
      });
      
      layer.on('click', (e) => {
        e.originalEvent.stopPropagation();
        
        if (selectedCountry === countryName) {
          setSelectedCountry(null);
          setConnectionLine(null);
        } else {
          setSelectedCountry(countryName);
          updateConnectionLine(countryName);
        }
        
        if (layer.getElement()) {
          layer.getElement().blur();
        }
        
        // 스타일 즉시 업데이트
        layer.setStyle(getStyle(feature));
      });
      
      layer.on('mouseover', () => {
        if (layer.getElement()) {
          layer.getElement().style.outline = 'none';
        }
      });
      
      // 초기 스타일 설정
      layer.setStyle(getStyle(feature));
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      // 정확히 일치하는 국가 찾기
      const exactMatch = countryList.find(country => 
        country.toLowerCase() === searchInput.toLowerCase()
      );
      
      if (exactMatch) {
        setSelectedCountry(exactMatch);
        updateConnectionLine(exactMatch);
        setSearchInput('');
      } else {
        // 부분 일치하는 국가 찾기
        const partialMatch = countryList.find(country =>
          country.toLowerCase().includes(searchInput.toLowerCase())
        );
        
        if (partialMatch) {
          setSelectedCountry(partialMatch);
          updateConnectionLine(partialMatch);
          setSearchInput('');
        } else {
          alert('해당 국가를 찾을 수 없습니다.');
        }
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div>
      <style>{mapStyles}</style>
      
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '16px' }}>
          지도 데이터 로딩 중...
        </div>
      )}
      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', fontSize: '16px' }}>
          오류: {error}
        </div>
      )}
      
      <MapContainer center={[36, 127]} zoom={5} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {geoData && (
          <GeoJSON
            data={geoData}
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* 대한민국 중심점과 선택된 국가의 중심점을 연결하는 선 */}
        {connectionLine && (
          <Polyline
            positions={connectionLine}
            pathOptions={{
              color: '#ff4444',
              weight: 4,
              opacity: 0.9,
              dashArray: '8, 12'
            }}
            eventHandlers={{
              add: (e) => {
                // Polyline이 추가될 때 최상위로 이동
                const polylineElement = e.target.getElement();
                if (polylineElement && polylineElement.parentNode) {
                  polylineElement.parentNode.appendChild(polylineElement);
                }
              }
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default SelectCountryMap;