import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { BarChart3, Newspaper, Trophy, TrendingUp, Leaf, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// --- 기존 homeCards 데이터는 유지하되, 상세 설명을 활용할 것입니다. ---
const homeCards = [
    {
        id: "visualization",
        name: "데이터 \n 시각화",
        icon: BarChart3,
        description: "아름다운 차트와 그래프를 생성하세요",
        detail: "강력한 그래프 도구와 대화형 시각화를 통해 데이터 패턴을 더 깊이 이해하고 인사이트를 발견하세요."
    },
    {
        id: "ranking",
        name: "순위",
        icon: Trophy,
        description: "종합 순위 및 성과 지표를 확인하세요",
        detail: "다양한 카테고리와 기간에 걸쳐 성과 지표를 추적하고, 경쟁 현황을 분석하여 전략을 수립하세요."
    },
    {
        id: "news",
        name: "관련뉴스",
        icon: Newspaper,
        description: "친환경 제품 최신 뉴스를 확인하세요",
        detail: "실시간 뉴스와 업계 동향을 통해 빠르게 변화하는 시장 상황을 놓치지 않고 기회를 포착하세요."
    }
];

// --- [신규] 최신 뉴스 샘플 데이터 ---
const latestNews = [
    { id: 1, title: "정부, 2025년 친환경 포장재 의무 사용 비율 확대 발표", source: "환경일보" },
    { id: 2, title: "글로벌 컨설팅 그룹, 'ESG 경영'이 기업 가치에 미치는 영향 보고서 공개", source: "비즈니스위크" },
    { id: 3, title: "소비자 78%, '조금 더 비싸도 친환경 제품 구매 의향 있다'", source: "리서치 기관 A" },
];

// 관심품목 3개를 localStorage 또는 예시로 가져오기 (실제 연동 시 수정)
const getUserProducts = () => {
    // 실제로는 로그인 유저 정보에서 가져와야 함
    const saved = localStorage.getItem("userProducts");
    if (saved) return JSON.parse(saved);
    // 저장된 값이 없으면 빈 배열 반환
    return [];
};

export default function HomePage() {
    const navigate = useNavigate();
    const [userProducts, setUserProducts] = useState<string[]>([]);

    useEffect(() => {
        setUserProducts(getUserProducts());
    }, []);

    // 관심품목 3개를 카드에 매핑
    const previewMetrics = userProducts.slice(0, 3).map((prod, idx) => {
        // 카드별 아이콘/타이틀/설명 예시
        const icons = [Trophy, TrendingUp, Building2];
        const titles = ["금주 최고 순위 제품", "친환경 시장 성장률", "주목할 만한 기업"];
        const descriptions = [
            `${prod} 카테고리 1위 달성`,
            `${prod}의 친환경 성장률`,
            `${prod} 관련 특허/기술/기업 소식`,
        ];
        return {
            title: titles[idx] || "관심품목",
            value: prod,
            Icon: icons[idx] || Trophy,
            description: descriptions[idx] || prod,
        };
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 space-y-16">

                {/* === 1. 강화된 Hero Section === */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white border-4 border-[#9AD970] p-2 shadow-md">
                            <Leaf size={48} className="text-[#6AAE4A]" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                        데이터로 발견하는 녹색 미래, MidoriView
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        복잡한 친환경 데이터를 직관적인 시각 자료와 깊이 있는 분석으로 명쾌하게 해석해 드립니다.
                        시장의 흐름을 읽고, 기회를 발견하고, 현명한 의사결정을 내리세요.
                    </p>
                </div>

                {/* === 2. [신규] 오늘의 주요 지표 (Dashboard Preview) === */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">user의 관심품목</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {previewMetrics.map((metric, index) => (
                            <Card key={index} className="transform hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg border-t-4 border-[#9AD970]">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">{metric.title}</CardTitle>
                                    <metric.Icon className="h-5 w-5 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                                    <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>


                {/* === 3. 고도화된 기능 카드 (Feature Cards) === */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">MidoriView 핵심 기능</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {homeCards.map((card) => (
                            <Card
                                key={card.id}
                                className="flex flex-col cursor-pointer transform hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg border-t-4 border-[#9AD970]"
                            >
                                <CardHeader className="items-center text-center">
                                    <div className="flex flex-row items-center justify-center p-4 bg-[#E8F5E9] rounded-full gap-6 mb-4">
                                        <card.icon className="h-8 w-8 text-[#6AAE4A]" />
                                        <CardTitle className="text-xl font-semibold text-gray-800 mt-2">{card.name}</CardTitle>
                                    </div>
                                    <CardDescription className="text-base text-gray-500">{card.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-gray-600 text-center">{card.detail}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* === 4. [신규] 최신 관련 뉴스 === */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">최신 관련 뉴스</h2>
                    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                        <ul className="space-y-4">
                            {latestNews.map(news => (
                                <li key={news.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                                    <a href="#" className="group">
                                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#6AAE4A] transition-colors">{news.title}</h3>
                                        <p className="text-sm text-gray-500">{news.source}</p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="text-center mt-6">
                            <button
                                onClick={() => navigate('/news')}
                                className="text-[#6AAE4A] font-semibold hover:underline"
                            >
                                모든 뉴스 보기 →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}