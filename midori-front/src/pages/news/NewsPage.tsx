import { useEffect, useState } from "react";
import axios from "axios";
import { Newspaper, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-6 h-6 text-[#9AD970]" />
        <h1 className="text-2xl font-bold">친환경 뉴스</h1>
        {!loading && !error && news.length > 0 && (
          <span className="text-sm text-gray-500 ml-auto">
            총 {news.length}개 기사 중 {startIndex + 1}-{Math.min(endIndex, news.length)}번째
          </span>
        )}
      </div>

      {loading && (
        <div className="text-gray-500 animate-pulse">뉴스를 불러오는 중...</div>
      )}
      
      {error && (
        <div className="text-red-500 font-semibold">{error}</div>
      )}
      
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentNews.length === 0 ? (
              <div className="text-gray-500 col-span-full">뉴스 결과가 없습니다.</div>
            ) : (
              currentNews.map((item, idx) => (
                <Card key={startIndex + idx} className="p-4 shadow-sm h-fit">
                  <a
                    href={item.originallink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline hover:text-[#9AD970] transition block"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                  <div
                    className="text-gray-700 text-sm mt-2"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                  <div className="text-xs text-gray-500 mt-2">{item.pubDate}</div>
                </Card>
              ))
            )}
          </div>

          {/* 페이징 컨트롤 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {/* 첫 페이지 버튼 */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="첫 페이지"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* 이전 페이지 버튼 */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                이전
              </button>

              {/* 페이지 번호들 */}
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    pageNum === currentPage
                      ? 'text-white bg-[#9AD970] border border-[#9AD970]'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* 다음 페이지 버튼 */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>

              {/* 마지막 페이지 버튼 */}
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="마지막 페이지"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPage;