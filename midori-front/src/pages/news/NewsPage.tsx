import { useEffect, useState } from "react";
import axios from "axios";
import { Newspaper } from "lucide-react";
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

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/news"); // Spring Boot에서 프록시 처리
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

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-6 h-6 text-[#9AD970]" />
        <h1 className="text-2xl font-bold">친환경 네이버 뉴스</h1>
      </div>
      {loading && (
        <div className="text-gray-500 animate-pulse">뉴스를 불러오는 중...</div>
      )}
      {error && (
        <div className="text-red-500 font-semibold">{error}</div>
      )}
      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {news.length === 0 ? (
            <div className="text-gray-500">뉴스 결과가 없습니다.</div>
          ) : (
            news.map((item, idx) => (
              <Card key={idx} className="p-4 shadow-sm">
                <a
                  href={item.originallink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline hover:text-[#9AD970] transition"
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
      )}
    </div>
  );
};

export default NewsPage;
