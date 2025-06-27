export interface TradeData {
    id: number;
    rank: number;
    item: string;
    exportAmount: number;
    importAmount: number;
    totalTradeAmount: number;
}

export type SortField = "exportAmount" | "importAmount" | "totalTradeAmount";
export type SortOrder = "asc" | "desc";

export interface SortConfig {
    field: SortField;
    order: SortOrder;
}
