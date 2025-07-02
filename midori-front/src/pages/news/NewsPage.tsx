import { useEffect, useState } from "react";
import axios from "axios";
import { Newspaper, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

const NewsPage = () => {
  const [news, setNews] = useState<NaverNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10; // 한 페이지에 10개 기사 (2열 x 5행)
  const totalPages = Math.ceil(news.length / itemsPerPage);

  // 현재 페이지에 표시할 뉴스 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = news.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/MV/api/news"); // Spring Boot에서 프록시 처리
        setNews(res.data.items ?? []);
        console.log(res)
      } catch (err) {
        setError("뉴스를 불러오는 데 실패했습니다.");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // 페이지 변경 함수
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 변경 시 상단으로 스크롤
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 끝 페이지가 총 페이지보다 적으면 시작 페이지 조정
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9AD970] rounded-full mb-4 shadow-lg">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            친환경 뉴스
          </h1>
          <p className="text-gray-600 text-lg">지구를 위한 따뜻한 소식들</p>
          {!loading && !error && news.length > 0 && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <div className="w-2 h-2 bg-[#9AD970] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                총 {news.length}개 기사 중 {startIndex + 1}-{Math.min(endIndex, news.length)}번째
              </span>
            </div>
          )}
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#9AD970] rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">뉴스를 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ExternalLink className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-semibold text-lg">{error}</p>
          </div>
        )}

        {/* 뉴스 그리드 */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {currentNews.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Newspaper className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">뉴스 결과가 없습니다.</p>
                </div>
              ) : (
                currentNews.map((item, idx) => (
                  <Card
                    key={startIndex + idx}
                    className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-white hover:to-green-50/50 border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => window.open(item.originallink, '_blank', 'noopener,noreferrer')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.open(item.originallink, '_blank', 'noopener,noreferrer'); }}
                  >
                    {/* 카드 상단 그라데이션 라인 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#9AD970]"></div>

                    <div className="p-6">
                      {/* 제목 */}
                      <div
                        className="block font-bold text-lg leading-tight text-gray-800 group-hover:text-[#8BC760] mb-3 transition-colors duration-200"
                        dangerouslySetInnerHTML={{ __html: item.title }}
                      />

                      {/* 설명 */}
                      <div
                        className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />

                      {/* 하단 메타 정보 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{item.pubDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#9AD970] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span>더 보기</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* 페이징 컨트롤 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200">
                  {/* 첫 페이지 버튼 */}
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                    title="첫 페이지"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* 이전 페이지 버튼 */}
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center px-4 h-10 text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">이전</span>
                  </button>

                  {/* 페이지 번호들 */}
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`flex items-center justify-center w-10 h-10 text-sm font-semibold rounded-lg transition-all duration-200 ${pageNum === currentPage
                          ? 'text-white bg-[#9AD970] shadow-md'
                          : 'text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* 다음 페이지 버튼 */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center px-4 h-10 text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                  >
                    <span className="text-sm font-medium">다음</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>

                  {/* 마지막 페이지 버튼 */}
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-10 h-10 text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                    title="마지막 페이지"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;