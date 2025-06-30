export interface TradeData {
    statKor: string;
    expDlr: number;
    impDlr: number;
    year: string;
    statCd: string;
    statCdCntnKor1: string;
    balPayments: number;
    impWgt: number;
    hsCd: string;
    expWgt: number;
}

export type SortField = "expDlr" | "impDlr" | "balPayments";
export type SortOrder = "asc" | "desc";

export interface SortConfig {
    field: SortField;
    order: SortOrder;
}
