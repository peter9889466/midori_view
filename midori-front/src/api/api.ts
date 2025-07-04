import axios from 'axios';
import type { ApiTradeData } from "../types/types";
import { countryCodeMap, hsCodeMap } from "../data/constants";

export const fetchTradeDataByHsCode = async (hsCodeParam: string, country: string, year: string): Promise<ApiTradeData[]> => {
    try {
        const countryCode = countryCodeMap[country] || 'US';
        const productInfo = Object.values(hsCodeMap).find(item => item.code === hsCodeParam);
        
        if (!productInfo) {
            console.error(`HS Code '${hsCodeParam}' not found in hsCodeMap.`);
            return [];
        }

        const response = await axios.get('http://localhost:8088/MV/api/data', {
            params: {
                start: `${year}01`,
                end: `${year}12`,
                country: countryCode,
                hs: productInfo.code
            },
            timeout: 10000,
        });
        
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
                    
                    // 한 자리 숫자이면서 실제로는 10, 11, 12월인 경우 처리
                    // (데이터 순서를 보고 판단 - 이 부분은 실제 데이터에 따라 조정 필요)
                    if (monthStr.length === 1 && parsedMonth >= 1 && parsedMonth <= 3) {
                        // 10, 11, 12월 처리 로직이 필요하다면 여기에 추가
                        // 예: 순서상 10월 이후라면 parsedMonth += 9
                    }
                    
                    if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
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
        console.error('API 호출 에러:', error);
        throw error;
    }
};