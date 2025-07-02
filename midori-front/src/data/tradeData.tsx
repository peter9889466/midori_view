import type { TradeData } from "../types/rankings";
import { countries, productsWithHS, statCd } from "../components/constants";

export const generateTradeData = (): TradeData[] => {
    const items = productsWithHS;
    return items.map((item) => {
        const expDlr = Math.floor(Math.random() * 50000) + 10000;
        const impDlr = Math.floor(Math.random() * 40000) + 5000;
        const balPayments = expDlr - impDlr;
        const totalDlr = expDlr + impDlr;
        const impWgt = Math.floor(Math.random() * 100000) + 10000;
        const expWgt = Math.floor(Math.random() * 100000) + 10000;
        const year = (() => {
            const today = new Date();
            let year = today.getFullYear();
            let month = today.getMonth();
            if (month === 0) { year -= 1; month = 12; }
            return `${year}.${month.toString().padStart(2, "0")}`;
        })();
        const countryIdx = Math.floor(Math.random() * countries.length);
        const statCdCntnKor1 = countries[countryIdx];
        const statCdVal = statCd[countryIdx % statCd.length] || "ETC";
        return {
            statKor: item.name,
            expDlr,
            impDlr,
            year,
            statCd: statCdVal,
            statCdCntnKor1,
            balPayments,
            impWgt,
            hsCd: item.hs,
            expWgt,
            totalDlr,
        };
    });
};

// 품목별 상세설명(가상 데이터)
export const hsDescriptions: Record<string, string> = {
    "태양광 패널": "태양광 에너지를 전기로 변환하는 장치로, 친환경 에너지 생산의 핵심 품목입니다.",
    "전기자동차": "배출가스가 없는 친환경 이동수단으로, 전기 배터리를 동력원으로 사용합니다.",
    "천연 성분 세제": "화학성분을 최소화하고 자연 유래 성분으로 만든 친환경 세제입니다.",
    "유기농 면화": "화학 비료와 농약을 사용하지 않고 재배한 친환경 섬유 원료입니다.",
    // ... 필요시 추가
};
