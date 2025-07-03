import { useNews } from "@/components/news/useNews";
import NewsHeader from "@/components/news/NewsHeader";
import NewsGrid from "@/components/news/NewsGrid";
import NewsPagination from "@/components/news/NewsPagination";


const NewsPage = () => {
  const {
    news,
    loading,
    error,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentNews,
    goToPage,
    goToPrevPage,
    goToNextPage,
    getPageNumbers,
  } = useNews();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <NewsHeader
          loading={loading}
          error={error}
          newsLength={news.length}
          startIndex={startIndex}
          endIndex={endIndex}
        />

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
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            </div>
            <p className="text-red-600 font-semibold text-lg">{error}</p>
          </div>
        )}

        {/* 뉴스 그리드 */}
        <NewsGrid
          loading={loading}
          error={error}
          currentNews={currentNews}
          startIndex={startIndex}
        />

        {/* 페이징 컨트롤 */}
        <NewsPagination
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
          goToPrevPage={goToPrevPage}
          goToNextPage={goToNextPage}
          getPageNumbers={getPageNumbers}
        />
      </div>
    </div>
  );
};

export default NewsPage;