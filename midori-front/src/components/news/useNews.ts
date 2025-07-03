import { useEffect, useState } from "react";
import axios from "axios";

export interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

export const useNews = () => {
  const [news, setNews] = useState<NaverNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(news.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = news.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/MV/api/news");
        setNews(res.data.items ?? []);
      } catch (err) {
        setError("뉴스를 불러오는 데 실패했습니다.");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goToPrevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return {
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
  };
}; 