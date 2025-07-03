import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

interface NewsPaginationProps {
  totalPages: number;
  currentPage: number;
  goToPage: (page: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  getPageNumbers: () => number[];
}

const NewsPagination = ({ totalPages, currentPage, goToPage, goToPrevPage, goToNextPage, getPageNumbers }: NewsPaginationProps) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
          title="첫 페이지"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="flex items-center justify-center px-4 h-10 text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">이전</span>
        </button>
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
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center px-4 h-10 text-gray-600 bg-transparent hover:bg-[#9AD970] hover:text-white rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
        >
          <span className="text-sm font-medium">다음</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
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
  );
};

export default NewsPagination; 