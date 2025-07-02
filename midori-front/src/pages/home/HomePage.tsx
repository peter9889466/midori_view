import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { BarChart3, Newspaper, Trophy, Leaf, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { products } from "@/components/constants";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import axios from "axios";
import Markdown from 'react-markdown';


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

export default function HomePage() {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(["userProducts"]);
    // 관심품목 3개를 쿠키에서 가져오고, 없으면 빈 값 3개
    const [selectedProducts, setSelectedProducts] = useState<string[]>(
        Array.isArray(cookies.userProducts) && cookies.userProducts.length === 3
            ? cookies.userProducts
            : ["", "", ""]
    );
    // 쿠키에 저장
    useEffect(() => {
        setCookie("userProducts", selectedProducts, { path: "/", maxAge: 60 * 60 * 24 * 30 }); // 30일
    }, [selectedProducts, setCookie]);


    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    // 뉴스 상태 추가
    const [news, setNews] = useState<{ title: string; originallink: string }[]>([]);
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState<string | null>(null);


    useEffect(() => {
        setNewsLoading(true);
        axios.get("/MV/api/news")
            .then(res => {
                const items = res.data.items ?? [];
                setNews(
                    items.slice(0, 3).map((item: any) => ({
                        title: item.title.replace(/<[^>]+>/g, ""),
                        originallink: item.originallink
                    }))
                );
            })
            .catch(() => setNewsError("뉴스를 불러오는 데 실패했습니다."))
            .finally(() => setNewsLoading(false));
    }, []);

    // 중복 방지: 이미 선택된 값은 다른 Select에서 비활성화
    const getAvailableOptions = (idx: number) =>
        products.filter(
            (item) => !selectedProducts.includes(item) || selectedProducts[idx] === item
        );

    const handleSelectChange = (idx: number, value: string) => {
        setSelectedProducts((prev) => {
            const copy = [...prev];
            copy[idx] = value;
            return copy;
        });
        setEditingIdx(null);
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center">
            <div className="container mx-auto px-4 py-12 space-y-16 flex flex-col justify-center items-center flex-1">

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

                {/* 2. 관심품목 */}
                <div className="space-y-8 py-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-[#6AAE4A] to-[#9AD970] bg-clip-text text-transparent">
                            관심품목
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            관심 있는 품목을 선택하여 실시간 동향과 데이터를 확인하세요
                        </p>
                    </div>

                    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {[0, 1, 2].map((idx) => (
                            <Card
                                key={idx}
                                className="group relative flex flex-col cursor-pointer overflow-hidden bg-white border-0 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl"
                                onClick={() => {
                                    if (selectedProducts[idx]) {
                                        navigate(`/graphs/${encodeURIComponent(selectedProducts[idx])}`);
                                    }
                                }}
                            >
                                {/* 배경 그라데이션 효과 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#9AD970]/5 via-transparent to-[#6AAE4A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* 상단 컬러 바 */}
                                <div className="h-1 bg-gradient-to-r from-[#6AAE4A] to-[#9AD970]" />

                                <CardHeader className="relative z-10 p-8 pb-4">
                                    {editingIdx === idx ? (
                                        // --- 수정 모드 ---
                                        <div
                                            className="flex items-center justify-center bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] rounded-xl p-4 border border-[#9AD970]/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingIdx(idx);
                                            }}
                                        >
                                            <Select
                                                value={selectedProducts[idx] || "__EMPTY__"}
                                                onValueChange={(value) => handleSelectChange(idx, value === "__EMPTY__" ? "" : value)}
                                                open
                                            >
                                                <SelectTrigger className="w-full border-0 bg-transparent focus:ring-2 focus:ring-[#6AAE4A] text-lg">
                                                    <SelectValue placeholder="관심품목 선택" />
                                                </SelectTrigger>
                                                <SelectContent className="border-[#9AD970]/20 shadow-xl rounded-xl">
                                                    <SelectItem value="__EMPTY__" className="text-gray-500">선택 해제</SelectItem>
                                                    {getAvailableOptions(idx).map((item) => (
                                                        <SelectItem
                                                            key={item}
                                                            value={item}
                                                            disabled={selectedProducts.includes(item) && selectedProducts[idx] !== item}
                                                            className="hover:bg-[#E8F5E9] focus:bg-[#E8F5E9]"
                                                        >
                                                            {item}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : selectedProducts[idx] ? (
                                        // --- 품목 선택 완료 ---
                                        <div
                                            className="flex items-center justify-center bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] rounded-xl p-6 border border-[#9AD970]/20 group-hover:border-[#6AAE4A]/40 transition-colors duration-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingIdx(idx);
                                            }}
                                        >
                                            <div className="text-center space-y-2">
                                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#6AAE4A] to-[#9AD970] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-2xl font-bold text-white">
                                                        {selectedProducts[idx].charAt(0)}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-[#6AAE4A] transition-colors duration-300">
                                                    {selectedProducts[idx]}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    ) : (
                                        // --- 초기 상태 ---
                                        <div
                                            className="flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 group-hover:border-[#9AD970] group-hover:bg-gradient-to-r group-hover:from-[#E8F5E9]/50 group-hover:to-[#F1F8E9]/50 transition-all duration-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingIdx(idx);
                                            }}
                                        >
                                            <div className="text-center space-y-3">
                                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 group-hover:from-[#6AAE4A] group-hover:to-[#9AD970] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                                    <Plus className="h-8 w-8 text-white" />
                                                </div>
                                                <CardTitle className="text-xl font-semibold text-gray-600 group-hover:text-[#6AAE4A] transition-colors duration-300">
                                                    관심품목 추가
                                                </CardTitle>
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="relative z-10 flex-grow p-8 pt-4">
                                    <div className="text-center space-y-4">
                                        <p className="text-gray-600 leading-relaxed text-base">
                                            {selectedProducts[idx]
                                                ? `${selectedProducts[idx]}의 최신 시장 동향과 상세한 분석 데이터를 실시간으로 확인하실 수 있습니다.`
                                                : "품목을 선택하시면 해당 상품의 상세한 시장 분석과 트렌드 정보를 제공해드립니다."
                                            }
                                        </p>

                                        {selectedProducts[idx] && (
                                            <div className="flex items-center justify-center space-x-2 text-sm text-[#6AAE4A] font-medium">
                                                <span>데이터 보기</span>
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                {/* 하단 장식 요소 */}
                                {selectedProducts[idx] && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6AAE4A] to-[#9AD970] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* === 3. 고도화된 기능 카드 (Feature Cards) === */}
                <div className="space-y-8 py-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-[#6AAE4A] to-[#9AD970] bg-clip-text text-transparent">
                            MidoriView 핵심 기능
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            농산물 시장 분석을 위한 강력하고 직관적인 도구들을 만나보세요
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4">
                        {homeCards.map((card) => (
                            <Card
                                key={card.id}
                                className="group relative flex flex-col overflow-hidden bg-white border-0 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-2xl"
                            >
                                {/* 배경 그라데이션 효과 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#9AD970]/5 via-transparent to-[#6AAE4A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* 상단 컬러 바 */}
                                <div className="h-1 bg-gradient-to-r from-[#6AAE4A] to-[#9AD970]" />

                                <CardHeader className="relative z-10 p-8 pb-4 text-center">
                                    <div className="space-y-4">
                                        {/* 아이콘 컨테이너 */}
                                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#E8F5E9] to-[#F1F8E9] rounded-2xl flex items-center justify-center border border-[#9AD970]/20 group-hover:border-[#6AAE4A]/40 group-hover:scale-110 transition-all duration-300">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#6AAE4A] to-[#9AD970] rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                                <card.icon className="h-7 w-7 text-white" />
                                            </div>
                                        </div>

                                        {/* 제목 */}
                                        <CardTitle className="text-2xl font-bold text-gray-800 group-hover:text-[#6AAE4A] transition-colors duration-300">
                                            {card.name}
                                        </CardTitle>

                                        {/* 부제목 */}
                                        <CardDescription className="text-lg text-gray-500 leading-relaxed">
                                            {card.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="relative z-10 flex-grow p-8 pt-4">
                                    <div className="text-center space-y-4">
                                        <p className="text-gray-600 leading-relaxed text-base">
                                            {card.detail}
                                        </p>
                                    </div>
                                </CardContent>

                                {/* 하단 장식 요소 */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6AAE4A] to-[#9AD970] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </Card>
                        ))}

                    </div>
                </div>


                {/* === 4. [신규] 최신 관련 뉴스 === */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">최신 관련 뉴스</h2>
                    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                        {newsLoading ? (
                            <div className="text-center text-gray-500">뉴스를 불러오는 중...</div>
                        ) : newsError ? (
                            <div className="text-center text-red-500">{newsError}</div>
                        ) : (
                            <ul className="space-y-4">
                                {news.map((item, idx) => (
                                    <li key={idx} className="border-b pb-3 last:border-b-0 last:pb-0">
                                        <a
                                            href={item.originallink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-lg font-semibold text-gray-800 hover:text-[#9AD970] transition"
                                        >
                                            <Markdown>
                                                {item.title}
                                            </Markdown>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
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