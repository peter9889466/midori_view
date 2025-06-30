import React, { useState, useEffect, useMemo } from 'react';

const Ranking = () => {
  const [ecoData, setEcoData] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedCountry, setSelectedCountry] = useState('전체');
  const [rankingType, setRankingType] = useState('exportValue');
  const [selectedYearMonth, setSelectedYearMonth] = useState('2024.12');
  const [apiStatus, setApiStatus] = useState(''); // API 상태 메시지

  // 백엔드 API로 실제 데이터 요청하는 함수
  const fetchDataFromBackend = async (yearMonth, products, countries) => {
    try {
      console.log(`🔄 백엔드 API로 ${yearMonth} 데이터 요청 중...`);
      setApiStatus(`🔄 ${yearMonth} 데이터 요청 중...`);
      
      const apiResponse = await fetch('http://localhost:3001/api/trade/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yearMonth: yearMonth,
          products: products,
          countries: countries
        })
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
      }
      
      const apiData = await apiResponse.json();
      
      if (apiData.success) {
        console.log('✅ 백엔드 API 데이터 수신 성공:', apiData.count, '개 항목');
        console.log('📊 API 호출 요약:', apiData.summary);
        setApiStatus(`✅ ${yearMonth} 데이터 수신 완료 (${apiData.count}개 항목)`);
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedData = (apiData.data || []).map(item => ({
          id: item.id,
          country: item.country,
          product: item.product,
          category: item.category,
          exportValue: item.export_value || 0,
          importValue: item.import_value || 0,
          tradeValue: (item.export_value || 0) + (item.import_value || 0),
          period: item.period,
          // 추가 필드들 (ecoData에서 매칭)
          countryCode: '',
          countryFlag: '',
          countryName: item.country,
          productName: item.product,
          productFeature: '',
          hsCode: ''
        }));
        
        return transformedData;
      } else {
        throw new Error(apiData.error || 'API 응답 실패');
      }
      
    } catch (error) {
      console.error('❌ 백엔드 API 호출 실패:', error.message);
      setApiStatus(`❌ API 호출 실패: ${error.message}`);
      return [];
    }
  };

  // 백엔드 서버 연결 확인
  const checkBackendConnection = async () => {
    try {
      console.log('🔄 백엔드 서버 연결 확인 중...');
      setApiStatus('🔄 백엔드 서버 연결 확인 중...');
      
      const statusResponse = await fetch('http://localhost:3001/api/status');
      
      if (!statusResponse.ok) {
        throw new Error(`HTTP ${statusResponse.status}: ${statusResponse.statusText}`);
      }
      
      const statusData = await statusResponse.json();
      console.log('✅ 백엔드 서버 연결 성공:', statusData.message);
      setApiStatus('✅ 백엔드 서버 연결 성공');
      return statusData;
      
    } catch (error) {
      console.error('❌ 백엔드 서버 연결 실패:', error.message);
      setApiStatus(`❌ 백엔드 서버 연결 실패: ${error.message}`);
      return null;
    }
  };

  // 데이터 보강 함수 (ecoData와 매칭하여 추가 정보 제공)
  const enrichData = (apiData, ecoData) => {
    if (!ecoData) return apiData;
    
    return apiData.map(item => {
      // 국가 정보 매칭
      const country = ecoData.countries.find(c => c.name === item.country);
      
      // 제품 정보 매칭
      const product = ecoData.ecoProducts.find(p => p.name === item.product);
      
      return {
        ...item,
        countryCode: country?.code || '',
        countryFlag: country?.flag || '🏳️',
        countryName: country?.name || item.country,
        productName: product?.name || item.product,
        productFeature: product?.feature || '',
        hsCode: product?.hsCode || ''
      };
    });
  };

  // 년월 변경 시 데이터 다시 로드
  const handleYearMonthChange = async (newYearMonth) => {
    setSelectedYearMonth(newYearMonth);
    
    if (!ecoData) return;
    
    try {
      setLoading(true);
      console.log(`📅 ${newYearMonth} 데이터로 변경 중...`);
      
      // 백엔드 API 호출
      const apiData = await fetchDataFromBackend(newYearMonth, ecoData.ecoProducts, ecoData.countries);
      
      // 데이터 보강
      const enrichedData = enrichData(apiData, ecoData);
      setRankingData(enrichedData);
      
    } catch (error) {
      console.error(`❌ ${newYearMonth} 데이터 로딩 실패:`, error.message);
      setRankingData([]);
      setApiStatus(`❌ ${newYearMonth} 데이터 로딩 실패`);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // 1. ranking.json 데이터 로드
        console.log('📄 ranking.json 데이터 로딩 중...');
        setApiStatus('📄 설정 파일 로딩 중...');
        
        const jsonResponse = await fetch('/ranking.json');
        
        if (!jsonResponse.ok) {
          throw new Error('ranking.json 파일을 찾을 수 없습니다');
        }
        
        const data = await jsonResponse.json();
        setEcoData(data);
        console.log('✅ ranking.json 로드 성공');
        
        // 2. 백엔드 서버 연결 확인
        const serverStatus = await checkBackendConnection();
        
        if (!serverStatus) {
          setApiStatus('❌ 백엔드 서버에 연결할 수 없습니다. 서버를 실행해주세요.');
          setRankingData([]);
          return;
        }
        
        // 3. 백엔드 API에서 실제 데이터 가져오기
        const apiData = await fetchDataFromBackend(selectedYearMonth, data.ecoProducts, data.countries);
        
        // 4. 데이터 보강
        const enrichedData = enrichData(apiData, data);
        setRankingData(enrichedData);
        
        console.log('✅ 초기 데이터 로딩 완료');
        
      } catch (error) {
        console.error('❌ 초기 데이터 로딩 실패:', error.message);
        setApiStatus(`❌ 초기화 실패: ${error.message}`);
        setRankingData([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 필터링된 데이터
  const processedData = useMemo(() => {
    if (!rankingData.length) return [];
    
    let filtered = rankingData;
    
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (selectedCountry !== '전체') {
      filtered = filtered.filter(item => item.countryCode === selectedCountry);
    }
    
    return filtered.sort((a, b) => {
      if (rankingType === 'exportValue') return (b.exportValue || 0) - (a.exportValue || 0);
      if (rankingType === 'importValue') return (b.importValue || 0) - (a.importValue || 0);
      if (rankingType === 'tradeValue') return (b.tradeValue || 0) - (a.tradeValue || 0);
      return 0;
    });
  }, [rankingData, selectedCategory, selectedCountry, rankingType]);

  // 유틸리티 함수 - 안전한 숫자 포맷팅
  const formatNumber = (value) => {
    // undefined, null, NaN 체크
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    
    const num = Number(value);
    if (isNaN(num)) return '0';
    
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        gap: '15px'
      }}>
        <div>🔄 실제 API 데이터 로딩 중...</div>
        <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
          {apiStatus}
        </div>
      </div>
    );
  }

  if (!ecoData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>❌ 데이터를 불러올 수 없습니다</h2>
        <p>ranking.json 파일을 확인해주세요.</p>
        <div style={{ marginTop: '20px', color: '#666' }}>
          상태: {apiStatus}
        </div>
      </div>
    );
  }

  const categories = ['전체', ...Object.keys(ecoData.categories || {})];

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      {/* 헤더 */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px'
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>
          🌍 친환경 제품 글로벌 랭킹
        </h1>
        <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
          한국무역통계서비스 실제 API 데이터 기반
        </p>
      </div>

      {/* API 상태 표시 */}
      {apiStatus && (
        <div style={{
          background: apiStatus.includes('❌') ? '#ffebee' : apiStatus.includes('✅') ? '#e8f5e8' : '#fff3e0',
          color: apiStatus.includes('❌') ? '#c62828' : apiStatus.includes('✅') ? '#2e7d32' : '#f57c00',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          textAlign: 'center',
          border: `1px solid ${apiStatus.includes('❌') ? '#ffcdd2' : apiStatus.includes('✅') ? '#c8e6c9' : '#ffcc02'}`
        }}>
          {apiStatus}
        </div>
      )}

      {/* 컨트롤 패널 */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          marginBottom: '20px' 
        }}>
          {/* 년월 선택 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📅 기준 년월
            </label>
            <select
              value={selectedYearMonth}
              onChange={(e) => handleYearMonthChange(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: loading ? '#f5f5f5' : 'white'
              }}
            >
              <option value="2024.07">2024.07</option>
              <option value="2024.08">2024.08</option>
              <option value="2024.09">2024.09</option>
              <option value="2024.10">2024.10</option>
              <option value="2024.11">2024.11</option>
              <option value="2024.12">2024.12</option>
              <option value="2025.01">2025.01</option>
              <option value="2025.02">2025.02</option>
              <option value="2025.03">2025.03</option>
              <option value="2025.04">2025.04</option>
              <option value="2025.05">2025.05</option>
              <option value="2025.06">2025.06</option>
            </select>
          </div>

          {/* 카테고리 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              📂 카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === '전체' ? '🌐 전체' : `${ecoData.categories[category]?.icon} ${category}`}
                </option>
              ))}
            </select>
          </div>

          {/* 국가 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🌍 국가
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="전체">🌐 전체 국가</option>
              {ecoData.countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* 랭킹 기준 */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              🏆 랭킹 기준
            </label>
            <select
              value={rankingType}
              onChange={(e) => setRankingType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="exportValue">📤 수출액</option>
              <option value="importValue">📥 수입액</option>
              <option value="tradeValue">🔄 총 교역액</option>
            </select>
          </div>
        </div>
      </div>

      {/* 요약 정보 */}
      <div style={{
        background: 'white',
        padding: '15px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
          📊 총 {processedData.length}개 항목 | 
          💰 총 교역액: {formatNumber(processedData.reduce((sum, item) => sum + (item.tradeValue || 0), 0))} USD
        </h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          📅 기준: {selectedYearMonth} | 📡 실제 API 데이터 {rankingData.length}개
          <br />
          🔗 데이터 출처: 한국무역통계서비스 (unipass.customs.go.kr)
        </div>
      </div>

      {/* 랭킹 테이블 */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '2px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.4rem', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            🏆 실제 API 데이터 랭킹 ({processedData.length}개)
          </h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ 
                  padding: '15px 10px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #dee2e6',
                  minWidth: '60px'
                }}>
                  순위
                </th>
                <th style={{ 
                  padding: '15px 10px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #dee2e6',
                  minWidth: '80px'
                }}>
                  국가
                </th>
                <th style={{ 
                  padding: '15px 10px', 
                  textAlign: 'left', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #dee2e6',
                  minWidth: '200px'
                }}>
                  제품명
                </th>
                <th style={{ 
                  padding: '15px 10px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #dee2e6',
                  minWidth: '80px'
                }}>
                  HS코드
                </th>
                <th style={{ 
                  padding: '15px 10px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #dee2e6',
                  minWidth: '120px'
                }}>
                  수출액
                </th>
                <th style={{ 
                  padding: '15px 10px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #dee2e6',
                  minWidth: '120px'
                }}>
                  수입액
                </th>
                <th style={{ 
                  padding: '15px 10px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  borderBottom: '2px solid #dee2e6',
                  minWidth: '120px'
                }}>
                  총 교역액
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.slice(0, 50).map((item, index) => (
                <tr key={item.id} style={{ 
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <td style={{ 
                    padding: '12px 10px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {index < 3 ? (
                      <span style={{ fontSize: '20px' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      index + 1
                    )}
                    <div style={{ fontSize: '10px', color: '#28a745' }}>📡</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{item.countryFlag}</span>
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.countryName}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{item.countryCode}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {ecoData.categories[item.category]?.icon} {item.productName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.productFeature}
                      </div>
                    </div>
                  </td>
                  <td style={{ 
                    padding: '12px 10px', 
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: '600',
                    color: '#495057'
                  }}>
                    {item.hsCode}
                  </td>
                  <td style={{ 
                    padding: '12px 10px', 
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
                    ${formatNumber(item.exportValue)}
                  </td>
                  <td style={{ 
                    padding: '12px 10px', 
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#dc3545'
                  }}>
                    ${formatNumber(item.importValue)}
                  </td>
                  <td style={{ 
                    padding: '12px 10px', 
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: '#007bff'
                  }}>
                    ${formatNumber(item.tradeValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {processedData.length === 0 && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#666',
            fontSize: '16px'
          }}>
            {rankingData.length === 0 ? (
              <div>
                <div style={{ marginBottom: '10px' }}>
                  📡 백엔드 API에서 데이터를 가져오는 중이거나 해당 기간에 데이터가 없습니다.
                </div>
                <div style={{ fontSize: '14px' }}>
                  백엔드 서버가 실행 중인지 확인해주세요: http://localhost:3001
                </div>
              </div>
            ) : (
              '🔍 검색 조건에 맞는 데이터가 없습니다.'
            )}
          </div>
        )}
      </div>

      {/* 백엔드 연결 안내 */}
      {rankingData.length === 0 && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
            💡 백엔드 서버 실행 안내
          </h4>
          <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
            실제 API 데이터를 보려면 백엔드 서버를 실행해주세요:
          </p>
          <code style={{ 
            display: 'block', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            color: '#495057'
          }}>
            npm install node-fetch<br/>
            node server.js
          </code>
        </div>
      )}

      {/* 하단 정보 */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#343a40',
        color: 'white',
        borderRadius: '12px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>
          🌱 실제 API 기반 친환경 무역 데이터
        </h3>
        <p style={{ margin: 0, opacity: 0.8 }}>
          📊 {ecoData.ecoProducts?.length || 0}개 제품 | 🌍 {ecoData.countries?.length || 0}개 국가 | 
          📂 {Object.keys(ecoData.categories || {}).length}개 카테고리 | 📡 실시간 API 연동
        </p>
      </div>
    </div>
  );
};

export default Ranking;