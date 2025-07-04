export interface ApiTradeData {
    month: number;
    exportValue: number;
    importValue: number;
    growthRate?: number;
    year: number;
    country: string;
    product: string;
}

export interface ChartType {
    id: string;
    icon: any;
    label: string;
}

export interface HsCodeInfo {
    code: string;
    statKorName?: string;
} 