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
    // DB에서 데이터 개수 확인 (RANKING_TABLE로 변경)
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM RANKING_TABLE');
    const totalRecords = rows[0].count;

    // 최근 데이터 확인 (RANKING_TABLE로 변경)
    const [recentRows] = await connection.query(
      'SELECT RANK_PERIOD, COUNT(*) as count FROM RANKING_TABLE GROUP BY RANK_PERIOD ORDER BY RANK_PERIOD DESC LIMIT 5'
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
          table: 'RANKING_TABLE'
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

    // 1단계: DB에서 기존 데이터 확인 (RANKING_TABLE로 변경)
    console.log('1️⃣ DB에서 기존 데이터 확인 중...');
    const [existingRows] = await connection.execute(
      'SELECT * FROM RANKING_TABLE WHERE RANK_PERIOD = ?',
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
            RANK_PERIOD: yearMonth
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

    // 3단계: 성공한 데이터를 DB에 저장 (RANKING_TABLE로 변경)
    if (results.length > 0) {
      console.log(`3️⃣ ${results.length}개 데이터를 DB에 저장 중...`);

      const insertSQL = `
        INSERT INTO RANKING_TABLE (
          RANK_ID, RANK_COUNTRY, RANK_PRODUCT, RANK_CATEGORY, EXPORT_VALUE, 
          IMPORT_VALUE, RANK_PERIOD, CREATED_AT
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          EXPORT_VALUE = VALUES(EXPORT_VALUE),
          IMPORT_VALUE = VALUES(IMPORT_VALUE)
      `;

      for (const item of results) {
        await connection.execute(insertSQL, [
          item.id, item.country, item.product, item.category,
          item.export_value, item.import_value, item.RANK_PERIOD
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

// ============== 🔄 누락 데이터 재수집 기능 (RANKING_TABLE로 수정) ==============

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

    // DB에서 기존 데이터 확인 (RANKING_TABLE로 변경)
    const [existingRows] = await connection.query(
      'SELECT RANK_ID as id FROM RANKING_TABLE WHERE RANK_PERIOD = ?',
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

    // DB에서 기존 데이터 확인 (RANKING_TABLE로 변경)
    const [existingRows] = await connection.query(
      'SELECT RANK_ID as id FROM RANKING_TABLE WHERE RANK_PERIOD = ?',
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
          RANK_PERIOD: yearMonth
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

    // 성공한 데이터를 DB에 저장 (RANKING_TABLE로 변경)
    if (results.length > 0) {
      console.log(`💾 ${results.length}개 데이터를 DB에 저장 중...`);

      const insertSQL = `
        INSERT INTO RANKING_TABLE (
          RANK_ID, RANK_COUNTRY, RANK_PRODUCT, RANK_CATEGORY, EXPORT_VALUE, 
          IMPORT_VALUE, RANK_PERIOD
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          EXPORT_VALUE = VALUES(EXPORT_VALUE),
          IMPORT_VALUE = VALUES(IMPORT_VALUE)
      `;

      for (const item of results) {
        await connection.execute(insertSQL, [
          item.id, item.country, item.product, item.category,
          item.export_value, item.import_value, item.RANK_PERIOD
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

// ============== 기존 API들 (RANKING_TABLE로 수정) ==============

// DB 데이터 삭제 API (관리용)
app.delete('/api/trade/clear/:yearMonth', async (req, res) => {
  try {
    const { yearMonth } = req.params;
    const [result] = await connection.execute(
      'DELETE FROM RANKING_TABLE WHERE RANK_PERIOD = ?',
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
      'SELECT RANK_PERIOD, COUNT(*) as count, SUM(EXPORT_VALUE + IMPORT_VALUE) as total_trade FROM RANKING_TABLE GROUP BY RANK_PERIOD ORDER BY RANK_PERIOD DESC'
    );

    const [recentRows] = await connection.query(
      'SELECT RANK_PERIOD, COUNT(*) as count FROM RANKING_TABLE GROUP BY RANK_PERIOD ORDER BY RANK_PERIOD DESC LIMIT 5'
    );

    const [totalRows] = await connection.query(
      'SELECT COUNT(*) as total FROM RANKING_TABLE'
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
    console.log('📊 테이블: RANKING_TABLE 사용');
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