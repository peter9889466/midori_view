import { BarChart3, LineChart as LineChartIcon, Layers } from "lucide-react";
import type { ChartType, HsCodeInfo } from "../types/types";

export const chartTypes: ChartType[] = [
    { id: "bar", icon: BarChart3, label: "Bar" },
    { id: "line", icon: LineChartIcon, label: "Line" },
    { id: "combined", icon: Layers, label: "Combined" },
];

export const DEFAULT_COUNTRIES = ['미국', '중국', '일본', '베트남', '영국', '독일', '프랑스', '인도', '대만', '태국', '호주'];

export const countryCodeMap: { [key: string]: string } = {
    '미국': 'US', '중국': 'CN', '일본': 'JP', '독일': 'DE', '프랑스': 'FR',
    '영국': 'GB', '인도': 'IN', '베트남': 'VN', '태국': 'TH', '호주': 'AU', '대만': 'TW'
};

export const hsCodeMap: { [key: string]: HsCodeInfo } = {
    '천연 비료': { code: '310100', statKorName: undefined },
    '천연 성분 세제': { code: '340290', statKorName: undefined },
    '실리콘 식기/빨대': { code: '392490', statKorName: undefined },
    '천연 고무 라텍스': { code: '400110', statKorName: undefined },
    '종이 빨대, 포장재': { code: '482390', statKorName: undefined },
    '유기농 면화': { code: '520100', statKorName: undefined },
    '슬래그 울, 단열재': { code: '680610', statKorName: undefined },
    '금속 빨대': { code: '821599', statKorName: undefined },
    '태양열 집열기': { code: '841919', statKorName: undefined },
    '풍력 터빈용 발전기': { code: '850231', statKorName: undefined },
    '전력 변환장치 (인버터)': { code: '850440', statKorName: undefined },
    '전기차용 리튬이온 배터리': { code: '850760', statKorName: undefined },
    '태양광 패널': { code: '854140', statKorName: undefined },
    '전기자동차': { code: '870380', statKorName: undefined },
    '전기 이륜차': { code: '871160', statKorName: undefined },
    'ESS배터리': { code: '8507603000', statKorName: '에너지 저장장치용' },
    '기타배터리': { code: '8507609000', statKorName: '기타' },
    '반도체': { code: '854211', statKorName: '반도체' },
    '컴퓨터': { code: '847130', statKorName: '컴퓨터' },
};

// 제품 설명 데이터
export const productDescriptions: { [key: string]: string } = {
    "310100": "화학 성분이 포함되지 않은 저탄소 농업용 비료로, 유기농 인증 농산물 생산에 필수적인 품목입니다.",
    "340290": "저자극성과 생분해성을 갖춘 친환경 세정제로, 환경성 질환 증가로 수요가 급증하고 있습니다.",
    "392490": "재사용이 가능하여 생활 폐기물을 줄일 수 있는 친환경 제품으로, 제로웨이스트 문화 확산과 함께 인기를 끌고 있습니다.",
    "400110": "생분해 가능한 생물 유래 소재로, 탄소중립에 기여할 수 있는 친환경 원료입니다.",
    "482390": "생분해 가능한 친환경 대체재로, 플라스틱 사용 규제로 인해 시장이 급성장하고 있습니다.",
    "520100": "생분해성이 뛰어난 천연 섬유로, 농약 없이 재배되어 지속가능 패션 수요에 대응하고 있습니다.",
    "680610": "폐철강 부산물을 재활용한 단열 성능이 우수한 친환경 건축 자재입니다.",
    "821599": "일회용품 대체용으로 반복 사용 가능한 스테인리스 빨대 등 친환경 식기입니다.",
    "841919": "태양 에너지를 열에너지로 변환하는 장비로, 친환경 난방·급탕 시설에 활용됩니다.",
    "850231": "풍력 자원을 활용한 재생에너지 발전 장비로, 해상풍력 확대에 따라 시장이 성장 중입니다.",
    "850440": "신재생 에너지를 효율적으로 운용하기 위한 핵심 장치로, ESS 연계 기술과 함께 중요성이 커지고 있습니다.",
    "850760": "무공해 전기차에 사용되는 에너지 저장 장치로, 미래 핵심 산업으로 주목받고 있습니다.",
    "854140": "태양 에너지를 전기로 변환하는 핵심 장비로, 탄소세 도입과 함께 설치가 급속히 확산되고 있습니다.",
    "870380": "배출가스가 없는 무공해 운송 수단으로, 전 세계적으로 보급 확대가 추진되고 있습니다.",
    "871160": "전기 구동 방식의 친환경 이륜차로, 도심 배송과 마이크로 모빌리티 수요로 급성장 중입니다.",
};

export const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: '월별 수출입액' },
    },
    scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, title: { display: true, text: '금액 ($)' } },
    },
};

export const mixedChartOptions = {
    ...chartOptions,
    plugins: {
        ...chartOptions.plugins,
        title: { display: true, text: '월별 수출입액 (혼합)' },
    },
}; 