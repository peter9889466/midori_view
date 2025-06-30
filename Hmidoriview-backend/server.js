const express = require('express');
const cors = require('cors');
const xml2js = require('xml2js');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// fetch 설정
let fetch;
const setupFetch = async () => {
  if (typeof globalThis.fetch === 'function') {
    fetch = globalThis.fetch;
    console.log('✅ Node.js 내장 fetch 사용');
    return true;
  }

  try {
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
    console.log('✅ node-fetch 사용');
    return true;
  } catch (e) {
    console.error('❌ fetch 설정 실패:', e.message);
    return false;
  }
};

// MySQL 데이터베이스 설정
const dbConfig = {
  host: 'project-db-campus.smhrd.com',
  user: 'campus_25SW_FS_p2_4',          // MySQL 사용자명
  password: 'smhrd4',          // MySQL 비밀번호 (필요시 수정)
  database: 'campus_25SW_FS_p2_4',  // 데이터베이스명
  port: 3307,
  charset: 'utf8mb4'
};

let connection;

// MySQL 연결
const initDatabase = async () => {
  try {
    // 연결 생성
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL 데이터베이스 연결 성공');
    console.log(`✅ ${dbConfig.database} 데이터베이스 사용`);
    
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message);
    return false;
  }
};

// API 설정
const API_CONFIG = {
  baseUrl: 'https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList',
  serviceKey: 'f0ns3HbzWsi5YV9Q+74DjFCTN560xNesRV3Cktq/opPqe0XnDPBWjMiMhwOWn3u9PKxKiogWbvq9lKlXAAvLUw==',
};

const COUNTRY_CODE_MAP = {
  'US': 'US', 'CN': 'CN', 'JP': 'JP', 'VN': 'VN',
  'GB': 'GB',  // 영국 표준 코드
  'UK': 'GB',  // UK로 들어와도 GB로 변환 (영국 문제 해결)
  'DE': 'DE', 'FR': 'FR', 'IN': 'IN',
  'TW': 'TW', 'TH': 'TH', 'AU': 'AU'
};

const parser = new xml2js.Parser();

// ranking.json 데이터를 가져오는 함수
const getEcoData = async () => {
  try {
    const response = await fetch('http://localhost:5173/ranking.json');
    if (!response.ok) throw new Error('ranking.json 로드 실패');
    return await response.json();
  } catch (error) {
    console.error('❌ ranking.json 로드 실패:', error.message);
    return null;
  }
};

