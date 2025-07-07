import axios from 'axios';
import type { ApiTradeData } from "../types/types";
import { countryCodeMap, hsCodeMap } from "../data/constants";

// 환경별 API URL 설정
const getApiUrls = () => {
    if (process.env.NODE_ENV === 'development') {
        // 개발환경: 외부 서버 우선, 실패시 로컬 서버
        return [
            'http://49.50.134.156:8088/MV/api/data',
            'http://localhost:8088/MV/api/data'
        ];
    } else {
        // 배포환경: 실제 서버만 사용
        return ['http://49.50.134.156:8088/MV/api/data'];
    }
};

// API 호출 시도 함수
const tryApiCall = async (urls: string[], params: any): Promise<any> => {
    for (const url of urls) {
        try {
            const response = await axios.get(url, {
                params,
                timeout: 5000, // 5초 타임아웃으로 빠른 전환
            });
            return response;
        } catch (error) {
            console.log(`${url} 연결 실패, 다음 서버 시도 중...`);
            // 마지막 URL이 아니면 계속 시도
            if (url !== urls[urls.length - 1]) {
                continue;
            }
            // 모든 URL 실패시 에러 throw
            throw error;
        }
    }
};

export const fetchTradeDataByHsCode = async (hsCodeParam: string, country: string, year: string): Promise<ApiTradeData[]> => {
    try {
        const countryCode = countryCodeMap[country] || 'US';
        const productInfo = Object.values(hsCodeMap).find(item => item.code === hsCodeParam);
        
        if (!productInfo) {
            console.error(`HS Code '${hsCodeParam}' not found in hsCodeMap.`);
            return [];
        }

        const apiUrls = getApiUrls();
        const params = {
            start: `${year}01`,
            end: `${year}12`,
            country: countryCode,
            hs: productInfo.code
        };

        const response = await tryApiCall(apiUrls, params);
        
        let responseData = response.data;
        if (typeof responseData === 'string') {
            responseData = JSON.parse(responseData);
        }

        let extractedDataArray: any[] = [];
        
        if (responseData?.response?.body?.items?.item) {
            extractedDataArray = Array.isArray(responseData.response.body.items.item) 
                ? responseData.response.body.items.item 
                : [responseData.response.body.items.item];
        } else if (responseData?.item && Array.isArray(responseData.item)) {
            extractedDataArray = responseData.item;
        }

        // 유효한 데이터만 필터링
        const validItems = extractedDataArray.filter((item: any) => {
            const trimmedItemStatKor = String(item.statKor || '').trim();
            const trimmedApiStatKorName = String(productInfo.statKorName || '').trim();

            return item.statKor && item.statKor !== '-' && item.statKor !== '총계' && 
                   (productInfo.statKorName ? trimmedItemStatKor === trimmedApiStatKorName : true);
        });

        // 월별로 그룹화 (같은 월의 여러 제품 데이터를 합치기)
        const monthlyData: { [key: number]: any } = {};

        validItems.forEach((item: any) => {
            // year 필드에서 월 추출
            let monthExtracted = 1;
            if (item.year) {
                const yearStr = String(item.year);
                const dotIndex = yearStr.indexOf('.');
                if (dotIndex !== -1 && dotIndex < yearStr.length - 1) {
                    const monthStr = yearStr.slice(dotIndex + 1);
                    let parsedMonth = parseInt(monthStr, 10);
                    
                    // 한 자리 숫자 처리 - 실제로는 10, 11, 12월
                    if (monthStr.length === 1) {
                        if (parsedMonth === 1) {
                            monthExtracted = 10;  // 2024.1 → 10월
                        } else if (parsedMonth === 2) {
                            monthExtracted = 11;  // 2024.2 → 11월  
                        } else if (parsedMonth === 3) {
                            monthExtracted = 12;  // 2024.3 → 12월
                        } else {
                            monthExtracted = parsedMonth;
                        }
                    } else if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
                        monthExtracted = parsedMonth;
                    }
                }
            }

            // 해당 월의 데이터가 이미 있으면 누적, 없으면 새로 생성
            if (monthlyData[monthExtracted]) {
                monthlyData[monthExtracted].exportValue += parseFloat(item.expDlr?.toString() || '0');
                monthlyData[monthExtracted].importValue += parseFloat(item.impDlr?.toString() || '0');
            } else {
                monthlyData[monthExtracted] = {
                    month: monthExtracted,
                    exportValue: parseFloat(item.expDlr?.toString() || '0'),
                    importValue: parseFloat(item.impDlr?.toString() || '0'),
                    growthRate: parseFloat((item.growthRate || item.rate || item.growthRatio || 0).toString()),
                    year: parseInt(year),
                    country: country,
                    product: productInfo.statKorName || hsCodeParam
                };
            }
        });

        // 월별 데이터를 배열로 변환하고 정렬
        const transformedData: ApiTradeData[] = Object.values(monthlyData).sort((a, b) => a.month - b.month);
        
        return transformedData;
    } catch (error) {
        console.error('모든 API 서버 연결 실패:', error);
        throw error;
    }
};