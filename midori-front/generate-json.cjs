// db에 있는 데이터를 json파일로 만들어주는 코드(랭킹전용 파일은 public/data 안에 있음)
// 현재 코드를 사용하려면 /midori_view/midori_front에서 node generate-json.cjs --all(db에 있는 모든 년월의 파일을 json으로 만듬)
// node generate-json.cjs --all
const fs = require('fs');
const mysql = require('mysql2/promise');

// DB 설정 (실제 정보로 변경 필요)
const dbConfig = {
    host: 'project-db-campus.smhrd.com',     // 또는 localhost
    port: 3307,
    user: 'campus_25SW_FS_p2_4',      // DB 사용자명
    password: 'smhrd4',  // DB 비밀번호
    database: 'campus_25SW_FS_p2_4'   // DB 이름
};

async function generateTradeJson() {
    let connection;
    
    try {
        console.log('🔄 DB 연결 중...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ DB 연결 성공!');

        // 2025.05 데이터 조회
        console.log('🔄 2025.05 데이터 조회 중...');
        const [rows] = await connection.execute(`
            SELECT 
                RANK_ID,
                RANK_COUNTRY,
                RANK_PRODUCT,
                RANK_CATEGORY,
                EXPORT_VALUE,
                IMPORT_VALUE,
                RANK_PERIOD,
                CREATED_AT
            FROM RANKING_TABLE 
            WHERE RANK_PERIOD = '2025.05'
            ORDER BY (EXPORT_VALUE + IMPORT_VALUE) DESC
        `);

        if (rows.length === 0) {
            console.log('❌ 2025.05 데이터가 없습니다.');
            return;
        }

        // public/data 폴더 생성
        const dataDir = './public/data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('📁 public/data 폴더 생성됨');
        }

        // JSON 파일 생성
        const jsonData = JSON.stringify(rows, null, 2);
        fs.writeFileSync(`${dataDir}/trade-2025-05.json`, jsonData);
        
        console.log(`✅ trade-2025-05.json 파일 생성 완료! (${rows.length}개 데이터)`);
        console.log(`📍 파일 위치: ${dataDir}/trade-2025-05.json`);

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 DB 연결 종료');
        }
    }
}

// 여러 월 데이터 한 번에 생성하는 함수
// 날짜 수정
async function generateAllMonths() {
    const months = [
        '2024.06', '2024.07', '2024.08', '2024.09', '2024.10', '2024.11', '2024.12',
        '2025.01', '2025.02', '2025.03', '2025.04', '2025.05',
    ];

    let connection;
    
    try {
        console.log('🔄 DB 연결 중...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ DB 연결 성공!');

        // public/data 폴더 생성
        const dataDir = './public/data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        for (const month of months) {
            console.log(`🔄 ${month} 데이터 처리 중...`);
            
            const [rows] = await connection.execute(`
                SELECT 
                    RANK_ID,
                    RANK_COUNTRY,
                    RANK_PRODUCT,
                    RANK_CATEGORY,
                    EXPORT_VALUE,
                    IMPORT_VALUE,
                    RANK_PERIOD,
                    CREATED_AT
                FROM RANKING_TABLE 
                WHERE RANK_PERIOD = ?
                ORDER BY (EXPORT_VALUE + IMPORT_VALUE) DESC
            `, [month]);

            if (rows.length > 0) {
                const fileName = `trade-${month.replace('.', '-')}.json`;
                const jsonData = JSON.stringify(rows, null, 2);
                fs.writeFileSync(`${dataDir}/${fileName}`, jsonData);
                console.log(`✅ ${fileName} 생성 완료 (${rows.length}개 데이터)`);
            } else {
                console.log(`⚠️ ${month} 데이터 없음`);
            }
        }

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 실행할 함수 선택
const args = process.argv.slice(2);
if (args.includes('--all')) {
    generateAllMonths();
} else {
    generateTradeJson();
}