// 서버 상태 확인
app.get('/api/status', async (req, res) => {
  try {
    // DB에서 데이터 개수 확인
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM ranking');
    const totalRecords = rows[0].count;
    
    // 최근 데이터 확인
    const [recentRows] = await connection.query(
              'SELECT period, COUNT(*) as count FROM ranking GROUP BY period ORDER BY period DESC LIMIT 5'
    );
    
    res.json({
      status: 'success',
      message: '🐬 MySQL DB 연동 백엔드 서버 가동 중!',
      timestamp: new Date().toISOString(),
      fetchAvailable: !!fetch,
      apiConfigured: !!API_CONFIG.serviceKey,
      database: {
        connected: !!connection,
        totalRecords: totalRecords,
        recentData: recentRows,
        config: {
          host: dbConfig.host,
          database: dbConfig.database,
          port: dbConfig.port,
          table: 'ranking'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'DB 연결 오류: ' + error.message
    });
  }
});

// 단일 API 호출 함수
const fetchSingleTradeData = async (yearMonth, hsCode, countryCode) => {
  try {
    const [year, month] = yearMonth.split('.');
    const yyyymm = `${year}${month}`;
    const url = `${API_CONFIG.baseUrl}?serviceKey=${encodeURIComponent(API_CONFIG.serviceKey)}&strtYymm=${yyyymm}&endYymm=${yyyymm}&cntyCd=${countryCode}&hsSgn=${hsCode}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const json = await parser.parseStringPromise(xml);

    // API 에러 체크
    if (json.OpenAPI_ServiceResponse?.cmmMsgHeader?.[0]) {
      const header = json.OpenAPI_ServiceResponse.cmmMsgHeader[0];
      if (header.returnReasonCode[0] !== '00') {
        throw new Error(`API Error: ${header.errMsg[0]} (${header.returnReasonCode[0]})`);
      }
    }

    let exportValue = 0;
    let importValue = 0;

    if (json.response?.body?.[0]?.items?.[0]?.item?.[0]) {
      const item = json.response.body[0].items[0].item[0];
      exportValue = parseInt(item.expDlr[0] || '0');
      importValue = parseInt(item.impDlr[0] || '0');
    }

    return { exportValue, importValue, success: true };

  } catch (err) {
    console.log(`❌ ${countryCode}-${hsCode}: ${err.message}`);
    return { exportValue: 0, importValue: 0, success: false, error: err.message };
  }
};

// DB에서 데이터 조회 (우선), 없으면 API 호출 후 저장
app.post('/api/trade/bulk', async (req, res) => {
  try {
    const { yearMonth, products, countries } = req.body;
    if (!yearMonth || !products || !countries) {
      return res.status(400).json({ 
        success: false, 
        error: '필수 파라미터 누락'
      });
    }

    const startTime = Date.now();
    console.log(`\n🔍 ${yearMonth} 데이터 조회 시작...`);
    
    // 1단계: DB에서 기존 데이터 확인
    console.log('1️⃣ DB에서 기존 데이터 확인 중...');
    const [existingRows] = await connection.execute(
      'SELECT * FROM ranking WHERE period = ?',
      [yearMonth]
    );
    
    if (existingRows.length > 0) {
      console.log(`✅ DB에서 ${existingRows.length}개 데이터 발견! (즉시 응답)`);
      const dbTime = ((Date.now() - startTime) / 1000).toFixed(3);
      
      return res.json({
        success: true,
        summary: {
          dataSource: 'database',
          totalRecords: existingRows.length,
          executionTime: `${dbTime}초`,
          yearMonth,
          message: 'DB에서 즉시 조회'
        },
        count: existingRows.length,
        data: existingRows
      });
    }
    
    // 2단계: DB에 데이터가 없으면 API 호출
    console.log('2️⃣ DB에 데이터 없음. API 호출 시작...');
    console.log(`📦 제품: ${products.length}개, 🌍 국가: ${countries.length}개`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    let totalCalls = 0;

    for (const product of products) {
      console.log(`📦 ${product.name} 처리 중...`);
      
      for (const country of countries) {
        const countryCode = COUNTRY_CODE_MAP[country.code] || country.code;
        totalCalls++;
        
        const result = await fetchSingleTradeData(yearMonth, product.hsCode, countryCode);
        
        if (result.success && (result.exportValue > 0 || result.importValue > 0)) {
          const dataItem = {
            id: `${country.code}-${product.hsCode}-${yearMonth}`,
            country: country.name,
            product: product.name,
            category: product.category,
            export_value: result.exportValue,
            import_value: result.importValue,
            period: yearMonth
          };
          
          results.push(dataItem);
          successCount++;
          console.log(`  ✅ ${country.flag} ${country.name}: $${(result.exportValue + result.importValue).toLocaleString()}`);
        } else {
          if (!result.success) errorCount++;
        }
        
        // API 호출 딜레이
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // 3단계: 성공한 데이터를 DB에 저장
    if (results.length > 0) {
      console.log(`3️⃣ ${results.length}개 데이터를 DB에 저장 중...`);
      
      const insertSQL = `
        INSERT INTO ranking (
          id, country, product, category, export_value, 
          import_value, period
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          export_value = VALUES(export_value),
          import_value = VALUES(import_value)
      `;
      
      for (const item of results) {
        await connection.execute(insertSQL, [
          item.id, item.country, item.product, item.category,
          item.export_value, item.import_value, item.period
        ]);
      }
      console.log(`✅ DB 저장 완료!`);
    }
    
    const endTime = Date.now();
    const executionTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n🎉 처리 완료!`);
    console.log(`⏱️  총 실행 시간: ${executionTime}초`);
    console.log(`📊 API 호출: ${totalCalls}회`);
    console.log(`✅ 성공: ${successCount}개, ❌ 실패: ${errorCount}개`);
    console.log(`🗄️ DB 저장: ${results.length}개`);

    res.json({
      success: true,
      summary: {
        dataSource: 'api_and_database',
        totalApiCalls: totalCalls,
        successfulData: successCount,
        errorCount,
        savedToDb: results.length,
        successRate: `${(successCount / totalCalls * 100).toFixed(1)}%`,
        executionTime: `${executionTime}초`,
        yearMonth
      },
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('❌ 처리 중 오류:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: '서버 내부 오류'
    });
  }
});

// ============== 🔄 누락 데이터 재수집 기능 추가 ==============

// 누락 데이터 확인 API
app.get('/api/trade/missing/:yearMonth', async (req, res) => {
  try {
    const { yearMonth } = req.params;
    
    // ranking.json 데이터 로드
    const ecoData = await getEcoData();
    if (!ecoData) {
      return res.status(500).json({
        success: false,
        error: 'ranking.json 데이터를 불러올 수 없습니다'
      });
    }
    
    // 모든 가능한 조합 생성
    const allCombinations = [];
    ecoData.ecoProducts.forEach(product => {
      ecoData.countries.forEach(country => {
        allCombinations.push({
          id: `${country.code}-${product.hsCode}-${yearMonth}`,
          countryCode: country.code,
          countryName: country.name,
          hsCode: product.hsCode,
          productName: product.name,
          category: product.category
        });
      });
    });
    
    console.log(`📊 총 ${allCombinations.length}개 조합 생성`);
    
    // DB에서 기존 데이터 확인
    const [existingRows] = await connection.query(
      'SELECT id FROM ranking WHERE period = ?',
      [yearMonth]
    );
    
    const existingIds = new Set(existingRows.map(row => row.id));
    console.log(`✅ DB에 ${existingIds.size}개 데이터 존재`);
    
    // 누락된 데이터 찾기
    const missingData = allCombinations.filter(combo => !existingIds.has(combo.id));
    console.log(`❌ ${missingData.length}개 데이터 누락`);
    
    res.json({
      success: true,
      summary: {
        totalCombinations: allCombinations.length,
        existingData: existingIds.size,
        missingData: missingData.length,
        completionRate: `${((existingIds.size / allCombinations.length) * 100).toFixed(1)}%`
      },
      missing: missingData.slice(0, 50), // 처음 50개만 표시
      yearMonth
    });
    
  } catch (error) {
    console.error('❌ 누락 데이터 확인 실패:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 누락된 데이터만 재수집하는 API
app.post('/api/trade/retry-missing', async (req, res) => {
  try {
    const { yearMonth, limit = 20 } = req.body;
    
    if (!yearMonth) {
      return res.status(400).json({ 
        success: false, 
        error: '년월이 필요합니다'
      });
    }
    
    const startTime = Date.now();
    console.log(`\n🔄 ${yearMonth} 누락 데이터 재수집 시작...`);
    
    // ranking.json 데이터 로드
    const ecoData = await getEcoData();
    if (!ecoData) {
      return res.status(500).json({
        success: false,
        error: 'ranking.json 데이터를 불러올 수 없습니다'
      });
    }
    
    // 모든 가능한 조합 생성
    const allCombinations = [];
    ecoData.ecoProducts.forEach(product => {
      ecoData.countries.forEach(country => {
        allCombinations.push({
          id: `${country.code}-${product.hsCode}-${yearMonth}`,
          country: country,
          product: product,
          yearMonth: yearMonth
        });
      });
    });
    
    // DB에서 기존 데이터 확인
    const [existingRows] = await connection.query(
      'SELECT id FROM ranking WHERE period = ?',
      [yearMonth]
    );
    
    const existingIds = new Set(existingRows.map(row => row.id));
    
    // 누락된 데이터 찾기
    const missingData = allCombinations.filter(combo => !existingIds.has(combo.id));
    
    console.log(`📊 총 조합: ${allCombinations.length}개`);
    console.log(`✅ 기존 데이터: ${existingIds.size}개`);
    console.log(`❌ 누락 데이터: ${missingData.length}개`);
    
    if (missingData.length === 0) {
      return res.json({
        success: true,
        summary: {
          message: '모든 데이터가 이미 수집되었습니다',
          totalCombinations: allCombinations.length,
          existingData: existingIds.size,
          missingData: 0,
          completionRate: '100.0%'
        },
        count: 0,
        data: []
      });
    }
    
    // 제한된 수만큼만 처리
    const toProcess = missingData.slice(0, limit);
    console.log(`🎯 ${toProcess.length}개 데이터 재수집 시작`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of toProcess) {
      const countryCode = COUNTRY_CODE_MAP[item.country.code] || item.country.code;
      
      console.log(`🔄 재시도: ${item.country.name} - ${item.product.name}`);
      
      const result = await fetchSingleTradeData(yearMonth, item.product.hsCode, countryCode);
      
      if (result.success && (result.exportValue > 0 || result.importValue > 0)) {
        const dataItem = {
          id: item.id,
          country: item.country.name,
          product: item.product.name,
          category: item.product.category,
          export_value: result.exportValue,
          import_value: result.importValue,
          period: yearMonth
        };
        
        results.push(dataItem);
        successCount++;
        console.log(`  ✅ 성공: $${(result.exportValue + result.importValue).toLocaleString()}`);
      } else {
        errorCount++;
        console.log(`  ❌ 실패: ${result.error || '데이터 없음'}`);
      }
      
      // API 호출 딜레이
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 성공한 데이터를 DB에 저장
    if (results.length > 0) {
      console.log(`💾 ${results.length}개 데이터를 DB에 저장 중...`);
      
      const insertSQL = `
        INSERT INTO ranking (
          id, country, product, category, export_value, 
          import_value, period
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          export_value = VALUES(export_value),
          import_value = VALUES(import_value)
      `;
      
      for (const item of results) {
        await connection.execute(insertSQL, [
          item.id, item.country, item.product, item.category,
          item.export_value, item.import_value, item.period
        ]);
      }
      console.log(`✅ DB 저장 완료!`);
    }
    
    const endTime = Date.now();
    const executionTime = ((endTime - startTime) / 1000).toFixed(2);
    
    // 최신 완성도 계산
    const newTotal = existingIds.size + results.length;
    const newCompletionRate = ((newTotal / allCombinations.length) * 100).toFixed(1);
    
    console.log(`\n🎉 재수집 완료!`);
    console.log(`⏱️  실행 시간: ${executionTime}초`);
    console.log(`✅ 새로 수집: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📊 완성도: ${newCompletionRate}% (${newTotal}/${allCombinations.length})`);
    console.log(`🔄 남은 누락: ${missingData.length - toProcess.length}개`);

    res.json({
      success: true,
      summary: {
        dataSource: 'retry_missing',
        totalCombinations: allCombinations.length,
        existingDataBefore: existingIds.size,
        processedCount: toProcess.length,
        newlyCollected: successCount,
        failedCount: errorCount,
        totalExistingAfter: newTotal,
        completionRate: `${newCompletionRate}%`,
        remainingMissing: missingData.length - toProcess.length,
        executionTime: `${executionTime}초`,
        yearMonth,
        hasMore: missingData.length > limit
      },
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('❌ 재수집 중 오류:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: '재수집 중 서버 오류'
    });
  }
});

// ============== 기존 API들 ==============
// 기존 코드에 추가할 개선된 재수집 기능들

// ============== 🔄 개선된 데이터 재수집 기능 ==============

// 1. 실패한 데이터만 골라서 재시도하는 API
app.post('/api/trade/retry-failed', async (req, res) => {
  try {
    const { yearMonth, maxRetries = 3, batchSize = 10 } = req.body;
    
    if (!yearMonth) {
      return res.status(400).json({ 
        success: false, 
        error: '년월이 필요합니다'
      });
    }

    console.log(`\n🔄 ${yearMonth} 실패 데이터 재시도 시작...`);
    
    // 실패 기록이 있는 데이터 찾기 (export_value = 0 AND import_value = 0인 데이터)
    const [failedRows] = await connection.query(`
      SELECT id, country, product, category, period 
      FROM ranking 
      WHERE period = ? AND export_value = 0 AND import_value = 0
      LIMIT ?
    `, [yearMonth, batchSize]);

    if (failedRows.length === 0) {
      return res.json({
        success: true,
        message: '재시도할 실패 데이터가 없습니다',
        count: 0
      });
    }

    console.log(`🎯 ${failedRows.length}개 실패 데이터 재시도`);

    const results = [];
    let successCount = 0;
    let stillFailedCount = 0;

    for (const row of failedRows) {
      // ID에서 정보 추출: countryCode-hsCode-yearMonth
      const [countryCode, hsCode] = row.id.split('-');
      
      console.log(`🔄 재시도: ${row.country} - ${row.product}`);
      
      let retryCount = 0;
      let success = false;
      
      // 최대 재시도 횟수만큼 시도
      while (retryCount < maxRetries && !success) {
        const result = await fetchSingleTradeData(yearMonth, hsCode, countryCode);
        
        if (result.success && (result.exportValue > 0 || result.importValue > 0)) {
          // 성공! DB 업데이트
          await connection.execute(`
            UPDATE ranking 
            SET export_value = ?, import_value = ?, updated_at = NOW()
            WHERE id = ?
          `, [result.exportValue, result.importValue, row.id]);
          
          results.push({
            id: row.id,
            country: row.country,
            product: row.product,
            export_value: result.exportValue,
            import_value: result.importValue,
            retryCount: retryCount + 1
          });
          
          successCount++;
          success = true;
          console.log(`  ✅ ${retryCount + 1}번째 시도 성공: $${(result.exportValue + result.importValue).toLocaleString()}`);
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`  ⏳ ${retryCount}번째 시도 실패, 재시도 중...`);
            await new Promise(resolve => setTimeout(resolve, 500)); // 더 긴 딜레이
          }
        }
      }
      
      if (!success) {
        stillFailedCount++;
        console.log(`  ❌ ${maxRetries}번 모두 실패`);
      }
      
      // API 호출 간 딜레이
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    res.json({
      success: true,
      summary: {
        processedCount: failedRows.length,
        successCount,
        stillFailedCount,
        successRate: `${((successCount / failedRows.length) * 100).toFixed(1)}%`,
        yearMonth
      },
      data: results
    });

  } catch (error) {
    console.error('❌ 실패 데이터 재시도 중 오류:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// 2. 특정 국가나 제품의 누락 데이터만 재수집
app.post('/api/trade/retry-specific', async (req, res) => {
  try {
    const { yearMonth, countryCode, hsCode, productName } = req.body;
    
    if (!yearMonth) {
      return res.status(400).json({ 
        success: false, 
        error: '년월이 필요합니다'
      });
    }

    console.log(`\n🎯 특정 데이터 재수집: ${countryCode || '전체'} - ${productName || hsCode || '전체'}`);

    // ranking.json 데이터 로드
    const ecoData = await getEcoData();
    if (!ecoData) {
      return res.status(500).json({
        success: false,
        error: 'ranking.json 데이터를 불러올 수 없습니다'
      });
    }

    // 필터링된 조합 생성
    let targetCombinations = [];
    
    ecoData.ecoProducts.forEach(product => {
      // 제품 필터링
      if (hsCode && product.hsCode !== hsCode) return;
      if (productName && !product.name.includes(productName)) return;
      
      ecoData.countries.forEach(country => {
        // 국가 필터링
        if (countryCode && country.code !== countryCode) return;
        
        targetCombinations.push({
          id: `${country.code}-${product.hsCode}-${yearMonth}`,
          country: country,
          product: product
        });
      });
    });

    console.log(`📊 대상 조합: ${targetCombinations.length}개`);

    // 기존 데이터 확인
    const existingIds = new Set();
    if (targetCombinations.length > 0) {
      const idList = targetCombinations.map(c => c.id);
      const placeholders = idList.map(() => '?').join(',');
      const [existingRows] = await connection.query(
        `SELECT id FROM ranking WHERE id IN (${placeholders})`,
        idList
      );
      existingRows.forEach(row => existingIds.add(row.id));
    }

    // 누락된 데이터만 처리
    const missingCombinations = targetCombinations.filter(combo => !existingIds.has(combo.id));
    
    console.log(`✅ 기존: ${existingIds.size}개, ❌ 누락: ${missingCombinations.length}개`);

    if (missingCombinations.length === 0) {
      return res.json({
        success: true,
        message: '모든 대상 데이터가 이미 존재합니다',
        existingCount: existingIds.size,
        missingCount: 0
      });
    }

    // 누락된 데이터 수집
    const results = [];
    let successCount = 0;

    for (const combo of missingCombinations) {
      const apiCountryCode = COUNTRY_CODE_MAP[combo.country.code] || combo.country.code;
      
      console.log(`🔄 수집: ${combo.country.name} - ${combo.product.name}`);
      
      const result = await fetchSingleTradeData(yearMonth, combo.product.hsCode, apiCountryCode);
      
      if (result.success && (result.exportValue > 0 || result.importValue > 0)) {
        const dataItem = {
          id: combo.id,
          country: combo.country.name,
          product: combo.product.name,
          category: combo.product.category,
          export_value: result.exportValue,
          import_value: result.importValue,
          period: yearMonth
        };
        
        // DB에 저장
        const insertSQL = `
          INSERT INTO ranking (
            id, country, product, category, export_value, 
            import_value, period
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            export_value = VALUES(export_value),
            import_value = VALUES(import_value)
        `;
        
        await connection.execute(insertSQL, [
          dataItem.id, dataItem.country, dataItem.product, dataItem.category,
          dataItem.export_value, dataItem.import_value, dataItem.period
        ]);
        
        results.push(dataItem);
        successCount++;
        console.log(`  ✅ 성공: $${(result.exportValue + result.importValue).toLocaleString()}`);
      } else {
        console.log(`  ❌ 실패: ${result.error || '데이터 없음'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    res.json({
      success: true,
      summary: {
        targetCombinations: targetCombinations.length,
        existingData: existingIds.size,
        missingData: missingCombinations.length,
        newlyCollected: successCount,
        filters: {
          countryCode: countryCode || '전체',
          hsCode: hsCode || '전체',
          productName: productName || '전체'
        },
        yearMonth
      },
      data: results
    });

  } catch (error) {
    console.error('❌ 특정 데이터 재수집 중 오류:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// 3. 자동 재수집 스케줄러 (선택사항)
app.post('/api/trade/auto-retry', async (req, res) => {
  try {
    const { yearMonth, intervalMinutes = 10, maxRounds = 5 } = req.body;
    
    console.log(`\n🤖 ${yearMonth} 자동 재수집 시작 (${maxRounds}라운드, ${intervalMinutes}분 간격)`);
    
    let round = 0;
    const retryResults = [];
    
    const autoRetry = async () => {
      if (round >= maxRounds) {
        console.log('🏁 자동 재수집 완료');
        return;
      }
      
      round++;
      console.log(`\n🔄 ${round}라운드 시작...`);
      
      try {
        // 누락 데이터 확인
        const missingResponse = await fetch(`http://localhost:${PORT}/api/trade/missing/${yearMonth}`);
        const missingData = await missingResponse.json();
        
        if (missingData.success && missingData.missing && missingData.missing.length > 0) {
          // 일부 누락 데이터 재수집 (한 번에 20개씩)
          const retryResponse = await fetch(`http://localhost:${PORT}/api/trade/retry-missing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ yearMonth, limit: 20 })
          });
          
          const retryResult = await retryResponse.json();
          retryResults.push({
            round,
            timestamp: new Date(),
            ...retryResult.summary
          });
          
          console.log(`✅ ${round}라운드 완료: ${retryResult.summary?.newlyCollected || 0}개 추가 수집`);
        } else {
          console.log(`✅ ${round}라운드: 재수집할 데이터 없음`);
        }
        
        // 다음 라운드 예약
        if (round < maxRounds) {
          setTimeout(autoRetry, intervalMinutes * 60 * 1000);
        }
        
      } catch (error) {
        console.error(`❌ ${round}라운드 실패:`, error.message);
      }
    };
    
    // 첫 번째 라운드 시작
    autoRetry();
    
    res.json({
      success: true,
      message: `자동 재수집 스케줄 시작 (${maxRounds}라운드, ${intervalMinutes}분 간격)`,
      schedule: {
        yearMonth,
        maxRounds,
        intervalMinutes,
        startTime: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ 자동 재수집 설정 실패:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// 4. 데이터 완성도 실시간 모니터링
app.get('/api/trade/completion/:yearMonth', async (req, res) => {
  try {
    const { yearMonth } = req.params;
    
    // ranking.json 데이터 로드
    const ecoData = await getEcoData();
    if (!ecoData) {
      return res.status(500).json({
        success: false,
        error: 'ranking.json 데이터를 불러올 수 없습니다'
      });
    }
    
    const totalPossible = ecoData.ecoProducts.length * ecoData.countries.length;
    
    // 현재 DB 상태 확인
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN export_value > 0 OR import_value > 0 THEN 1 END) as valid_records,
        COUNT(CASE WHEN export_value = 0 AND import_value = 0 THEN 1 END) as zero_records,
        SUM(export_value + import_value) as total_trade_value
      FROM ranking 
      WHERE period = ?
    `, [yearMonth]);
    
    // 국가별 완성도
    const [countryStats] = await connection.query(`
      SELECT 
        country,
        COUNT(*) as records,
        COUNT(CASE WHEN export_value > 0 OR import_value > 0 THEN 1 END) as valid_records
      FROM ranking 
      WHERE period = ?
      GROUP BY country
      ORDER BY valid_records DESC
    `, [yearMonth]);
    
    // 제품별 완성도  
    const [productStats] = await connection.query(`
      SELECT 
        product,
        category,
        COUNT(*) as records,
        COUNT(CASE WHEN export_value > 0 OR import_value > 0 THEN 1 END) as valid_records,
        SUM(export_value + import_value) as total_value
      FROM ranking 
      WHERE period = ?
      GROUP BY product, category
      ORDER BY valid_records DESC
    `, [yearMonth]);
    
    const currentStats = stats[0];
    const completionRate = ((currentStats.total_records / totalPossible) * 100).toFixed(1);
    const validDataRate = currentStats.total_records > 0 ? 
      ((currentStats.valid_records / currentStats.total_records) * 100).toFixed(1) : '0.0';
    
    res.json({
      success: true,
      yearMonth,
      overview: {
        totalPossible,
        totalRecords: currentStats.total_records,
        validRecords: currentStats.valid_records,
        zeroRecords: currentStats.zero_records,
        missingRecords: totalPossible - currentStats.total_records,
        completionRate: `${completionRate}%`,
        validDataRate: `${validDataRate}%`,
        totalTradeValue: currentStats.total_trade_value
      },
      countryStats: countryStats.map(stat => ({
        ...stat,
        completionRate: `${((stat.records / ecoData.ecoProducts.length) * 100).toFixed(1)}%`,
        validRate: `${((stat.valid_records / stat.records) * 100).toFixed(1)}%`
      })),
      productStats: productStats.map(stat => ({
        ...stat,
        completionRate: `${((stat.records / ecoData.countries.length) * 100).toFixed(1)}%`,
        validRate: `${((stat.valid_records / stat.records) * 100).toFixed(1)}%`
      }))
    });
    
  } catch (error) {
    console.error('❌ 완성도 확인 실패:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 사용 예시를 위한 헬퍼 API
app.get('/api/help/retry-commands', (req, res) => {
  res.json({
    success: true,
    commands: {
      "모든 누락 데이터 재수집": {
        endpoint: "POST /api/trade/retry-missing",
        body: { yearMonth: "2024.01", limit: 50 }
      },
      "실패한 데이터만 재시도": {
        endpoint: "POST /api/trade/retry-failed", 
        body: { yearMonth: "2024.01", maxRetries: 3, batchSize: 20 }
      },
      "특정 국가 데이터 재수집": {
        endpoint: "POST /api/trade/retry-specific",
        body: { yearMonth: "2024.01", countryCode: "US" }
      },
      "특정 제품 데이터 재수집": {
        endpoint: "POST /api/trade/retry-specific", 
        body: { yearMonth: "2024.01", hsCode: "8507" }
      },
      "자동 재수집 스케줄": {
        endpoint: "POST /api/trade/auto-retry",
        body: { yearMonth: "2024.01", intervalMinutes: 10, maxRounds: 5 }
      },
      "완성도 모니터링": {
        endpoint: "GET /api/trade/completion/2024.01"
      }
    },
    tips: [
      "retry-missing: 아예 없는 데이터를 새로 수집",
      "retry-failed: 이미 있지만 값이 0인 데이터를 재시도", 
      "retry-specific: 특정 국가나 제품만 골라서 재수집",
      "auto-retry: 자동으로 주기적 재수집 (백그라운드)",
      "completion: 현재 데이터 완성도 실시간 확인"
    ]
  });
});

// DB 데이터 삭제 API (관리용)
app.delete('/api/trade/clear/:yearMonth', async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const [result] = await connection.execute(
      'DELETE FROM ranking WHERE period = ?',
      [yearMonth]
    );
    
    res.json({
      success: true,
      message: `${yearMonth} 데이터 ${result.affectedRows}개 삭제 완료`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 전체 DB 현황 API
app.get('/api/database/stats', async (req, res) => {
  try {
    const [countRows] = await connection.query(
      'SELECT period, COUNT(*) as count, SUM(export_value + import_value) as total_trade FROM ranking GROUP BY period ORDER BY period DESC'
    );
    
    const [recentRows] = await connection.query(
      'SELECT period, COUNT(*) as count FROM ranking GROUP BY period ORDER BY period DESC LIMIT 5'
    );
    
    const [totalRows] = await connection.query(
      'SELECT COUNT(*) as total FROM ranking'
    );
    
    res.json({
      success: true,
      total: totalRows[0].total,
      byMonth: countRows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 서버 시작
const startServer = async () => {
  console.log('\n🚀 MySQL DB 백엔드 서버 시작 중...');
  
  // 1. fetch 설정
  const fetchReady = await setupFetch();
  if (!fetchReady) {
    console.error('❌ fetch 설정 실패');
    process.exit(1);
  }
  
  // 2. 데이터베이스 초기화
  const dbReady = await initDatabase();
  if (!dbReady) {
    console.error('❌ 데이터베이스 초기화 실패');
    process.exit(1);
  }
  
  // 3. 서버 시작
  app.listen(PORT, () => {
    console.log('\n🎉==================================🎉');
    console.log('🐬 MySQL DB 연동 백엔드 서버 시작!');
    console.log(`📡 서버 주소: http://localhost:${PORT}`);
    console.log(`🗄️ 데이터베이스: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
    console.log('📊 API 엔드포인트:');
    console.log(`   - GET  /api/status`);
    console.log(`   - POST /api/trade/bulk`);
    console.log(`   - GET  /api/database/stats`);
    console.log(`   - DELETE /api/trade/clear/:yearMonth`);
    console.log(`   - GET  /api/trade/missing/:yearMonth  🆕`);
    console.log(`   - POST /api/trade/retry-missing       🆕`);
    console.log('🚀 특징: DB 캐싱으로 초고속 응답 + 누락 데이터 재수집!');
    console.log('🎉==================================🎉\n');
  });
};

// 종료 처리
process.on('SIGINT', async () => {
  console.log('\n👋 서버를 종료합니다...');
  if (connection) {
    await connection.end();
    console.log('✅ MySQL 연결 종료');
  }
  process.exit(0);
});

startServer();