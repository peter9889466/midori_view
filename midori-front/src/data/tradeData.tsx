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
