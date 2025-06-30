export const countries = [
    "미국",
    "중국",
    "일본",
    "베트남",
    "영국",
    "독일",
    "프랑스",
    "인도",
    "대만",
    "태국",
    "호주",
];

export const products = [
    "태양광 패널",
    "풍력 터빈용 발전기",
    "전력 변환장치 (인버터)",
    "태양열 집열기",
    "전기자동차",
    "전기 이륜차",
    "전기차용 리튬이온 배터리",
    "실리콘 식기/빨대",
    "금속 빨대",
    "종이 빨대",
    "포장재",
    "천연 성분 세제",
    "천연 고무 라텍스",
    "유기농 면화",
    "천연 비료",
    "슬래그 울",
    "단열재",
];

export const productsWithHS = products.map((name, idx) => ({
    name,
    hs: (100000 + idx + 1).toString(), // 예시: 100001, 100002, ...
}));

export const statCd = [
    "US", "CN", "JP", "VN", "GB", "DE", "FR", "IN", "TW", "TH", "AU"
]; 