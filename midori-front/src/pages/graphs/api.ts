import axios from 'axios';
import type { ApiTradeData } from "./types";
import { countryCodeMap, hsCodeMap } from "../../data/constants";

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

        const transformedData: ApiTradeData[] = [];
        
        extractedDataArray.forEach((item: any, index: number) => {
            const trimmedItemStatKor = String(item.statKor || '').trim();
            const trimmedApiStatKorName = String(productInfo.statKorName || '').trim();

            if (item.statKor && item.statKor !== '-' && item.statKor !== '총계' && 
                (productInfo.statKorName ? trimmedItemStatKor === trimmedApiStatKorName : true)) {
                
                let monthExtracted = index + 1;
                if (item.year) {
                    const yearStr = String(item.year);
                    const dotIndex = yearStr.indexOf('.');
                    if (dotIndex !== -1 && dotIndex < yearStr.length - 1) {
                        monthExtracted = parseInt(yearStr.slice(dotIndex + 1), 10);
                    }
                }
                
                if (isNaN(monthExtracted) || monthExtracted < 1 || monthExtracted > 12) {
                    monthExtracted = index + 1;
                }

                transformedData.push({
                    month: monthExtracted,
                    exportValue: parseFloat(item.expDlr?.toString() || '0'),
                    importValue: parseFloat(item.impDlr?.toString() || '0'),
                    growthRate: parseFloat((item.growthRate || item.rate || item.growthRatio || 0).toString()),
                    year: parseInt(year),
                    country: country,
                    product: productInfo.statKorName || hsCodeParam
                });
            }
        });
        
        return transformedData;
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
}; 