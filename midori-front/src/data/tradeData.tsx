import type { TradeData } from "../types/rankings";

export const generateTradeData = (): TradeData[] => {
    const items = [
        "반도체",
        "자동차",
        "석유화학",
        "철강",
        "조선",
        "디스플레이",
        "휴대폰",
        "컴퓨터",
        "의류",
        "화장품",
        "기계류",
        "전자부품",
        "플라스틱",
        "섬유",
        "식품",
    ];

    return items.map((item, index) => {
        const exportAmount = Math.floor(Math.random() * 50000) + 10000;
        const importAmount = Math.floor(Math.random() * 40000) + 5000;
        const totalTradeAmount = exportAmount + importAmount;

        return {
            id: index + 1,
            rank: index + 1,
            item,
            exportAmount,
            importAmount,
            totalTradeAmount,
        };
    });
};
