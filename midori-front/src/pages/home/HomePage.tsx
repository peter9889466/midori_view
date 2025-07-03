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
import axios from "axios";
import ReactModal from "react-modal";
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

const productToHscode: { [key: string]: string } = {
    "태양광 패널": "854140",
    "풍력 터빈용 발전기": "850231",
    "전력 변환장치 (인버터)": "850440",
    "태양열 집열기": "841919",
    "전기자동차": "870380",
    "전기 이륜차": "871160",
    "전기차용 리튬이온 배터리": "850760",
    "실리콘 식기/빨대": "392490",
    "금속 빨대": "821599",
    "종이 빨대, 포장재": "482390",
    "천연 성분 세제": "340290",
    "천연 고무 라텍스": "400110",
    "유기농 면화": "520100",
    "천연 비료": "310100",
    "슬래그 울, 단열재": "680610"
}

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

    const [modalIsOpen, setModalIsOpen] = useState(false);

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

    const products = [
        "태양광 패널",
        "풍력 터빈용 발전기",
        "전력 변환장치 (인버터)",
        "태양열 집열기",
        "전기자동차",
        "전기 이륜차",
        "전기차용 리튬이온 배터리",
        "실리콘 식기/빨대",
        "금속 빨대",
        "종이 빨대, 포장재",
        "천연 성분 세제",
        "천연 고무 라텍스",
        "유기농 면화",
        "천연 비료",
        "슬래그 울, 단열재"
    ];

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
                                    if (modalIsOpen) return;
                                    if (selectedProducts[idx]) {
                                        const hscode = productToHscode[selectedProducts[idx]];
                                        if (hscode) {
                                            navigate(`/graphs/${hscode}`);
                                        }
                                    }
                                }}
                            >
                                {/* 배경 그라데이션 효과 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#9AD970]/5 via-transparent to-[#6AAE4A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* 상단 컬러 바 */}
                                <div className="h-1 bg-gradient-to-r from-[#6AAE4A] to-[#9AD970]" />

                                <CardHeader className="relative z-10 p-8 pb-4">
                                    {editingIdx === idx ? (
                                        // --- 수정 모드 (모달 오픈 트리거) ---
                                        <>
                                            <div
                                                className="flex items-center justify-center bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] rounded-xl p-4 border border-[#9AD970]/20 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingIdx(idx);
                                                    setModalIsOpen(true);
                                                }}
                                            >
                                                <span className="text-lg font-semibold">품목 선택</span>
                                            </div>
                                            <ReactModal
                                                isOpen={modalIsOpen && editingIdx === idx}
                                                onRequestClose={() => setModalIsOpen(false)}
                                                ariaHideApp={false}
                                                className="fixed inset-0 flex items-center justify-center z-50 outline-none p-4 "
                                                overlayClassName="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
                                                style={{
                                                    overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
                                                    content: {
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: 0,
                                                        overflow: 'visible',
                                                        borderRadius: 0
                                                    }
                                                }}
                                            >
                                                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
                                                    {/* 헤더 */}
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h2 className="text-xl font-bold text-gray-800">관심품목 선택</h2>
                                                        <button
                                                            onClick={() => {
                                                                setModalIsOpen(false);
                                                                setEditingIdx(null);
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* 옵션 목록 */}
                                                    <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                        {/* 선택 해제 옵션 */}
                                                        <button
                                                            className={`w-[96%] text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] border-2 ${!selectedProducts[idx]
                                                                ? 'bg-red-400 text-white border-red-400 shadow-lg shadow-red-200 hover:bg-red-400 hover:border-red-500'
                                                                : 'bg-gray-50 text-gray-700 border-transparent hover:bg-red-50 hover:border-red-200 hover:text-red-300'
                                                                }`}
                                                            onClick={() => {
                                                                handleSelectChange(idx, "");
                                                                setModalIsOpen(false);
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <div className={`w-2 h-2 rounded-full mr-3 ${!selectedProducts[idx]
                                                                        ? 'bg-white'
                                                                        : 'bg-red-400'
                                                                        }`}></div>
                                                                    선택 해제
                                                                </div>
                                                                {!selectedProducts[idx] && (
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </button>

                                                        {/* 품목 옵션들 */}
                                                        {getAvailableOptions(idx).map((item) => (
                                                            <button
                                                                key={item}
                                                                className={`w-[96%] text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] border-2 ${selectedProducts[idx] === item
                                                                    ? 'bg-[#9AD970] text-white #9AD970 shadow-lg shadow-green-200'
                                                                    : selectedProducts.includes(item) && selectedProducts[idx] !== item
                                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed'
                                                                        : 'bg-gray-50 text-gray-700 border-transparent hover:bg-green-50 hover:border-green-200'
                                                                    }`}
                                                                disabled={selectedProducts.includes(item) && selectedProducts[idx] !== item}
                                                                onClick={() => {
                                                                    handleSelectChange(idx, item);
                                                                    setModalIsOpen(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <div className={`w-2 h-2 rounded-full mr-3 ${selectedProducts[idx] === item
                                                                            ? 'bg-white'
                                                                            : selectedProducts.includes(item) && selectedProducts[idx] !== item
                                                                                ? 'bg-gray-400'
                                                                                : 'bg-[#9AD970]'
                                                                            }`}></div>
                                                                        {item}
                                                                    </div>
                                                                    {selectedProducts[idx] === item && (
                                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* 푸터 */}
                                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                                        <button
                                                            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                                            onClick={() => {
                                                                setModalIsOpen(false);
                                                                setEditingIdx(null);
                                                            }}
                                                        >
                                                            닫기
                                                        </button>
                                                    </div>
                                                </div>
                                            </ReactModal>
                                        </>
                                    ) : selectedProducts[idx] ? (
                                        // --- 품목 선택 완료 ---
                                        <div
                                            className="flex items-center justify-center bg-gradient-to-r from-[#E8F5E9] to-[#F1F8E9] rounded-xl p-6 border border-[#9AD970]/20 group-hover:border-[#6AAE4A]/40 transition-colors duration-300 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingIdx(idx);
                                                setModalIsOpen(true);
                                            }}
                                        >
                                            <div className="text-center space-y-2">
                                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#6AAE4A] to-[#9AD970] rounded-full flex items-center justify-center mb-3">
                                                    <span className="text-lg font-bold font-sans text-white transition-colors duration-300">
                                                        {selectedProducts[idx].charAt(0)}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-[1.4rem] font-semibold text-gray-800 group-hover:text-[#6AAE4A] transition-colors duration-300">
                                                    {selectedProducts[idx]}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    ) : (
                                        // --- 초기 상태 ---
                                        <div
                                            className="flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 group-hover:border-[#9AD970] group-hover:bg-gradient-to-r group-hover:from-[#E8F5E9]/50 group-hover:to-[#F1F8E9]/50 transition-all duration-300 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingIdx(idx);
                                                setModalIsOpen(true);
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
                                        <CardTitle className="text-[1.4rem] font-bold text-gray-800 group-hover:text-[#6AAE4A] transition-colors duration-300">
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

                                {/* 코너 장식 */}
                                <div className="absolute top-6 right-6 w-8 h-8 border-2 border-[#9AD970]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-8 right-8 w-4 h-4 bg-[#9AD970]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </Card>
                        ))}

                    </div>
                </div>


                {/* === 4. [신규] 최신 관련 뉴스 === */}
                <div className="space-y-6">
                    <h2 className="text-center text-4xl font-bold bg-gradient-to-r from-[#6AAE4A] to-[#9AD970] bg-clip-text text-transparent">최신 관련 뉴스</h2>
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
                                            {item.title}
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